import Student from '../models/Student.js';

// Get all students
export async function getAllStudents(req, res) {
    try {
        const students = await Student.find();
        res.json({
            status: "success",
            data: students
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
}



// Create a new student
export const createStudent = async (req, res) => {
    try {
        const { name, class: studentClass } = req.body;

        if (!name || !studentClass) {
            return res.status(400).json({ status: "error", message: "Name and class are required." });
        }

        // Fetch the last student (sort by createdAt descending)
        const lastStudent = await Student.findOne().sort({ createdAt: -1 });

        let newStudentId = "STU001"; // default if no students yet

        if (lastStudent) {
            const lastIdNumber = parseInt(lastStudent.studentId.replace('STU', '')) || 0;
            const nextIdNumber = lastIdNumber + 1;
            newStudentId = `STU${nextIdNumber.toString().padStart(3, '0')}`; // example: STU001, STU002
        }

        const student = new Student({
            studentId: newStudentId,
            name,
            class: studentClass,
            vaccinations: []
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
        const updates = req.body;

        const updatedStudent = await Student.findOneAndUpdate({ studentId }, updates, { new: true });

        if (!updatedStudent) {
            return res.status(404).json({ status: "error", message: "Student not found" });
        }

        res.status(200).json({ status: "success", data: updatedStudent });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const markStudentVaccinated = async (req, res) => {
    try {
        const { studentId, driveId, vaccineName, date } = req.body;

        const student = await Student.findOne({ studentId });

        if (!student) {
            return res.status(404).json({ status: "error", message: "Student not found" });
        }

        const alreadyVaccinated = student.vaccinations.some(v => v.vaccineName === vaccineName);
        if (alreadyVaccinated) {
            return res.status(400).json({ status: "error", message: "Student already vaccinated with this vaccine." });
        }

        student.vaccinations.push({ driveId, vaccineName, date });
        await student.save();

        res.status(200).json({ status: "success", data: student });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};
