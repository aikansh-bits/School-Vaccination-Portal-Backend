import { Router } from 'express';
import { generateReport, getAllReports } from '../controllers/reportController.js';

const router = Router();

router.post('/generateReport', generateReport);
router.get('/getAllReports', getAllReports);

export default router;
