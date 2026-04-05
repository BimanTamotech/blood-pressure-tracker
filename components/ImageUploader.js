"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/imageUtils";

export default function ImageUploader({ label, image, onImageChange }) {
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [compressing, setCompressing] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      onImageChange(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => onImageChange(e.target.result);
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  }

  function handleInputChange(e) {
    handleFile(e.target.files[0]);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  }

  const isLeft = label.toLowerCase().includes("left");
  const btnClass = isLeft
    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100";

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </h3>

      {compressing ? (
        <div className="flex flex-col items-center justify-center h-48 md:h-56 rounded-xl border-2 border-gray-200 bg-gray-50">
          <svg className="animate-spin h-8 w-8 text-gray-400 mb-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-xs text-gray-400">Processing...</p>
        </div>
      ) : image ? (
        <div className="relative">
          <img
            src={image}
            alt={`${label} BP reading`}
            className="w-full h-48 md:h-56 object-contain rounded-xl border-2 border-gray-200 bg-gray-50"
          />
          <button
            onClick={() => onImageChange(null)}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7
                       flex items-center justify-center text-sm hover:bg-black/80 transition"
            aria-label="Remove image"
          >
            &times;
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center h-48 md:h-56 rounded-xl border-2 border-dashed
                      transition-all
                      ${dragOver
                        ? "border-rose-400 bg-rose-50"
                        : "border-gray-300 bg-gray-50"
                      }`}
        >
          <p className="text-xs text-gray-400 mb-3">
            Drag &amp; drop an image, or
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${btnClass}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              Take Photo
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${btnClass}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Zm16.5-13.5h.008v.008h-.008V7.5Z" />
              </svg>
              Gallery
            </button>
          </div>
        </div>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
