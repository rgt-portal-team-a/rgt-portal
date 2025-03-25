import { BlobServiceClient, BlockBlobClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { createReadStream, stat } from "fs";
import { promisify } from "util";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";

export type SupportedFileType = "image" | "video" | "pdf" | "document";

export interface AzureStorageConfig {
  accountName: string;
  accountKey: string;
  containerName: string;
  maxSizeInBytes?: {
    image?: number;
    video?: number;
    pdf?: number;
    document?: number;
  };
  allowedExtensions?: {
    image?: string[];
    video?: string[];
    pdf?: string[];
    document?: string[];
  };
}

export interface UploadResult {
  success: boolean;
  url?: string;
  contentType?: string;
  size?: number;
  fileName?: string;
  error?: string;
  blobName?: string;
}

export class AzureFileUploader {
  private blobServiceClient: BlobServiceClient;
  private containerClient: any;
  private config: AzureStorageConfig;
  private statAsync = promisify(stat);

  private static readonly DEFAULT_MAX_SIZES = {
    image: 5 * 1024 * 1024, // 5MB
    video: 100 * 1024 * 1024, // 100MB
    pdf: 10 * 1024 * 1024, // 10MB
    document: 10 * 1024 * 1024, // 10MB
  };

  private static readonly DEFAULT_EXTENSIONS = {
    image: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"],
    video: [".mp4", ".mov", ".avi", ".wmv", ".webm", ".mkv"],
    pdf: [".pdf"],
    document: [".doc", ".docx", ".txt", ".rtf", ".odt", ".xlsx", ".pptx"],
  };

  private static readonly CONTENT_TYPE_MAP: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".bmp": "image/bmp",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".wmv": "video/x-ms-wmv",
    ".webm": "video/webm",
    ".mkv": "video/x-matroska",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
    ".rtf": "application/rtf",
    ".odt": "application/vnd.oasis.opendocument.text",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };

  constructor(config: AzureStorageConfig) {
    this.config = {
      ...config,
      maxSizeInBytes: {
        ...AzureFileUploader.DEFAULT_MAX_SIZES,
        ...config.maxSizeInBytes,
      },
      allowedExtensions: {
        ...AzureFileUploader.DEFAULT_EXTENSIONS,
        ...config.allowedExtensions,
      },
    };

    const credential = new StorageSharedKeyCredential(this.config.accountName, this.config.accountKey);

    const blobServiceUrl = `https://${this.config.accountName}.blob.core.windows.net`;
    this.blobServiceClient = new BlobServiceClient(blobServiceUrl, credential);
    this.containerClient = this.blobServiceClient.getContainerClient(this.config.containerName);
  }

  public async initialize(): Promise<boolean> {
    try {
      const exists = await this.containerClient.exists();
      if (!exists) {
        await this.containerClient.create({ access: "blob" });
        console.log(`Container ${this.config.containerName} created successfully.`);
      }
      return true;
    } catch (error) {
      console.error("Failed to initialize container:", error);
      return false;
    }
  }

  public async uploadFile(filePath: string, fileType: SupportedFileType, customFileName?: string): Promise<UploadResult> {
    try {
      const fileStats = await this.statAsync(filePath);
      const extension = extname(filePath).toLowerCase();

      const allowedExtensions = this.config.allowedExtensions?.[fileType] || [];
      if (!allowedExtensions.includes(extension)) {
        return {
          success: false,
          error: `Invalid file extension. Allowed extensions for ${fileType}: ${allowedExtensions.join(", ")}`,
        };
      }

      const maxSize = this.config.maxSizeInBytes?.[fileType] || 0;
      if (fileStats.size > maxSize) {
        return {
          success: false,
          error: `File size exceeds the maximum allowed size of ${this.formatBytes(maxSize)}`,
        };
      }

      const blobName = customFileName ? `${customFileName}${extension}` : `${fileType}-${uuidv4()}${extension}`;

      const contentType = AzureFileUploader.CONTENT_TYPE_MAP[extension] || "application/octet-stream";

      const blockBlobClient = this.getBlobClient(blobName);

      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
      };

      const fileStream = createReadStream(filePath);
      await blockBlobClient.uploadStream(fileStream, 4 * 1024 * 1024, 20, uploadOptions);

      return {
        success: true,
        url: blockBlobClient.url,
        contentType,
        size: fileStats.size,
        fileName: blobName,
        blobName,
      };
    } catch (error) {
      console.error("Upload failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred during upload",
      };
    }
  }

  public async uploadBuffer(buffer: Buffer, fileType: SupportedFileType, extension: string, customFileName?: string): Promise<UploadResult> {
    try {
      const normalizedExtension = extension.toLowerCase().startsWith(".") ? extension.toLowerCase() : `.${extension.toLowerCase()}`;

      const allowedExtensions = this.config.allowedExtensions?.[fileType] || [];
      if (!allowedExtensions.includes(normalizedExtension)) {
        return {
          success: false,
          error: `Invalid file extension. Allowed extensions for ${fileType}: ${allowedExtensions.join(", ")}`,
        };
      }

      const maxSize = this.config.maxSizeInBytes?.[fileType] || 0;
      if (buffer.length > maxSize) {
        return {
          success: false,
          error: `File size exceeds the maximum allowed size of ${this.formatBytes(maxSize)}`,
        };
      }

      const blobName = customFileName ? `${customFileName}${normalizedExtension}` : `${fileType}-${uuidv4()}${normalizedExtension}`;

      const contentType = AzureFileUploader.CONTENT_TYPE_MAP[normalizedExtension] || "application/octet-stream";

      const blockBlobClient = this.getBlobClient(blobName);

      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
      });

      return {
        success: true,
        url: blockBlobClient.url,
        contentType,
        size: buffer.length,
        fileName: blobName,
        blobName,
      };
    } catch (error) {
      console.error("Upload failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred during upload",
      };
    }
  }

  public async deleteFile(blobName: string): Promise<boolean> {
    try {
      const blockBlobClient = this.getBlobClient(blobName);
      await blockBlobClient.delete();
      return true;
    } catch (error) {
      console.error("Delete failed:", error);
      return false;
    }
  }

  private getBlobClient(blobName: string): BlockBlobClient {
    return this.containerClient.getBlockBlobClient(blobName);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
