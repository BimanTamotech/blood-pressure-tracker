"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import DateTimePicker from "@/components/DateTimePicker";
import ImageUploader from "@/components/ImageUploader";
import ReadingForm from "@/components/ReadingForm";
import BPChart from "@/components/BPChart";

const emptyValues = { systolic: null, diastolic: null, pulse: null };

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function nowTimeStr() {
  return new Date().toTimeString().slice(0, 5);
}

export default function Home() {
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(nowTimeStr);

  const [leftImage, setLeftImage] = useState(null);
  const [rightImage, setRightImage] = useState(null);

  const [leftValues, setLeftValues] = useState(emptyValues);
  const [rightValues, setRightValues] = useState(emptyValues);

  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [readings, setReadings] = useState([]);
  const [status, setStatus] = useState(null);

  const fetchReadings = useCallback(async () => {
    try {
      const res = await fetch("/api/readings");
      if (res.ok) {
        const data = await res.json();
        setReadings(data);
      }
    } catch {
      // GitHub might not be configured yet
    }
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  async function extractFromImage(imageData) {
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageData }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Extraction failed");
    }

    return res.json();
  }

  async function handleExtract() {
    if (!leftImage && !rightImage) {
      setStatus({ type: "error", msg: "Upload at least one image first" });
      return;
    }

    setExtracting(true);
    setStatus(null);

    try {
      const promises = [];

      if (leftImage) {
        promises.push(
          extractFromImage(leftImage).then((vals) => setLeftValues(vals))
        );
      }
      if (rightImage) {
        promises.push(
          extractFromImage(rightImage).then((vals) => setRightValues(vals))
        );
      }

      await Promise.all(promises);
      setStatus({ type: "success", msg: "Values extracted successfully! Review and save." });
    } catch (err) {
      setStatus({ type: "error", msg: `Extraction error: ${err.message}` });
    } finally {
      setExtracting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    try {
      const reading = {
        date,
        time,
        left_systolic: leftValues.systolic,
        left_diastolic: leftValues.diastolic,
        left_pulse: leftValues.pulse,
        right_systolic: rightValues.systolic,
        right_diastolic: rightValues.diastolic,
        right_pulse: rightValues.pulse,
      };

      const res = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reading),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      setStatus({ type: "success", msg: "Reading saved successfully!" });
      setLeftImage(null);
      setRightImage(null);
      setLeftValues(emptyValues);
      setRightValues(emptyValues);
      setDate(todayStr());
      setTime(nowTimeStr());

      await fetchReadings();
    } catch (err) {
      setStatus({ type: "error", msg: `Save error: ${err.message}` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-5">
        {status && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              status.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {status.msg}
          </div>
        )}

        <DateTimePicker
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Upload BP Monitor Images
          </h2>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <ImageUploader
              label="Left Arm"
              image={leftImage}
              onImageChange={setLeftImage}
            />
            <ImageUploader
              label="Right Arm"
              image={rightImage}
              onImageChange={setRightImage}
            />
          </div>

          <button
            onClick={handleExtract}
            disabled={extracting || (!leftImage && !rightImage)}
            className="mt-4 w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed
                       text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
          >
            {extracting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Extracting values...
              </span>
            ) : (
              "Extract Values from Images"
            )}
          </button>
        </div>

        <ReadingForm
          leftValues={leftValues}
          rightValues={rightValues}
          onLeftChange={setLeftValues}
          onRightChange={setRightValues}
          onSave={handleSave}
          saving={saving}
        />

        <BPChart readings={readings} />
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        Blood Pressure Tracker &middot; Data stored in GitHub
      </footer>
    </>
  );
}
