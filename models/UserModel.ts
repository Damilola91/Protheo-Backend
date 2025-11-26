import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export const allowedRoles = ["admin", "user"] as const;
const SALT_ROUNDS = 10;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: (typeof allowedRoles)[number];
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    role: {
      type: String,
      enum: allowedRoles,
      default: "user",
    },
  },
  { timestamps: true }
);

// 🔐 Hash password only if changed
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// Compare hashed password
UserSchema.methods.comparePassword = function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model<IUser>("User", UserSchema);
