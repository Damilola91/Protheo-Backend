import ActivityLog, { ActivityAction } from "../models/ActivityLogModel";
import mongoose from "mongoose";

interface LogActivityParams {
  action: ActivityAction;
  productId?: unknown;
  userId: unknown;
  changes?: Record<string, any>;
}

export const logActivity = async (params: LogActivityParams) => {
  const { action, productId, userId, changes } = params;

  return ActivityLog.create({
    action,
    productId: productId
      ? new mongoose.Types.ObjectId(productId as any)
      : undefined,
    userId: new mongoose.Types.ObjectId(userId as any),
    changes: changes ?? undefined,
  });
};
