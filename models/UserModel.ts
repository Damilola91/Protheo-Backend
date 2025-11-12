import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

const allowedRoles = ["admin", "user"] as const;


export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: (typeof allowedRoles)[number];
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}


const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
  {
    timestamps: true,
    strict: true,
  }
);


UserSchema.pre("save", async function (next) {
  const user = this as IUser;
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error as any);
  }
});


UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(candidatePassword, user.password);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
