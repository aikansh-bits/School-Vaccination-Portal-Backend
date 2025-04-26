import Report from '../models/Report.js';

// @desc Get all reports
export const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find();
        res.status(200).json({
            status: "success",
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};


// Generate a new report
export const generateReport = async (req, res) => {
    try {
        const { generatedBy, filters, exportFormat } = req.body;

        const query = {};
        if (filters.vaccineName) query['vaccinations.vaccineName'] = filters.vaccineName;
        if (filters.class) query['class'] = filters.class;

        const students = await Student.find(query);

        const reportData = students.map(student => ({
            studentId: student.studentId,
            name: student.name,
            class: student.class,
            vaccineName: student.vaccinations.length > 0 ? student.vaccinations[0].vaccineName : '',
            vaccinatedOn: student.vaccinations.length > 0 ? student.vaccinations[0].date : ''
        }));

        const newReport = new Report({
            generatedBy,
            filters,
            exportFormat,
            reportData
        });

        const savedReport = await newReport.save();

        res.status(201).json({ status: "success", data: savedReport });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

