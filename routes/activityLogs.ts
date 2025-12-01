import { Router } from "express";
import { verifyToken, authorizeAdmin } from "../middlewares/authGuard";
import {
  getActivityLogs,
  deleteActivityLog,
  deleteOldActivityLogs,
  exportActivityLogsCSV,
} from "../controllers/activityController";

const activity = Router();

activity.get("/logs", verifyToken, authorizeAdmin, getActivityLogs);

activity.get("/export/csv", verifyToken, authorizeAdmin, exportActivityLogsCSV);

activity.delete(
  "/remove/:logId",
  verifyToken,
  authorizeAdmin,
  deleteActivityLog
);

activity.delete("/cleanup", verifyToken, authorizeAdmin, deleteOldActivityLogs);

export default activity;
