import { Schema, model } from "mongoose";

const driveSchema = new Schema(
  {
    vaccineName: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    dosesAvailable: { type: Number, required: true },
    applicableClasses: { type: String, required: true },
    createdBy: { type: String, required: true },
    status: {
      type: String,
      enum: ["upcoming", "today", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

export default model("Drive", driveSchema);
