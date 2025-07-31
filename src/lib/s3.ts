import axios from "axios";

/**
 * Upload a file to S3 using a pre-signed URL
 * @param url - The pre-signed URL from the backend
 * @param file - The file to upload
 * @returns Promise<void>
 */
export async function uploadViaPresigned(
  url: string,
  file: File,
): Promise<void> {
  try {
    await axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
      // Don't include auth headers for S3 uploads
      transformRequest: [(data) => data],
    });
  } catch (error) {
    console.error("S3 upload failed:", error);
    throw new Error("Failed to upload file to S3");
  }
}

/**
 * Validate file before upload
 * @param file - The file to validate
 * @param options - Validation options
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {},
): { isValid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ["image/*", "video/*"],
    allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".mp4",
      ".mov",
      ".avi",
    ],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Check file type
  const isTypeAllowed = allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });

  if (!isTypeAllowed) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
  const isExtensionAllowed = allowedExtensions.some(
    (ext) => ext.toLowerCase() === fileExtension,
  );

  if (!isExtensionAllowed) {
    return {
      isValid: false,
      error: `File extension ${fileExtension} is not allowed`,
    };
  }

  return { isValid: true };
}

/**
 * Generate a unique filename to prevent conflicts
 * @param originalName - The original filename
 * @returns A unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");

  return `${nameWithoutExtension}_${timestamp}_${randomString}.${extension}`;
}

/**
 * Get file preview URL for images
 * @param file - The file to preview
 * @returns Promise<string> - Data URL for preview
 */
export function getFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
