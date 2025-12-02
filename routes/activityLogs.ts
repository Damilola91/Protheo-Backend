import { Router } from "express";
import { verifyToken, authorizeAdmin } from "../middlewares/authGuard";
import {
  getActivityLogs,
  deleteActivityLog,
  exportActivityLogsCSV,
  dryRunCleanup,
  cleanupOldLogs,
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
activity.get("/cleanup/dry-run", verifyToken, authorizeAdmin, dryRunCleanup);
activity.delete(
  "/cleanup/execute",
  verifyToken,
  authorizeAdmin,
  cleanupOldLogs
);

export default activity;
