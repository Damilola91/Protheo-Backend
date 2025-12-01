import mongoose, { Schema, Document } from "mongoose";

export const activityActions = [
  "CREATE_PRODUCT",
  "UPDATE_PRODUCT",
  "DELETE_PRODUCT",
  "PUBLISH_PRODUCT",
  "UNPUBLISH_PRODUCT",
  "DUPLICATE_PRODUCT",
] as const;

export type ActivityAction = (typeof activityActions)[number];

export interface IActivityLog extends Document {
  action: ActivityAction;
  productId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  changes?: Record<string, any>;
  createdAt?: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, enum: activityActions, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    changes: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
