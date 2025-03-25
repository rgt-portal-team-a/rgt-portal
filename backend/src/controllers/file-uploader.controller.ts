import path from "path";
import { Request, Response } from "express";
import { unlinkSync, existsSync } from "fs";
import { AzureFileUploader, SupportedFileType } from "@/services/blob-storage.service";

export class FileUploadController {
  private fileUploader: AzureFileUploader;

  constructor() {
    this.fileUploader = new AzureFileUploader({
      accountName: process.env.AZURE_STORAGE_ACCOUNT!,
      accountKey: process.env.AZURE_STORAGE_KEY!,
      containerName: process.env.AZURE_STORAGE_CONTAINER!,
    });
  }

  public uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: "No file uploaded" });
        return;
      }
      console.log("====================================");
      console.log(req.file);
      console.log("====================================");

      const { originalname, path: tempFilePath, size } = req.file;
      const fileExtension = path.extname(originalname).toLowerCase();

      const fileType = this.determineFileType(fileExtension);

      if (!fileType) {
        this.cleanupTempFile(tempFilePath);
        res.status(400).json({
          success: false,
          error: "Unsupported file type",
          supportedTypes: this.getSupportedExtensionsMessage(),
        });
        return;
      }

      const customFileName = req.body.customFileName || undefined;

      const result = await this.fileUploader.uploadFile(tempFilePath, fileType, customFileName);

      this.cleanupTempFile(tempFilePath);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: "File uploaded successfully",
          file: {
            url: result.url,
            name: result.fileName,
            originalName: originalname,
            size: result.size,
            sizeFormatted: this.formatBytes(result.size || 0),
            contentType: result.contentType,
            type: fileType,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || "Upload failed",
        });
      }
    } catch (error) {
      console.error("Controller error during upload:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Server error during upload",
      });
    }
  };

  public uploadBuffer = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.body.buffer || !req.body.extension) {
        res.status(400).json({
          success: false,
          error: "Buffer data and file extension are required",
        });
        return;
      }

      let buffer: Buffer;
      if (typeof req.body.buffer === "string") {
        const base64Data = req.body.buffer.replace(/^data:[^;]+;base64,/, "");
        buffer = Buffer.from(base64Data, "base64");
      } else if (Buffer.isBuffer(req.body.buffer)) {
        buffer = req.body.buffer;
      } else {
        res.status(400).json({
          success: false,
          error: "Invalid buffer format. Expected base64 string or Buffer object",
        });
        return;
      }

      const fileExtension = req.body.extension.startsWith(".") ? req.body.extension.toLowerCase() : `.${req.body.extension.toLowerCase()}`;

      const fileType = this.determineFileType(fileExtension);

      if (!fileType) {
        res.status(400).json({
          success: false,
          error: "Unsupported file type",
          supportedTypes: this.getSupportedExtensionsMessage(),
        });
        return;
      }

      const customFileName = req.body.customFileName || undefined;

      const result = await this.fileUploader.uploadBuffer(buffer, fileType, fileExtension, customFileName);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: "File uploaded successfully",
          file: {
            url: result.url,
            name: result.fileName,
            size: result.size,
            sizeFormatted: this.formatBytes(result.size || 0),
            contentType: result.contentType,
            type: fileType,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || "Upload failed",
        });
      }
    } catch (error) {
      console.error("Controller error during buffer upload:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Server error during upload",
      });
    }
  };

  public deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { blobName } = req.params;

      if (!blobName) {
        res.status(400).json({
          success: false,
          error: "Blob name is required",
        });
        return;
      }

      const deleteResult = await this.fileUploader.deleteFile(blobName);

      if (deleteResult) {
        res.status(200).json({
          success: true,
          message: "File deleted successfully",
          blobName,
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Failed to delete file",
        });
      }
    } catch (error) {
      console.error("Controller error during file deletion:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Server error during file deletion",
      });
    }
  };

  private determineFileType(extension: string): SupportedFileType | null {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"];
    const videoExtensions = [".mp4", ".mov", ".avi", ".wmv", ".webm", ".mkv"];
    const pdfExtensions = [".pdf"];
    const documentExtensions = [".doc", ".docx", ".txt", ".rtf", ".odt", ".xlsx", ".pptx"];

    if (imageExtensions.includes(extension)) {
      return "image";
    } else if (videoExtensions.includes(extension)) {
      return "video";
    } else if (pdfExtensions.includes(extension)) {
      return "pdf";
    } else if (documentExtensions.includes(extension)) {
      return "document";
    }

    return null;
  }

  private getSupportedExtensionsMessage(): string {
    return (
      "Supported file types: " +
      "Images (.jpg, .jpeg, .png, .gif, .webp, .svg, .bmp), " +
      "Videos (.mp4, .mov, .avi, .wmv, .webm, .mkv), " +
      "PDFs (.pdf), " +
      "Documents (.doc, .docx, .txt, .rtf, .odt, .xlsx, .pptx)"
    );
  }

  private cleanupTempFile(filePath: string): void {
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch (error) {
        console.error(`Failed to clean up temporary file at ${filePath}:`, error);
      }
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
