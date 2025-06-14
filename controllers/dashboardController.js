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

    // Truncate today's time to 00:00:00 for accurate day comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate the date 30 days from today
    const thirtyDaysFromToday = new Date(today);
    thirtyDaysFromToday.setDate(today.getDate() + 30);

    // Find upcoming drives where isExpired is false and within the next 30 days
    const upcomingDrives = await Drive.find({
      scheduledDate: { $gte: today, $lte: thirtyDaysFromToday },
      isExpired: false, // Filter to only include drives that are not expired
    })
      .sort({ scheduledDate: 1 })
      .select("vaccineName scheduledDate dosesAvailable applicableClasses");

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