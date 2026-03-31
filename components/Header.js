"use client";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8 flex-shrink-0"
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Blood Pressure Tracker
          </h1>
          <p className="text-rose-100 text-xs md:text-sm">
            Upload, extract, and track your readings
          </p>
        </div>
      </div>
    </header>
  );
}
