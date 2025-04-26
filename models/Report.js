import { Schema, model } from 'mongoose';

const reportDataSchema = new Schema({
    studentId: String,
    name: String,
    class: String,
    vaccineName: String,
    vaccinatedOn: Date,
}, { _id: false });

const reportSchema = new Schema({
    generatedBy: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
    filters: {
        vaccineName: String,
        class: String,
    },
    exportFormat: { type: String, default: 'csv' },
    reportData: [reportDataSchema],
}, { timestamps: true });

export default model('Report', reportSchema);
