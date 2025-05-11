import { Router } from "express";
import { generateVaccinationReport } from "../controllers/reportController.js";

const router = Router();


router.get("/vaccinationReport", generateVaccinationReport);

export default router;
