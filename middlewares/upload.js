import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const fileFilter=(req, file, cb) => {
    cb(null,true);
  }


export const upload = multer({ storage,fileFilter,limits:{
  fileSize:1024*1024*50 //50 mb file size max
} });
