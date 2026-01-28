import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import mammoth from "mammoth";
import { fileURLToPath } from "url";

import { authRouter } from "./routes/authRoute.js";
import { fileRouter } from "./routes/fileRoute.js";
import { connectDB } from "./config/db.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { readPdfText } from "./utils/readPdfText.js";

// ---------- PATH ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- APP ----------
const app = express();
const PORT = 5000;

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: ["http://localhost:5175", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/api/file/:filename", async (req, res) => {
  try {
    const { filename } = req.params;

    if (filename.includes("..")) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const filePath = path.join(process.cwd(), "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const ext = path.extname(filename).toLowerCase();
    let content = "";

    // TEXT FILES
    if ([".txt", ".html", ".json", ".js", ".css"].includes(ext)) {
      content = fs.readFileSync(filePath, "utf8");
    }

    // DOCX
    else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      content = result.value;
    }

    // PDF (ESM SAFE ✅)
    else if (ext === ".pdf") {
      content = await readPdfText(filePath);
    } else {
      return res.status(400).json({
        message: "This file type cannot be previewed",
      });
    }

    res.json({ content });
  } catch (err) {
    console.error("File read error:", err);
    res.status(500).json({ message: "Failed to read file" });
  }
});

// ---------- ROUTES ----------
app.use("/api/auth", authRouter);
app.use("/api/file", fileRouter);

// ---------- HEALTH ----------
app.get("/health", (req, res) => {
  res.json({ message: "OK" });
});

// ---------- START ----------
connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
