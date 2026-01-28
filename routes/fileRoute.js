import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";
import {
  deleteFile,
  fileSummary,
  getFiles,
  saveFile,
  uploadFile,
} from "../controller/fileController.js";
const router = express.Router();

router.post("/upload-file", protect, upload.single("file"), uploadFile);
router.get("/", protect, getFiles);
router.post("/save-file/:filename", protect, saveFile);
router.delete("/:id", protect, deleteFile);
router.post("/:fileId", protect, fileSummary);

// router.get("/",protect,getFiles);

export const fileRouter = router;
