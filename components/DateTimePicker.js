"use client";

export default function DateTimePicker({ date, time, onDateChange, onTimeChange }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Date &amp; Time
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="bp-date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="bp-date"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 text-sm
                       focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
          />
        </div>
        <div>
          <label htmlFor="bp-time" className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <input
            id="bp-time"
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 text-sm
                       focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
          />
        </div>
      </div>
    </div>
  );
}
