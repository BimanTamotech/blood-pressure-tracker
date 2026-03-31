/**
 * Extracts blood pressure readings from a BP monitor display image
 * using the Gemini vision model via the dmxapi.cn proxy.
 *
 * @param {string} base64Image - Base64-encoded image data (without the data URI prefix).
 * @param {string} mimeType - MIME type of the image (e.g. "image/jpeg").
 * @returns {Promise<{systolic: number|null, diastolic: number|null, pulse: number|null}>}
 */
export async function extractBPFromImage(base64Image, mimeType = "image/jpeg") {
  const apiKey = process.env.AI_API_KEY;
  const endpoint = process.env.AI_ENDPOINT;
  const model = process.env.AI_MODEL;

  if (!apiKey || !endpoint || !model) {
    throw new Error("AI environment variables are not configured");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'You are analyzing a blood pressure monitor display image. Extract the systolic pressure (top/larger number in mmHg), diastolic pressure (bottom/smaller number in mmHg), and pulse rate (bpm). Return ONLY a valid JSON object with no extra text: {"systolic": <number>, "diastolic": <number>, "pulse": <number>}. If you cannot read a value, use null for that field.',
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("AI returned empty response");
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Could not parse AI response as JSON: ${content}`);
  }

  return JSON.parse(jsonMatch[0]);
}
