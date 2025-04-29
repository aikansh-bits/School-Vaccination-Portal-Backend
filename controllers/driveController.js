import Drive from "../models/Drive.js";

// Get all drives
export const getAllDrives = async (req, res) => {
  try {
    const drives = await Drive.find().sort({ scheduledDate: 1 });
    res.status(200).json({
      status: "success",
      data: drives,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create a new drive
export const createDrive = async (req, res) => {
  try {
    const {
      vaccineName,
      scheduledDate,
      dosesAvailable,
      applicableClasses,
      createdBy,
    } = req.body;

    if (
      !vaccineName ||
      !scheduledDate ||
      !dosesAvailable ||
      !applicableClasses ||
      !createdBy
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required" });
    }

    // Validate: scheduledDate must be at least 15 days from today
    const today = new Date();
    const scheduleDateObj = new Date(scheduledDate);
    const diffDays = (scheduleDateObj - today) / (1000 * 60 * 60 * 24);

    if (diffDays < 2) {
      return res.status(400).json({
        status: "error",
        message: "Scheduled date must be at least 2 days from today",
      });
    }

    const newDrive = new Drive({
      vaccineName,
      scheduledDate, // <-- the user entered future date
      dosesAvailable,
      applicableClasses,
      createdBy,
    });

    const savedDrive = await newDrive.save();

    res.status(201).json({ status: "success", data: savedDrive });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update Drive
export const updateDrive = async (req, res) => {
  try {
    const { driveId } = req.params;
    const updates = req.body;

    const drive = await Drive.findById(driveId);

    if (!drive) {
      return res
        .status(404)
        .json({ status: "error", message: "Drive not found" });
    }

    if (new Date(drive.scheduledDate) < new Date()) {
      return res
        .status(400)
        .json({ status: "error", message: "Cannot edit a past drive." });
    }

    const updatedDrive = await Drive.findByIdAndUpdate(driveId, updates, {
      new: true,
    });
    res.status(200).json({ status: "success", data: updatedDrive });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Upcoming Drive
export const getUpcomingDrives = async (req, res) => {
  try {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const drives = await Drive.find({
      scheduledDate: { $gte: today, $lte: next30Days },
    });

    res.status(200).json({ status: "success", data: drives });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
