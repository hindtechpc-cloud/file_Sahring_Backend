import path from "path";
import { File } from "../models/File.js";
import { User } from "../models/User.js";
import fs from "fs";
import main from "../utils/Gemini.js";

import mammoth from "mammoth";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph } from "docx";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const uploadFile = async (req, res) => {
  const { file } = req.body;
  const userId = req.decoded;
  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    return res.json({
      message: "server error",
      error: error.message,
    });
  }
  if (!user) {
    return res.json({
      message: "You are not autherized",
    });
  }
  let doc;
  try {
    const fileSizeInMB = +(req.file.size / (1024 * 1024)).toFixed(2);
    doc = await File.create({
      file: req.file.filename,
      size: fileSizeInMB, // now in MB
      mimetype: req.file.mimetype,
      owner: userId,
    });
  } catch (error) {
    return res.json({
      message: "server error to create file",
      error: error.message,
    });
  }
  if (!doc) {
    return res.json({
      message: "file not created",
    });
  }
  return res.json({
    message: "file stored successfully ",
    doc,
  });
};

export const getFiles = async (req, res) => {
  let files;
  try {
    files = await File.find({ owner: req.decoded });
    return res.json({
      message: "files fetched",
      files,
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteFile = async (req, res) => {
  const { id } = req.params;
  const userId = req.decoded;
  console.log(id);

  let deletedFile;
  try {
    deletedFile = await File.findByIdAndDelete(id);
    console.log(deletedFile);
  } catch (error) {
    return res.json({
      message: "file not deleted ",
      error: error.message,
      status: 500,
    });
  }
  if (!deletedFile) {
    return res.json({
      message: "file not deleted ",
      status: 400,
    });
  }
  const fileUrl = path.join(process.cwd(), "uploads", deletedFile.file);
  console.log(fileUrl);
  console.log(deletedFile);
  if (fs.existsSync(fileUrl)) {
    fs.unlinkSync(fileUrl);
    return res.json({
      message: "file deleted successfully",
      status: 200,
      deletedFile,
    });
  }
  return res.json({
    message: "file not deleted ",
    status: 400,
  });
};

/**
 * SAVE / UPDATE FILE CONTENT
 * Supports: .txt (and text output from docx conversion)
 */


export const saveFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;

    if (content === undefined) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (filename.includes("..")) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const filePath = path.join(process.cwd(), "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const ext = path.extname(filename).toLowerCase();

    /* =========================
       TEXT FILES
    ========================== */
    if ([".txt", ".html", ".json", ".js", ".css"].includes(ext)) {
      fs.writeFileSync(filePath, content, "utf8");
    }

    /* =========================
       DOCX FILE (REBUILD)
    ========================== */
    else if (ext === ".docx") {
      // No need to read old file — rebuild cleanly
      const doc = new Document({
        sections: [
          {
            children: content
              .split("\n")
              .map((line) => new Paragraph(line)),
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(filePath, buffer);
    }

    /* =========================
       PDF FILE (REBUILD)
    ========================== */
    else if (ext === ".pdf") {
      const pdfDoc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      pdfDoc.pipe(stream);
      pdfDoc.fontSize(12).text(content, {
        width: 500,
        align: "left",
      });
      pdfDoc.end();

      await new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
      });
    }

    /* =========================
       UNSUPPORTED FILES
    ========================== */
    else {
      return res.status(400).json({
        message: "Editing this file type is not supported",
      });
    }

    return res.json({
      success: true,
      message: "File edited successfully",
    });
  } catch (error) {
    console.error("Save file error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const fileSummary = async (req, res) => {
  const { fileId } = req.params;
  let file;
  try {
    file = await File.findById(fileId);
    // console.log("file data inside try ", file);
  } catch (error) {
    return res.json({
      message: "file not read",
      error: error.message,
    });
  }

  const filePath = path.join(process.cwd(), "uploads", file.file);
  console.log(filePath);

  if (fs.existsSync(filePath)) {
    let fileData;
    try {
      fileData = await fs.promises.readFile(filePath, "utf-8");
    } catch (error) {
      return res.status(500).json({
        message: "File not read",
        error: error.message,
      });
    }

    const result = await main(fileData);
    return res.json(result);
  }
  return res.json({
    message: "file not read",
  });
};
