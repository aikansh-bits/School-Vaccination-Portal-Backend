import Student from "../models/Student.js";

// Get all students
export async function getAllStudents(req, res) {
  try {
    const students = await Student.find();
    res.json({
      status: "success",
      data: students,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
}

// Create a new student
export const createStudent = async (req, res) => {
  try {
    const {
      name,
      class: studentClass,
      dob,
      mobileNumber,
      address,
      vaccinations,
    } = req.body;

    if (!name || !studentClass || !dob) {
      return res.status(400).json({
        status: "error",
        message: "Name, class, and DOB are required.",
      });
    }

    // Fetch last student
    const lastStudent = await Student.findOne().sort({ createdAt: -1 });

    let newStudentId = "STU001";
    if (lastStudent) {
      const lastIdNumber =
        parseInt(lastStudent.studentId.replace("STU", "")) || 0;
      const nextIdNumber = lastIdNumber + 1;
      newStudentId = `STU${nextIdNumber.toString().padStart(3, "0")}`;
    }

    // Convert ["Corona Vaccine"] to [{ vaccineName: "Corona Vaccine" }]
    const vaccinationObjects = Array.isArray(vaccinations)
      ? vaccinations.map((vaccineName) => ({ vaccineName }))
      : [];

    const student = new Student({
      studentId: newStudentId,
      name,
      class: studentClass,
      dob,
      mobileNumber,
      address,
      vaccinations: vaccinationObjects,
    });

    const saved = await student.save();

    res.status(201).json({ status: "success", data: saved });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update Student
export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      name,
      class: studentClass,
      dob,
      mobileNumber,
      address,
      vaccinations,
    } = req.body;

    const student = await Student.findOne({ studentId });

    if (!student) {
      return res
        .status(404)
        .json({ status: "error", message: "Student not found" });
    }

    // Update basic fields
    if (name) student.name = name;
    if (studentClass) student.class = studentClass;
    if (dob) student.dob = dob;
    if (mobileNumber) student.mobileNumber = mobileNumber;
    if (address) student.address = address;

    // Append new vaccinations if provided and not duplicates
    if (Array.isArray(vaccinations)) {
      const existing = student.vaccinations.map((v) => v.vaccineName);
      vaccinations.forEach((vaccineName) => {
        if (vaccineName && !existing.includes(vaccineName)) {
          student.vaccinations.push({ vaccineName });
        }
      });
    }

    await student.save();

    res.status(200).json({ status: "success", data: student });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const markStudentVaccinated = async (req, res) => {
  try {
    const { studentId, driveId, vaccineName, date } = req.body;

    const student = await Student.findOne({ studentId });

    if (!student) {
      return res
        .status(404)
        .json({ status: "error", message: "Student not found" });
    }

    const alreadyVaccinated = student.vaccinations.some(
      (v) => v.vaccineName === vaccineName
    );
    if (alreadyVaccinated) {
      return res.status(400).json({
        status: "error",
        message: "Student already vaccinated with this vaccine.",
      });
    }

    student.vaccinations.push({ driveId, vaccineName, date });
    await student.save();

    res.status(200).json({ status: "success", data: student });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
