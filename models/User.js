import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Ths Email already exist"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    pic: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("user", userSchema);
