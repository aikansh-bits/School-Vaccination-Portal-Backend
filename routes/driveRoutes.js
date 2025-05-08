import { Router } from "express";
import {
  createDrive,
  getAllDrives,
  updateDrive,
  getUpcomingDrives,
} from "../controllers/driveController.js";

const router = Router();

router.post("/createDrive", createDrive);
router.get("/getAllDrives", getAllDrives);
router.put("/updateDrive/:driveId", updateDrive);

export default router;
