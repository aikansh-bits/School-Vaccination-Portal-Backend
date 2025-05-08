// controllers/driveController.js
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
    const drives = await Drive.find().sort({ scheduledDate: 1 });
    const today = normalize(new Date());

    const formatted = drives.map((d) => {
      const obj = d.toObject();
      const sched = normalize(obj.scheduledDate);

      // Only override status if still set to upcoming
      if (obj.status === "upcoming") {
        if (sched.getTime() === today.getTime()) obj.status = "today";
        else if (sched < today) obj.status = "completed";
        else obj.status = "upcoming";
      }

      return {
        ...obj,
        isExpired: sched < today,
      };
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
      scheduledDate: rawDate,
      dosesAvailable,
      applicableClasses,
      createdBy,
    } = req.body;

    if (
      !vaccineName ||
      !rawDate ||
      !dosesAvailable ||
      !applicableClasses ||
      !createdBy
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required." });
    }

    const scheduleDate = normalize(rawDate);
    const today = normalize(new Date());
    const diffDays = (scheduleDate - today) / 86_400_000; // ms per day

    if (diffDays < 15) {
      return res.status(400).json({
        status: "error",
        message: "Scheduled date must be at least 15 days from today.",
      });
    }

    if (await Drive.findOne({ scheduledDate })) {
      return res.status(400).json({
        status: "error",
        message: "A drive is already scheduled on this date.",
      });
    }

    // Determine initial status
    let status =
      scheduleDate.getTime() === today.getTime() ? "today" : "upcoming";

    const drive = new Drive({
      vaccineName,
      scheduledDate: scheduleDate,
      dosesAvailable,
      applicableClasses,
      createdBy,
      status,
    });

    const saved = await drive.save();
    res.status(201).json({ status: "success", data: saved });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const originalDate = new Date(drive.scheduledDate);
    originalDate.setHours(0, 0, 0, 0);

    // Prevent editing past drives
    if (originalDate < today) {
      return res.status(400).json({
        status: "error",
        message: "Cannot edit a past drive.",
      });
    }

    // ✅ Restrict manual status update to 'completed' or 'cancelled' only
    if (updates.status) {
      const allowedManualStatuses = ["completed", "cancelled"];
      if (!allowedManualStatuses.includes(updates.status)) {
        return res.status(400).json({
          status: "error",
          message: "Status can only be set to 'completed' or 'cancelled'.",
        });
      }
    }

    // Handle scheduledDate change
    if (updates.scheduledDate) {
      const newDate = new Date(updates.scheduledDate);
      newDate.setHours(0, 0, 0, 0);

      const diffDays = (newDate - today) / (1000 * 60 * 60 * 24);
      if (diffDays < 15) {
        return res.status(400).json({
          status: "error",
          message: "New scheduled date must be at least 15 days from today.",
        });
      }

      // Check for overlap
      const conflict = await Drive.findOne({
        scheduledDate: newDate,
        _id: { $ne: driveId },
      });

      if (conflict) {
        return res.status(400).json({
          status: "error",
          message: "Another drive is already scheduled on this date.",
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
