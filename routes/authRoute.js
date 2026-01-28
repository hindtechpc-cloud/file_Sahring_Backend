import express from "express";
import { login, register, updateProfile, users } from "../controller/authControlle.js";
import { protect } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// router.get("/auth-route", (req, res) => {
//   console.log("auth route");
// });

router.post("/register", register);
router.post("/login", login);
router.put("/profile", protect,upload.single("file"), updateProfile);
router.get("/users", users);
// router.put("/profile", protect, upload.single("file"), updateProfile);
// router.get("/check", protect, (req, res) => {
//   return res.json({
//     message: "ok",
//     id:req.decoded
//   });
// });

export const authRouter = router;
