import { Router } from "express";
import {
  createStudent,
  getAllStudents,
  updateStudent,
  markStudentVaccinated,
  uploadStudents,
} from "../controllers/studentController.js";

const router = Router();

router.post("/createStudent", createStudent);
router.get("/getAllStudents", getAllStudents);
router.put("/updateStudent/:studentId", updateStudent);
router.post("/markVaccinated", markStudentVaccinated);
router.post("/bulkUpload", uploadStudents);

export default router;
