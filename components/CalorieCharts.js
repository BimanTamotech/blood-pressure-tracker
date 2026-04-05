"use client";

import { useMemo, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { aggregateMealsByDay } from "@/lib/calorieStorage";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const RANGES = {
  day: { label: "Today", days: 1 },
  week: { label: "This Week", days: 7 },
  month: { label: "This Month", days: 30 },
};

function filterByRange(dailyData, rangeDays) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - rangeDays + 1);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return dailyData.filter((d) => d.date >= cutoffStr);
}

export default function CalorieCharts({ meals }) {
  const [range, setRange] = useState("week");

  const dailyData = useMemo(() => aggregateMealsByDay(meals), [meals]);
  const filtered = useMemo(() => filterByRange(dailyData, RANGES[range].days), [dailyData, range]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, d) => ({
        calories: acc.calories + d.total_calories,
        protein: acc.protein + d.protein_g,
        carbs: acc.carbs + d.carbs_g,
        fat: acc.fat + d.fat_g,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [filtered]);

  const doughnutData = {
    labels: ["Protein", "Carbs", "Fat"],
    datasets: [{
      data: [totals.protein, totals.carbs, totals.fat],
      backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(234, 179, 8, 0.8)", "rgba(239, 68, 68, 0.8)"],
      borderColor: ["rgb(59, 130, 246)", "rgb(234, 179, 8)", "rgb(239, 68, 68)"],
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (item) => ` ${item.label}: ${Math.round(item.raw)}g`,
        },
      },
    },
  };

  const barData = {
    labels: filtered.map((d) => {
      const dt = new Date(d.date + "T00:00:00");
      return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }),
    datasets: [
      {
        label: "Protein (kcal)",
        data: filtered.map((d) => Math.round(d.protein_g * 4)),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      },
      {
        label: "Carbs (kcal)",
        data: filtered.map((d) => Math.round(d.carbs_g * 4)),
        backgroundColor: "rgba(234, 179, 8, 0.7)",
      },
      {
        label: "Fat (kcal)",
        data: filtered.map((d) => Math.round(d.fat_g * 9)),
        backgroundColor: "rgba(239, 68, 68, 0.7)",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          afterBody: (items) => {
            const total = items.reduce((s, i) => s + (i.raw || 0), 0);
            return `\nTotal: ${total} kcal`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { stacked: true, title: { display: true, text: "kcal", font: { size: 11 } }, grid: { color: "rgba(0,0,0,0.05)" } },
    },
  };

  const hasData = meals.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Calorie Overview</h2>
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          {Object.entries(RANGES).map(([key, { label }]) => (
            <button key={key} onClick={() => setRange(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {label.split(" ").pop()}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          No meals logged yet. Log your first meal to see charts.
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          No data for {RANGES[range].label.toLowerCase()}.
        </div>
      ) : (
        <>
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-gray-900">{Math.round(totals.calories)}</span>
            <span className="text-sm text-gray-500 ml-1">kcal total</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 text-center">Macro Breakdown</p>
              <div className="h-52">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 text-center">Daily Calories</p>
              <div className="h-52">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Protein", value: `${Math.round(totals.protein)}g`, color: "text-blue-600 bg-blue-50" },
              { label: "Carbs", value: `${Math.round(totals.carbs)}g`, color: "text-yellow-600 bg-yellow-50" },
              { label: "Fat", value: `${Math.round(totals.fat)}g`, color: "text-red-600 bg-red-50" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-lg px-3 py-2 text-center ${color}`}>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-xs">{label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
