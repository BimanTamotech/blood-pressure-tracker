"use client";

import { useMemo } from "react";
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

export default function BPChart({ readings }) {
  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) return null;

    const sorted = [...readings].sort(
      (a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
    );

    const labels = sorted.map((r) => {
      const d = new Date(`${r.date}T${r.time}`);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + "\n" + r.time;
    });

    return {
      labels,
      datasets: [
        {
          label: "Left SYS",
          data: sorted.map((r) => r.left_systolic ?? null),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Left DIA",
          data: sorted.map((r) => r.left_diastolic ?? null),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.05)",
          borderWidth: 2,
          borderDash: [6, 3],
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: "Right SYS",
          data: sorted.map((r) => r.right_systolic ?? null),
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Right DIA",
          data: sorted.map((r) => r.right_diastolic ?? null),
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.05)",
          borderWidth: 2,
          borderDash: [6, 3],
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [readings]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          title(items) {
            if (!items.length) return "";
            const r = readings[items[0].dataIndex];
            return `${r?.date} at ${r?.time}`;
          },
          label(item) {
            return ` ${item.dataset.label}: ${item.raw ?? "N/A"} mmHg`;
          },
        },
      },
    },
    scales: {
      y: {
        title: { display: true, text: "Pressure (mmHg)", font: { size: 11 } },
        min: 40,
        max: 200,
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, maxRotation: 45 },
      },
    },
  };

  if (!chartData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          History
        </h2>
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          No readings yet. Save your first reading to see the chart.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        History
      </h2>
      <div className="h-64 md:h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
