import Drive from "../models/Drive.js";

// Helper to normalize a date to midnight
function normalize(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET Drives
export const getAllDrives = async (req, res) => {
  try {
    // Sort drives by scheduledDate in ascending order (nearest first)
    const drives = await Drive.find().sort({ scheduledDate: 1 });

    // Format the drives without recalculating isExpired
    const formatted = drives.map((d) => {
      const obj = d.toObject();

      // If status is upcoming, adjust status to today or completed based on date
      if (obj.status === "upcoming") {
        const today = normalize(new Date());
        const sched = normalize(obj.scheduledDate);

        if (sched.getTime() === today.getTime()) {
          obj.status = "today";
        } else if (sched < today) {
          obj.status = "completed";
        }
      }

      // Return the drive without recalculating isExpired
      return obj;
    });

    res.status(200).json({ status: "success", data: formatted });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Create Drive
export const createDrive = async (req, res) => {
  try {
    const {
      vaccineName,
      scheduledDate,
      dosesAvailable,
      applicableClasses,
      createdBy,
    } = req.body;

    // Validate presence of required fields
    if (
      !vaccineName ||
      !scheduledDate ||
      !dosesAvailable ||
      !applicableClasses ||
      !createdBy
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required." });
    }

    // Use the scheduledDate exactly as it is received (without normalization)
    const scheduleDate = new Date(scheduledDate); // Directly use the provided UTC date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = (scheduleDate - today) / 86_400_000;

    // Must be at least 15 days from today
    if (diffDays < 15) {
      return res.status(400).json({
        status: "error",
        message: "Scheduled date must be at least 15 days from today.",
      });
    }

    // Prevent duplicate drives on same date
    const existing = await Drive.findOne({ scheduledDate: scheduleDate });
    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "A drive is already scheduled on this date.",
      });
    }

    // Save drive with exact provided UTC time
    const drive = new Drive({
      vaccineName,
      scheduledDate: scheduleDate, // Store exactly as received
      dosesAvailable,
      applicableClasses,
      createdBy,
      status: "upcoming", // Default status
      isExpired: false, // Default is false
    });

    const saved = await drive.save();

    return res.status(201).json({ status: "success", data: saved });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// Update Drive
export const updateDrive = async (req, res) => {
  try {
    const { driveId } = req.params;
    const updates = { ...req.body };

    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({
        status: "error",
        message: "Drive not found.",
      });
    }

    // Prevent updates to past drives
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const originalDate = new Date(drive.scheduledDate);
    originalDate.setHours(0, 0, 0, 0);

    if (originalDate < today) {
      return res.status(400).json({
        status: "error",
        message: "Cannot edit a past drive.",
      });
    }

    // Handle scheduledDate update without normalizing the time
    if (updates.scheduledDate) {
      const newScheduledDate = new Date(updates.scheduledDate); // Use the exact date and time received

      // Check for conflicts with other drives
      const conflict = await Drive.findOne({
        scheduledDate: newScheduledDate,
        _id: { $ne: driveId },
      });

      if (conflict) {
        return res.status(400).json({
          status: "error",
          message: "Another drive is already scheduled on this date.",
        });
      }

      updates.scheduledDate = newScheduledDate; // Save the received exact value (time is preserved)
    }

    // If status is completed or cancelled, set isExpired to true
    if (
      updates.status &&
      (updates.status === "completed" || updates.status === "cancelled")
    ) {
      updates.isExpired = true; // Mark the drive as expired
    }

    // Update the drive with the provided updates
    const updatedDrive = await Drive.findByIdAndUpdate(driveId, updates, {
      new: true,
    });

    // Ensure the response reflects the updated isExpired status
    updatedDrive.isExpired =
      updates.isExpired !== undefined
        ? updates.isExpired
        : updatedDrive.isExpired;

    return res.status(200).json({ status: "success", data: updatedDrive });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
