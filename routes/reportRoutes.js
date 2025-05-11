import { Router } from "express";
import { generateVaccinationReport } from "../controllers/reportController.js";

const router = Router();

router.get("/generateReport", generateVaccinationReport);

export default router;
