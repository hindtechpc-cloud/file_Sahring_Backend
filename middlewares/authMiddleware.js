import jwt, { decode } from "jsonwebtoken";
import "dotenv/config";
import { User } from "../models/User.js";
import { response } from "express";
export const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  token = req.headers.authorization.split(" ")[1];
  console.log(token);
  if (!token || token == null) {
    return res.json({
      message: "your not autherized or token invalid",
    });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.json({
      message: " token invalid",
      error: error.message,
    });
  }
  if (!decoded || decoded == null) {
    return res.json({
      message: "your not autherized or token invalid",
    });
  }
  let user;
  try {
    user = await User.findById(decoded.user);
  } catch (error) {
    return res.json({
      message: "your not autherized",
      error: error.message,
    });
  }
  if (!user || user == null) {
    return res.json({
      message: "your not autherized",
    });
  }
  req.decoded = decoded.user;
  next();
};
