import mongoose, { Schema, Document } from "mongoose";

export const activityActions = [
  "CREATE_PRODUCT",
  "UPDATE_PRODUCT",
  "DELETE_PRODUCT",
  "PUBLISH_PRODUCT",
  "UNPUBLISH_PRODUCT",
  "DUPLICATE_PRODUCT",
] as const;
