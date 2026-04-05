"use client";

const MAX_DIMENSION = 1024;

/**
 * Compresses an image file to a manageable size for API transmission.
 *
 * Resizes to max 1024px on the longest side and converts to PNG.
 * This handles iPhone HEIC/HEIF photos by decoding them through the
 * browser's Image element and re-encoding as PNG via canvas.
 *
 * Args:
 *     file: The image File from an input element.
 *
 * Returns:
 *     Base64 data URL of the compressed image in PNG format.
 */
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/png");
      URL.revokeObjectURL(img.src);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };

    const url = URL.createObjectURL(file);
    img.src = url;
  });
}
