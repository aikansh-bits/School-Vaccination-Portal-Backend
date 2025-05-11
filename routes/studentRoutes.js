import { Router } from "express";
import multer from "multer";
import {
  createStudent,
  getAllStudents,
  updateStudent,
  markStudentVaccinated,
  uploadStudents,
} from "../controllers/studentController.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/createStudent", createStudent);
router.get("/getAllStudents", getAllStudents);
router.put("/updateStudent/:studentId", updateStudent);
router.post("/markVaccinated", markStudentVaccinated);
router.post("/bulkUpload", upload.single("file"), uploadStudents);

export default router;
