import { IsOptional, IsString, Matches } from "class-validator";
import { Expose } from "class-transformer";

export class FileUploadDto {
  @IsOptional()
  @IsString({ message: "Custom file name must be a string" })
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: "Custom file name can only contain alphanumeric characters, hyphens, and underscores",
  })
  @Expose()
  customFileName?: string;
}

export class BufferUploadDto {
  @IsString({ message: "Buffer data is required" })
  @Expose()
  buffer!: string;

  @IsString({ message: "File extension must be a string" })
  @Expose()
  extension!: string;

  @IsOptional()
  @IsString({ message: "Custom file name must be a string" })
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: "Custom file name can only contain alphanumeric characters, hyphens, and underscores",
  })
  @Expose()
  customFileName?: string;
}

export class DeleteFileDto {
  @IsString({ message: "Blob name is required" })
  @Expose()
  blobName!: string;
}
