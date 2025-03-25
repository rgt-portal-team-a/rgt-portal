import fs from "fs";
import path from "path";
import { FileUploadController } from "@/controllers/file-uploader.controller";
import { BufferUploadDto, DeleteFileDto, FileUploadDto } from "@/dtos/file.dto";
import { validateDto } from "@/middleware/validator.middleware";
import express from "express";
import multer from "multer";

const fileUploaderRouter = express.Router();
const controller = new FileUploadController();

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

fileUploaderRouter.post("/upload", upload.single("file"), validateDto(FileUploadDto, true), controller.uploadFile);
fileUploaderRouter.post("/upload-buffer", validateDto(BufferUploadDto), controller.uploadBuffer);
fileUploaderRouter.delete("/delete/:blobName", validateDto(DeleteFileDto), controller.deleteFile);

export default fileUploaderRouter;
