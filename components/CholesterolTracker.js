"use client";

import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function todayStr() { return new Date().toISOString().split("T")[0]; }

function getLevel(type, value) {
  if (value == null) return { label: "--", color: "bg-gray-100 text-gray-500" };
  if (type === "ldl") {
    if (value < 100) return { label: "Optimal", color: "bg-green-100 text-green-700" };
    if (value < 130) return { label: "Near Optimal", color: "bg-lime-100 text-lime-700" };
    if (value < 160) return { label: "Borderline", color: "bg-yellow-100 text-yellow-700" };
    return { label: "High", color: "bg-red-100 text-red-700" };
  }
  if (type === "hdl") {
    if (value >= 60) return { label: "Good", color: "bg-green-100 text-green-700" };
    if (value >= 40) return { label: "Moderate", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Low", color: "bg-red-100 text-red-700" };
  }
  // triglycerides
  if (value < 150) return { label: "Normal", color: "bg-green-100 text-green-700" };
  if (value < 200) return { label: "Borderline", color: "bg-yellow-100 text-yellow-700" };
  return { label: "High", color: "bg-red-100 text-red-700" };
}

function getTrend(type, current, previous) {
  if (current == null || previous == null) return { arrow: "", color: "text-gray-400", label: "No trend" };
  const diff = current - previous;
  if (diff === 0) return { arrow: "→", color: "text-gray-500", label: "Stable" };

  const improving = type === "hdl" ? diff > 0 : diff < 0;
  return {
    arrow: diff > 0 ? "↑" : "↓",
    color: improving ? "text-green-600" : "text-red-600",
    label: improving ? "Improving" : "Worsening",
  };
}

export default function CholesterolTracker({ entries, onSave }) {
  const [date, setDate] = useState(todayStr);
  const [ldl, setLdl] = useState("");
  const [hdl, setHdl] = useState("");
  const [triglycerides, setTriglycerides] = useState("");

  const sorted = useMemo(() =>
    [...entries].sort((a, b) => a.date.localeCompare(b.date)),
  [entries]);

  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  function handleSave() {
    if (!ldl && !hdl && !triglycerides) return;
    onSave({
      date,
      ldl: ldl ? Number(ldl) : null,
      hdl: hdl ? Number(hdl) : null,
      triglycerides: triglycerides ? Number(triglycerides) : null,
    });
    setLdl(""); setHdl(""); setTriglycerides("");
    setDate(todayStr());
  }

  const chartData = useMemo(() => {
    if (sorted.length === 0) return null;
    const labels = sorted.map((e) => {
      const d = new Date(e.date + "T00:00:00");
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });
    return {
      labels,
      datasets: [
        {
          label: "LDL",
          data: sorted.map((e) => e.ldl ?? null),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderWidth: 2.5, tension: 0.3, pointRadius: 4,
        },
        {
          label: "HDL",
          data: sorted.map((e) => e.hdl ?? null),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          borderWidth: 2.5, tension: 0.3, pointRadius: 4,
        },
        {
          label: "Triglycerides",
          data: sorted.map((e) => e.triglycerides ?? null),
          borderColor: "rgb(168, 85, 247)",
          backgroundColor: "rgba(168, 85, 247, 0.1)",
          borderWidth: 2.5, tension: 0.3, pointRadius: 4,
        },
      ],
    };
  }, [sorted]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        callbacks: {
          label: (item) => ` ${item.dataset.label}: ${item.raw ?? "N/A"} mg/dL`,
        },
      },
    },
    scales: {
      y: {
        title: { display: true, text: "mg/dL", font: { size: 11 } },
        min: 0,
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } },
    },
  };

  const metrics = [
    { type: "ldl", label: "LDL", latestVal: latest?.ldl, prevVal: previous?.ldl },
    { type: "hdl", label: "HDL", latestVal: latest?.hdl, prevVal: previous?.hdl },
    { type: "triglycerides", label: "Triglycerides", latestVal: latest?.triglycerides, prevVal: previous?.triglycerides },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 space-y-5">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Cholesterol Tracker</h2>

      {/* Summary cards */}
      {latest && (
        <div className="grid grid-cols-3 gap-2">
          {metrics.map(({ type, label, latestVal, prevVal }) => {
            const level = getLevel(type, latestVal);
            const trend = getTrend(type, latestVal, prevVal);
            return (
              <div key={type} className="text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-gray-900">{latestVal ?? "--"}</p>
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${level.color}`}>
                  {level.label}
                </span>
                <p className={`text-xs mt-1 font-medium ${trend.color}`}>
                  {trend.arrow} {trend.label}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Input form */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-medium text-gray-500 mb-3">Add New Reading</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">LDL <span className="text-gray-400">mg/dL</span></label>
            <input type="number" value={ldl} onChange={(e) => setLdl(e.target.value)} placeholder="--"
              className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">HDL <span className="text-gray-400">mg/dL</span></label>
            <input type="number" value={hdl} onChange={(e) => setHdl(e.target.value)} placeholder="--"
              className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Triglycerides <span className="text-gray-400">mg/dL</span></label>
            <input type="number" value={triglycerides} onChange={(e) => setTriglycerides(e.target.value)} placeholder="--"
              className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
          </div>
        </div>
        <button onClick={handleSave} disabled={!ldl && !hdl && !triglycerides}
          className="mt-3 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm">
          Save Cholesterol Reading
        </button>
      </div>

      {/* Chart */}
      {chartData ? (
        <div className="h-64 md:h-72">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-36 text-gray-400 text-sm">
          No cholesterol data yet. Add your first reading above.
        </div>
      )}
    </div>
  );
}
