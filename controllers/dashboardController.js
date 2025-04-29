import Student from "../models/Student.js";
import Drive from "../models/Drive.js";

// Dashboard Summary
export const getDashboardSummary = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const vaccinatedStudents = await Student.countDocuments({
      "vaccinations.0": { $exists: true },
    });

    const vaccinationPercentage =
      totalStudents > 0
        ? ((vaccinatedStudents / totalStudents) * 100).toFixed(2)
        : 0;

    const upcomingDrives = await Drive.find({
      scheduledDate: { $gte: new Date() },
    })
      .sort({ scheduledDate: 1 }) // sort by soonest first
      .select("vaccineName scheduledDate dosesAvailable");

    res.status(200).json({
      status: "success",
      data: {
        totalStudents,
        vaccinatedStudents,
        vaccinationPercentage,
        upcomingDrives,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
