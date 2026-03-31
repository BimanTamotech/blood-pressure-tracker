const CSV_HEADER = "date,time,left_systolic,left_diastolic,left_pulse,right_systolic,right_diastolic,right_pulse";

/**
 * Parses a CSV string into an array of reading objects.
 *
 * @param {string} csvText - Raw CSV text with headers.
 * @returns {Array<object>} Array of reading objects.
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length <= 1) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const obj = {};
    headers.forEach((h, i) => {
      const val = values[i] || "";
      obj[h] = isNaN(val) || val === "" ? val : Number(val);
    });
    return obj;
  });
}

/**
 * Serializes readings array back to CSV text.
 *
 * @param {Array<object>} readings - Array of reading objects.
 * @returns {string} CSV text with headers.
 */
export function serializeCSV(readings) {
  if (readings.length === 0) return CSV_HEADER + "\n";

  const lines = readings.map((r) =>
    [
      r.date,
      r.time,
      r.left_systolic ?? "",
      r.left_diastolic ?? "",
      r.left_pulse ?? "",
      r.right_systolic ?? "",
      r.right_diastolic ?? "",
      r.right_pulse ?? "",
    ].join(",")
  );

  return CSV_HEADER + "\n" + lines.join("\n") + "\n";
}
