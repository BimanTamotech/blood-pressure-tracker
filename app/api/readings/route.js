import { NextResponse } from "next/server";
import { fetchCSVFromGitHub, writeCSVToGitHub } from "@/lib/github";
import { parseCSV, serializeCSV } from "@/lib/csv";

export async function GET() {
  try {
    const { content } = await fetchCSVFromGitHub();
    const readings = parseCSV(content);
    return NextResponse.json(readings);
  } catch (error) {
    console.error("Readings GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newReading = await request.json();

    const required = ["date", "time"];
    for (const field of required) {
      if (!newReading[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const { content, sha } = await fetchCSVFromGitHub();
    const readings = parseCSV(content);
    readings.push(newReading);

    const csv = serializeCSV(readings);
    await writeCSVToGitHub(csv, sha, `Add BP reading for ${newReading.date} ${newReading.time}`);

    return NextResponse.json({ success: true, reading: newReading });
  } catch (error) {
    console.error("Readings POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
