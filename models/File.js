import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    file: {
      type: String,
      required: [true, "file is required"],
    },
    actins: {
      enum: ["scanned", "draft", "summrized"],
    
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    AIGeneratedSummary: {
      type: String,
    },
    threads: {
      type: String,
    },
    status: { enum: ["clean", "warning", "enfected"], },
    size: {
      type: Number,
    },
    mimetype: {
      type: String,
    },
  },
  { timestamps: true }
);

export const File = mongoose.model("file", fileSchema);
