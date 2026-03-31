"use client";

function ValueInput({ label, value, onChange, unit }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-gray-900 text-sm
                     focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
          placeholder="--"
        />
        <span className="text-xs text-gray-400 whitespace-nowrap">{unit}</span>
      </div>
    </div>
  );
}

export default function ReadingForm({ leftValues, rightValues, onLeftChange, onRightChange, onSave, saving }) {
  const hasAnyValues =
    leftValues.systolic != null ||
    leftValues.diastolic != null ||
    rightValues.systolic != null ||
    rightValues.diastolic != null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Readings
      </h2>

      <div className="space-y-5">
        {/* Left arm */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span className="text-sm font-semibold text-gray-700">Left Arm</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ValueInput
              label="SYS"
              value={leftValues.systolic}
              onChange={(v) => onLeftChange({ ...leftValues, systolic: v })}
              unit="mmHg"
            />
            <ValueInput
              label="DIA"
              value={leftValues.diastolic}
              onChange={(v) => onLeftChange({ ...leftValues, diastolic: v })}
              unit="mmHg"
            />
            <ValueInput
              label="Pulse"
              value={leftValues.pulse}
              onChange={(v) => onLeftChange({ ...leftValues, pulse: v })}
              unit="bpm"
            />
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Right arm */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-sm font-semibold text-gray-700">Right Arm</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ValueInput
              label="SYS"
              value={rightValues.systolic}
              onChange={(v) => onRightChange({ ...rightValues, systolic: v })}
              unit="mmHg"
            />
            <ValueInput
              label="DIA"
              value={rightValues.diastolic}
              onChange={(v) => onRightChange({ ...rightValues, diastolic: v })}
              unit="mmHg"
            />
            <ValueInput
              label="Pulse"
              value={rightValues.pulse}
              onChange={(v) => onRightChange({ ...rightValues, pulse: v })}
              unit="bpm"
            />
          </div>
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={!hasAnyValues || saving}
        className="mt-5 w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                   text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
      >
        {saving ? "Saving..." : "Save Reading"}
      </button>
    </div>
  );
}
