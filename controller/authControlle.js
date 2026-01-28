import { User } from "../models/User.js";
import jwt, { decode } from "jsonwebtoken";
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
const generateToken = async (id) => {
  console.log(id);
  let token;
  try {
    token = jwt.sign({ user: id }, process.env.SECRET_KEY);
  } catch (error) {
    console.log(error.message);
    return null;
  }
  if (!token || token == null) {
    console.log("Token not generated");
    return null;
  }
  return token;
};
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  let user;
  try {
    user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    return res.status(500).json({
      message: "serever error",
      error: error.message,
    });
  }
  if (!user || user == null) {
    return res.status(400).json({
      message: "user not regisetred",
    });
  }
  const token = await generateToken(user._id);
  if (!token || token == null) {
    return res.status(400).json({
      message: "token not generated",
    });
  }
  user.password = "";
  return res.status(201).json({
    message: "user regisetred successfully",
    user,
    token,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(password);
  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
  if (!user || user == null) {
    return res.status(404).json({
      message: "Your email is wrong",
    });
  }
  console.log(user);
  let passwordMatche;
  try {
    passwordMatche = await bcrypt.compare(password, user.password);
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
  console.log("after password match", passwordMatche);

  if (!passwordMatche) {
    return res.status(404).json({
      message: "Your password is wrong",
    });
  }
  const token = await generateToken(user._id);
  if (!token || token == null) {
    return res.status(400).json({
      message: "token not generated",
    });
  }
  user.password = undefined;
  return res.status(200).json({
    message: "user loggedin successfully",
    user,
    token,
  });
};

export const updateProfile = async (req, res) => {
  const { name, email,file } = req.body;
  console.log(file)
  // const profilePic=req.file;
  const userId = req.decoded;
  console.log("user", req.file);
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({
      message: "Invalid user id",
    });
  }

  try {
    if (email) {
      const emailUsedByOther = await User.findOne({
        email,
        _id: { $ne: userId },
      });

      if (emailUsedByOther) {
        return res.status(400).json({
          message: "This email is already used by another user",
        });
      }
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (req.file) {
      if (user.pic) {
        const oldPic = path.join(process.cwd(), "uploads", user.pic);

        if (fs.existsSync(oldPic)) {
          fs.unlinkSync(oldPic);
        }
      }
      user.pic = req?.file?.filename;
    }

    await user.save();

    return res.json({
      message: "User profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const users = async (req, res) => {
  try {
    const user = await User.find({});
    return res.json(user);
  } catch (error) {
    console.log(error);
  }
};
