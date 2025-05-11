import Student from "../models/Student.js";

export const generateVaccinationReport = async (req, res) => {
  try {
    const {
      vaccineName,
      class: studentClass,
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build filter object
    const filter = {};

    if (vaccineName) {
      filter["vaccinations.vaccineName"] = vaccineName;
    }

    if (studentClass) {
      filter["class"] = studentClass;
    }

    // Fetch students
    const students = await Student.find(filter, {
      studentId: 1,
      name: 1,
      class: 1,
      dob: 1,
      vaccinations: 1,
    })
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Student.countDocuments(filter);

    // Format response
    const formatted = students.map((student) => ({
      studentId: student.studentId,
      name: student.name,
      class: student.class,
      dob: student.dob,
      status: student.vaccinations.length > 0 ? "vaccinated" : "not_vaccinated",
      vaccinations: student.vaccinations.map((v) => ({
        vaccineName: v.vaccineName,
        date: v.date,
      })),
    }));

    res.status(200).json({
      status: "success",
      data: formatted,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ message: "Failed to generate report." });
  }
};
