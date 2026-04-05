import { NextResponse } from "next/server";
import { analyzeMealFromImage } from "@/lib/ai";

export const maxDuration = 30;

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { image } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    let base64Data;
    let detectedMime = "image/png";

    if (image.startsWith("data:")) {
      const commaIndex = image.indexOf(",");
      if (commaIndex === -1) {
        return NextResponse.json({ error: "Invalid data URL format" }, { status: 400 });
      }
      const header = image.substring(0, commaIndex);
      base64Data = image.substring(commaIndex + 1);
      const mimeMatch = header.match(/data:([^;]+)/);
      if (mimeMatch) detectedMime = mimeMatch[1];
    } else {
      base64Data = image;
    }

    if (!base64Data || base64Data.length < 100) {
      return NextResponse.json({ error: "Image data too small or empty" }, { status: 400 });
    }

    const result = await analyzeMealFromImage(base64Data, detectedMime);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Meal analysis error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
