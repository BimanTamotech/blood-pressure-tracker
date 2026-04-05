"use client";

import { useMemo } from "react";

export default function DietImpact({ meals, cholesterolEntries }) {
  const analysis = useMemo(() => {
    if (meals.length === 0 && cholesterolEntries.length === 0) return null;

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.toISOString().split("T")[0];

    const recentMeals = meals.filter((m) => m.date >= cutoff);
    const uniqueDays = new Set(recentMeals.map((m) => m.date)).size || 1;

    const totalFat = recentMeals.reduce((s, m) => s + (m.fat_g || 0), 0);
    const totalCalories = recentMeals.reduce((s, m) => s + (m.total_calories || 0), 0);
    const totalFiber = recentMeals.reduce((s, m) => s + (m.fiber_g || 0), 0);

    const avgDailyFat = Math.round(totalFat / uniqueDays);
    const avgDailyCalories = Math.round(totalCalories / uniqueDays);
    const avgDailyFiber = Math.round(totalFiber / uniqueDays);

    const sortedChol = [...cholesterolEntries].sort((a, b) => a.date.localeCompare(b.date));
    let ldlTrend = "unknown";
    let hdlTrend = "unknown";

    if (sortedChol.length >= 2) {
      const latest = sortedChol[sortedChol.length - 1];
      const prev = sortedChol[sortedChol.length - 2];
      if (latest.ldl != null && prev.ldl != null) {
        ldlTrend = latest.ldl < prev.ldl ? "improving" : latest.ldl > prev.ldl ? "worsening" : "stable";
      }
      if (latest.hdl != null && prev.hdl != null) {
        hdlTrend = latest.hdl > prev.hdl ? "improving" : latest.hdl < prev.hdl ? "worsening" : "stable";
      }
    }

    const fatRatio = totalCalories > 0 ? Math.round((totalFat * 9 / totalCalories) * 100) : 0;

    return { avgDailyFat, avgDailyCalories, avgDailyFiber, ldlTrend, hdlTrend, fatRatio, mealCount: recentMeals.length, uniqueDays };
  }, [meals, cholesterolEntries]);

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Diet Impact on Cholesterol</h2>
        <p className="text-sm text-gray-400">Log meals and cholesterol readings to see diet impact analysis.</p>
      </div>
    );
  }

  const trendIcon = (trend) => {
    if (trend === "improving") return <span className="text-green-600 font-semibold">Improving ↓</span>;
    if (trend === "worsening") return <span className="text-red-600 font-semibold">Worsening ↑</span>;
    if (trend === "stable") return <span className="text-gray-600 font-semibold">Stable →</span>;
    return <span className="text-gray-400">Not enough data</span>;
  };

  const hdlTrendIcon = (trend) => {
    if (trend === "improving") return <span className="text-green-600 font-semibold">Improving ↑</span>;
    if (trend === "worsening") return <span className="text-red-600 font-semibold">Worsening ↓</span>;
    if (trend === "stable") return <span className="text-gray-600 font-semibold">Stable →</span>;
    return <span className="text-gray-400">Not enough data</span>;
  };

  const fatWarning = analysis.fatRatio > 35;
  const fiberLow = analysis.avgDailyFiber < 25;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Diet Impact on Cholesterol</h2>
      <p className="text-xs text-gray-400">Based on {analysis.mealCount} meals over {analysis.uniqueDays} days (last 30 days)</p>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-gray-900">{analysis.avgDailyCalories}</p>
          <p className="text-xs text-gray-500">Avg daily kcal</p>
        </div>
        <div className={`rounded-lg p-3 text-center ${fatWarning ? "bg-red-50" : "bg-gray-50"}`}>
          <p className={`text-lg font-bold ${fatWarning ? "text-red-700" : "text-gray-900"}`}>{analysis.avgDailyFat}g</p>
          <p className="text-xs text-gray-500">Avg daily fat</p>
          {fatWarning && <p className="text-xs text-red-500 mt-0.5">High ({analysis.fatRatio}% of cal)</p>}
        </div>
        <div className={`rounded-lg p-3 text-center ${fiberLow ? "bg-yellow-50" : "bg-gray-50"}`}>
          <p className={`text-lg font-bold ${fiberLow ? "text-yellow-700" : "text-gray-900"}`}>{analysis.avgDailyFiber}g</p>
          <p className="text-xs text-gray-500">Avg daily fiber</p>
          {fiberLow && <p className="text-xs text-yellow-600 mt-0.5">Below 25g target</p>}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">LDL Trend</span>
          {trendIcon(analysis.ldlTrend)}
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">HDL Trend</span>
          {hdlTrendIcon(analysis.hdlTrend)}
        </div>
      </div>

      {(fatWarning || fiberLow) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-medium text-amber-800">Suggestions</p>
          <ul className="text-xs text-amber-700 mt-1 space-y-1">
            {fatWarning && <li>- Reduce saturated fat intake to help lower LDL levels</li>}
            {fiberLow && <li>- Increase dietary fiber (target 25-30g/day) to support cholesterol management</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
