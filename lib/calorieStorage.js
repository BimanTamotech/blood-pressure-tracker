const MEALS_KEY = "calorie_tracker_meals";
const CHOLESTEROL_KEY = "cholesterol_tracker";

// ── Meals ──

export function getMeals() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MEALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveMeal(meal) {
  const meals = getMeals();
  meals.push(meal);
  localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  return meals;
}

export function deleteMeal(index) {
  const meals = getMeals();
  meals.splice(index, 1);
  localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  return meals;
}

export function downloadMealsCSV() {
  const meals = getMeals();
  const header = "date,time,total_calories,protein_g,carbs_g,fat_g,fiber_g,foods";
  const rows = meals.map((m) =>
    [
      m.date, m.time, m.total_calories ?? "", m.protein_g ?? "", m.carbs_g ?? "",
      m.fat_g ?? "", m.fiber_g ?? "",
      `"${(m.foods || []).map((f) => `${f.name} (${f.portion})`).join("; ")}"`,
    ].join(",")
  );
  const csv = header + "\n" + rows.join("\n") + "\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `meal-log-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Cholesterol ──

export function getCholesterol() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHOLESTEROL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCholesterolEntry(entry) {
  const entries = getCholesterol();
  entries.push(entry);
  localStorage.setItem(CHOLESTEROL_KEY, JSON.stringify(entries));
  return entries;
}

export function deleteCholesterolEntry(index) {
  const entries = getCholesterol();
  entries.splice(index, 1);
  localStorage.setItem(CHOLESTEROL_KEY, JSON.stringify(entries));
  return entries;
}

// ── Helper: aggregate meals by day ──

export function aggregateMealsByDay(meals) {
  const byDay = {};
  for (const m of meals) {
    if (!byDay[m.date]) {
      byDay[m.date] = { date: m.date, total_calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, count: 0 };
    }
    const d = byDay[m.date];
    d.total_calories += m.total_calories || 0;
    d.protein_g += m.protein_g || 0;
    d.carbs_g += m.carbs_g || 0;
    d.fat_g += m.fat_g || 0;
    d.fiber_g += m.fiber_g || 0;
    d.count++;
  }
  return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
}
