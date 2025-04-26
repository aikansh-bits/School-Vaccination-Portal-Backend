import { Router } from 'express';
import { createStudent, getAllStudents, updateStudent, markStudentVaccinated } from '../controllers/studentController.js';
// Later you will add uploadStudents here (for CSV)

const router = Router();

router.post('/createStudent', createStudent);
router.get('/getAllStudents', getAllStudents);
router.put('/updateStudent/:studentId', updateStudent);
router.post('/markVaccinated', markStudentVaccinated);
// router.post('/bulkUpload', uploadStudents); // <-- optional CSV upload

export default router;
