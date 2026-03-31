"use client";

import { useRef, useState } from "react";

export default function ImageUploader({ label, image, onImageChange }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onImageChange(e.target.result);
    reader.readAsDataURL(file);
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

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </h3>

      {image ? (
        <div className="relative group">
          <img
            src={image}
            alt={`${label} BP reading`}
            className="w-full h-48 md:h-56 object-contain rounded-xl border-2 border-gray-200 bg-gray-50"
          />
          <button
            onClick={() => onImageChange(null)}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7
                       flex items-center justify-center text-sm hover:bg-black/80 transition
                       opacity-0 group-hover:opacity-100"
            aria-label="Remove image"
          >
            &times;
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center h-48 md:h-56 rounded-xl border-2 border-dashed
                      cursor-pointer transition-all
                      ${dragOver
                        ? "border-rose-400 bg-rose-50"
                        : "border-gray-300 bg-gray-50 hover:border-rose-300 hover:bg-rose-50/50"
                      }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-10 h-10 mb-2 ${isLeft ? "text-blue-400" : "text-emerald-400"}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
            />
          </svg>
          <p className="text-sm text-gray-500 font-medium">
            Tap to upload or take photo
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Drag &amp; drop or click to browse
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFile(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
}
