"use client";

import { useState } from "react";
import DateTimePicker from "@/components/DateTimePicker";
import ImageUploader from "@/components/ImageUploader";

function todayStr() { return new Date().toISOString().split("T")[0]; }
function nowTimeStr() { return new Date().toTimeString().slice(0, 5); }

const emptyNutrition = { foods: [], total_calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };

export default function MealLogger({ onSave }) {
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(nowTimeStr);
  const [image, setImage] = useState(null);
  const [nutrition, setNutrition] = useState(emptyNutrition);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);

  async function handleAnalyze() {
    if (!image) {
      setStatus({ type: "error", msg: "Upload a meal photo first" });
      return;
    }
    setAnalyzing(true);
    setStatus(null);
    try {
      let res;
      try {
        res = await fetch("/api/analyze-meal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image }),
        });
      } catch {
        throw new Error("Image too large. Try a smaller photo.");
      }
      if (!res.ok) {
        let errMsg = "Analysis failed";
        try { const err = await res.json(); errMsg = err.error || errMsg; } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setNutrition(data);
      setAnalyzed(true);
      setStatus({ type: "success", msg: "Meal analyzed! Review values and save." });
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setAnalyzing(false);
    }
  }

  function handleSave() {
    setSaving(true);
    try {
      onSave({
        date, time,
        foods: nutrition.foods,
        total_calories: nutrition.total_calories,
        protein_g: nutrition.protein_g,
        carbs_g: nutrition.carbs_g,
        fat_g: nutrition.fat_g,
        fiber_g: nutrition.fiber_g,
      });
      setImage(null);
      setNutrition(emptyNutrition);
      setAnalyzed(false);
      setDate(todayStr());
      setTime(nowTimeStr());
      setStatus({ type: "success", msg: "Meal saved!" });
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  function updateField(field, value) {
    setNutrition((prev) => ({ ...prev, [field]: value === "" ? 0 : Number(value) }));
  }

  return (
    <div className="space-y-4">
      {status && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          status.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
        }`}>{status.msg}</div>
      )}

      <DateTimePicker date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Meal Photo</h2>
        <div className="max-w-sm mx-auto">
          <ImageUploader label="Meal" image={image} onImageChange={setImage} />
        </div>
        <button onClick={handleAnalyze} disabled={analyzing || !image}
          className="mt-4 w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm">
          {analyzing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Analyzing meal...
            </span>
          ) : "Analyze Meal"}
        </button>
      </div>

      {analyzed && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Nutrition Results</h2>

          {nutrition.foods.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">Detected Foods</p>
              {nutrition.foods.map((f, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span className="text-gray-700">{f.name} <span className="text-gray-400">({f.portion})</span></span>
                  <span className="font-medium text-gray-900">{f.calories} kcal</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Calories", field: "total_calories", unit: "kcal", color: "text-orange-600" },
              { label: "Protein", field: "protein_g", unit: "g", color: "text-blue-600" },
              { label: "Carbs", field: "carbs_g", unit: "g", color: "text-yellow-600" },
              { label: "Fat", field: "fat_g", unit: "g", color: "text-red-500" },
              { label: "Fiber", field: "fiber_g", unit: "g", color: "text-green-600" },
            ].map(({ label, field, unit, color }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                <div className="flex items-center gap-1">
                  <input type="number" value={nutrition[field] ?? 0}
                    onChange={(e) => updateField(field, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" />
                  <span className={`text-xs whitespace-nowrap ${color}`}>{unit}</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm">
            {saving ? "Saving..." : "Save Meal"}
          </button>
        </div>
      )}
    </div>
  );
}
