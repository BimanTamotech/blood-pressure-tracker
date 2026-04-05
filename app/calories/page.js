"use client";

import { useState, useEffect } from "react";
import MealLogger from "@/components/MealLogger";
import CalorieCharts from "@/components/CalorieCharts";
import CholesterolTracker from "@/components/CholesterolTracker";
import DietImpact from "@/components/DietImpact";
import {
  getMeals, saveMeal, downloadMealsCSV,
  getCholesterol, saveCholesterolEntry,
} from "@/lib/calorieStorage";

export default function CaloriesPage() {
  const [meals, setMeals] = useState([]);
  const [cholesterol, setCholesterol] = useState([]);

  useEffect(() => {
    setMeals(getMeals());
    setCholesterol(getCholesterol());
  }, []);

  function handleSaveMeal(meal) {
    const updated = saveMeal(meal);
    setMeals(updated);
  }

  function handleSaveCholesterol(entry) {
    const updated = saveCholesterolEntry(entry);
    setCholesterol(updated);
  }

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-5">
      <MealLogger onSave={handleSaveMeal} />

      <CalorieCharts meals={meals} />

      <CholesterolTracker entries={cholesterol} onSave={handleSaveCholesterol} />

      <DietImpact meals={meals} cholesterolEntries={cholesterol} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Data Management</h2>
        <button onClick={downloadMealsCSV} disabled={meals.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export Meals CSV
        </button>
        <p className="text-xs text-gray-400 mt-2">All data is stored in your browser.</p>
      </div>
    </main>
  );
}
