import { Schema, model } from 'mongoose';

const vaccinationSchema = new Schema({
    driveId: Schema.Types.ObjectId,
    vaccineName: String,
    date: Date
});

const studentSchema = new Schema(
    {
        studentId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        class: { type: String, required: true },
        vaccinations: [vaccinationSchema]
    },
    { timestamps: true }
);

export default model('Student', studentSchema); 
