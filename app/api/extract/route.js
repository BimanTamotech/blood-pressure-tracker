import { NextResponse } from "next/server";
import { extractBPFromImage } from "@/lib/ai";

export async function POST(request) {
  try {
    const { image, mimeType } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const detectedMime = mimeType || (image.startsWith("data:") ? image.split(";")[0].split(":")[1] : "image/jpeg");

    const result = await extractBPFromImage(base64Data, detectedMime);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Extract API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
