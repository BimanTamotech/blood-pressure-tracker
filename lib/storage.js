const STORAGE_KEY = "bp_tracker_readings";

/**
 * Reads all BP readings from localStorage.
 *
 * @returns {Array<object>} Array of reading objects sorted by date/time.
 */
export function getReadings() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves a new BP reading to localStorage.
 *
 * @param {object} reading - The reading object to save.
 * @returns {Array<object>} Updated array of all readings.
 */
export function saveReading(reading) {
  const readings = getReadings();
  readings.push(reading);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  return readings;
}

/**
 * Deletes a reading at the given index.
 *
 * @param {number} index - Index of reading to remove.
 * @returns {Array<object>} Updated array of all readings.
 */
export function deleteReading(index) {
  const readings = getReadings();
  readings.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  return readings;
}

/**
 * Exports all readings as a CSV string.
 *
 * @returns {string} CSV content with headers.
 */
export function exportCSV() {
  const readings = getReadings();
  const header = "date,time,left_systolic,left_diastolic,left_pulse,right_systolic,right_diastolic,right_pulse";
  if (readings.length === 0) return header + "\n";

  const rows = readings.map((r) =>
    [
      r.date, r.time,
      r.left_systolic ?? "", r.left_diastolic ?? "", r.left_pulse ?? "",
      r.right_systolic ?? "", r.right_diastolic ?? "", r.right_pulse ?? "",
    ].join(",")
  );

  return header + "\n" + rows.join("\n") + "\n";
}

/**
 * Imports readings from a CSV string (merges with existing data).
 *
 * @param {string} csvText - Raw CSV text with headers.
 * @returns {Array<object>} Updated array of all readings.
 */
export function importCSV(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length <= 1) return getReadings();

  const headers = lines[0].split(",").map((h) => h.trim());
  const imported = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const obj = {};
    headers.forEach((h, i) => {
      const val = values[i] || "";
      obj[h] = val === "" ? null : isNaN(val) ? val : Number(val);
    });
    return obj;
  });

  const existing = getReadings();
  const existingKeys = new Set(existing.map((r) => `${r.date}_${r.time}`));
  const newReadings = imported.filter((r) => !existingKeys.has(`${r.date}_${r.time}`));

  const merged = [...existing, ...newReadings];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

/**
 * Triggers a CSV file download in the browser.
 */
export function downloadCSV() {
  const csv = exportCSV();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bp-readings-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
