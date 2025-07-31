import React, { useState, useCallback } from "react";
import {
  Upload,
  X,
  FileText,
  Image,
  Video,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  uploadViaPresigned,
  validateFile,
  formatFileSize,
  getFilePreview,
} from "../../lib/s3";
import { getPresignedUrl } from "../../lib/api";

interface FileDropzoneProps {
  onFileUpload: (fileUrl: string) => void;
  onError?: (error: string) => void;
  accept?: string[];
  maxSize?: number; // in bytes
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
  preview?: string;
  url?: string;
}

export function FileDropzone({
  onFileUpload,
  onError,
  accept = ["image/*", "video/*"],
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  className = "",
  disabled = false,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);

      if (!multiple && fileArray.length > 1) {
        onError?.("Only one file is allowed");
        return;
      }

      const validFiles: File[] = [];

      // Validate files
      for (const file of fileArray) {
        const validation = validateFile(file, {
          maxSize,
          allowedTypes: accept,
        });

        if (!validation.isValid) {
          onError?.(validation.error || "Invalid file");
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      // Initialize uploading files
      const newUploadingFiles: UploadingFile[] = await Promise.all(
        validFiles.map(async (file) => {
          let preview: string | undefined;

          if (file.type.startsWith("image/")) {
            try {
              preview = await getFilePreview(file);
            } catch (error) {
              console.warn("Failed to generate preview:", error);
            }
          }

          return {
            file,
            progress: 0,
            status: "uploading" as const,
            preview,
          };
        }),
      );

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      // Upload files
      for (let i = 0; i < newUploadingFiles.length; i++) {
        const uploadingFile = newUploadingFiles[i];

        try {
          // Get presigned URL
          const { upload_url, file_url } = await getPresignedUrl(
            uploadingFile.file.name,
            uploadingFile.file.type,
          );

          // Upload to S3
          await uploadViaPresigned(upload_url, uploadingFile.file);

          // Update status
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === uploadingFile.file
                ? { ...f, status: "success", progress: 100, url: file_url }
                : f,
            ),
          );

          // Notify parent
          onFileUpload(file_url);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";

          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === uploadingFile.file
                ? { ...f, status: "error", error: errorMessage }
                : f,
            ),
          );

          onError?.(errorMessage);
        }
      }
    },
    [accept, maxSize, multiple, onFileUpload, onError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles, disabled],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
      // Reset input
      e.target.value = "";
    },
    [handleFiles],
  );

  const removeFile = useCallback((file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return Image;
    if (file.type.startsWith("video/")) return Video;
    return FileText;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${
            isDragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <input
          type="file"
          multiple={multiple}
          accept={accept.join(",")}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />

        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Supports: {accept.join(", ")} • Max size: {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">
            {uploadingFiles.filter((f) => f.status === "uploading").length > 0
              ? "Uploading..."
              : "Upload Complete"}
          </h4>

          {uploadingFiles.map((uploadingFile, index) => {
            const Icon = getFileIcon(uploadingFile.file);

            return (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                {/* Preview or Icon */}
                <div className="flex-shrink-0">
                  {uploadingFile.preview ? (
                    <img
                      src={uploadingFile.preview}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(uploadingFile.file.size)}
                  </p>

                  {/* Progress Bar */}
                  {uploadingFile.status === "uploading" && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadingFile.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadingFile.status === "error" && uploadingFile.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {uploadingFile.error}
                    </p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {uploadingFile.status === "uploading" && (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                  {uploadingFile.status === "success" && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {uploadingFile.status === "error" && (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(uploadingFile.file)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FileDropzone;
