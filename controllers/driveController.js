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

    const scheduleDateObj = new Date(scheduledDate);
    scheduleDateObj.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = (scheduleDateObj - today) / (1000 * 60 * 60 * 24);

    if (diffDays < 15) {
      return res.status(400).json({
        status: "error",
        message: "Scheduled date must be at least 15 days from today",
      });
    }

    // Check for overlapping drive (same date)
    const existingDrive = await Drive.findOne({
      scheduledDate: scheduleDateObj,
    });
    if (existingDrive) {
      return res.status(400).json({
        status: "error",
        message: "A drive is already scheduled on this date",
      });
    }

    const newDrive = new Drive({
      vaccineName,
      scheduledDate: scheduleDateObj,
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduledDate = new Date(drive.scheduledDate);
    scheduledDate.setHours(0, 0, 0, 0);

    if (scheduledDate < today) {
      return res
        .status(400)
        .json({ status: "error", message: "Cannot edit a past drive." });
    }

    // If scheduledDate is being changed, validate new date
    if (updates.scheduledDate) {
      const newDate = new Date(updates.scheduledDate);
      newDate.setHours(0, 0, 0, 0);
      const diffDays = (newDate - today) / (1000 * 60 * 60 * 24);

      if (diffDays < 15) {
        return res.status(400).json({
          status: "error",
          message: "New scheduled date must be at least 15 days from today",
        });
      }

      const conflict = await Drive.findOne({
        scheduledDate: newDate,
        _id: { $ne: driveId },
      });
      if (conflict) {
        return res.status(400).json({
          status: "error",
          message: "Another drive is already scheduled on this date",
        });
      }

      updates.scheduledDate = newDate;
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
    today.setHours(0, 0, 0, 0);

    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const drives = await Drive.find({
      scheduledDate: { $gte: today },
    }).sort({ scheduledDate: 1 });

    res.status(200).json({ status: "success", data: drives });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
