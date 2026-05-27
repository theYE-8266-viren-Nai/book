/*
 * Validation helpers for file uploads
 * -----------------------------------
 * These utilities are used to validate PDF files and optional cover images
 * before they are processed/uploaded. They perform basic checks such as
 * MIME type verification and size limits, returning an error message if
 * validation fails or `null` when the file is acceptable.
 */

/**
 * Validate a PDF file.
 * @param file - The file object selected by the user.
 * @param maxSizeMB - Maximum allowed size in megabytes (default: 50MB).
 * @returns An error message string if invalid, otherwise `null`.
 */
export function validatePdfFile(
  file: File,
  maxSizeMB: number = 50,
): string | null {
  // Ensure the MIME type is PDF.
  if (file.type !== 'application/pdf') {
    return 'Only PDF files are supported.';
  }

  // Convert size to megabytes for easy comparison.
  const sizeInMB = file.size / (1024 * 1024);
  if (sizeInMB > maxSizeMB) {
    return `PDF size must be less than ${maxSizeMB} MB (selected file is ${sizeInMB.toFixed(2)} MB).`;
  }

  // Additional optional checks could be added here (e.g., page count).
  return null;
}

/**
 * Validate a cover image file.
 * @param file - The image file selected by the user.
 * @param maxSizeMB - Maximum allowed size in megabytes (default: 5MB).
 * @param allowedTypes - Array of permitted MIME types (default includes common image formats).
 * @returns An error message string if invalid, otherwise `null`.
 */
export function validateCoverImage(
  file: File,
  maxSizeMB: number = 5,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
): string | null {
  // Verify MIME type against allowed list.
  if (!allowedTypes.includes(file.type)) {
    return 'Cover image must be a JPEG, PNG, WebP, or SVG file.';
  }

  const sizeInMB = file.size / (1024 * 1024);
  if (sizeInMB > maxSizeMB) {
    return `Cover image size must be less than ${maxSizeMB} MB (selected file is ${sizeInMB.toFixed(2)} MB).`;
  }

  return null;
}

/**
 * Consolidated helper that validates both PDF and optional cover image.
 * @param pdf - PDF file to validate.
 * @param cover - Optional cover image file.
 * @returns An object mapping field names to error strings. Empty object means all good.
 */
export function validateUploadFiles(
  pdf: File,
  cover?: File,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const pdfError = validatePdfFile(pdf);
  if (pdfError) errors.pdfFile = pdfError;

  if (cover) {
    const coverError = validateCoverImage(cover);
    if (coverError) errors.coverImage = coverError;
  }

  return errors;
}
