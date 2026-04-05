/**
 * Extracts blood pressure readings from a BP monitor display image
 * using the Gemini vision model via the dmxapi.cn proxy.
 *
 * @param {string} base64Image - Base64-encoded image data (without the data URI prefix).
 * @param {string} mimeType - MIME type of the image (e.g. "image/jpeg").
 * @returns {Promise<{systolic: number|null, diastolic: number|null, pulse: number|null}>}
 */
export async function extractBPFromImage(base64Image, mimeType = "image/png") {
  const apiKey = process.env.AI_API_KEY;
  const endpoint = process.env.AI_ENDPOINT;
  const model = process.env.AI_MODEL;

  if (!apiKey || !endpoint || !model) {
    throw new Error("AI environment variables are not configured");
  }

  const FALLBACK_MODELS = [model, "gpt-4o-mini"];

  const prompt = 'You are analyzing a blood pressure monitor display image. Extract the systolic pressure (top/larger number in mmHg), diastolic pressure (bottom/smaller number in mmHg), and pulse rate (bpm). Return ONLY a valid JSON object with no extra text: {"systolic": <number>, "diastolic": <number>, "pulse": <number>}. If you cannot read a value, use null for that field.';

  let lastError;
  for (const currentModel of FALLBACK_MODELS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType};base64,${base64Image}` },
                },
              ],
            },
          ],
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = new Error(`AI API error (${response.status}) with model ${currentModel}: ${errorText}`);
        console.warn(`Model ${currentModel} failed, trying fallback...`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      if (!content) {
        lastError = new Error(`Model ${currentModel} returned empty response`);
        continue;
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        lastError = new Error(`Could not parse response from ${currentModel}: ${content}`);
        continue;
      }

      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      lastError = err;
      console.warn(`Model ${currentModel} error: ${err.message}`);
    }
  }

  throw lastError;
}

/**
 * Analyzes a meal photo and extracts nutritional information
 * using the same vision model proxy.
 *
 * @param {string} base64Image - Base64-encoded image data (without the data URI prefix).
 * @param {string} mimeType - MIME type of the image (e.g. "image/jpeg").
 * @returns {Promise<{foods: Array, total_calories: number, protein_g: number, carbs_g: number, fat_g: number, fiber_g: number}>}
 */
export async function analyzeMealFromImage(base64Image, mimeType = "image/png") {
  const apiKey = process.env.AI_API_KEY;
  const endpoint = process.env.AI_ENDPOINT;
  const model = process.env.AI_MODEL;

  if (!apiKey || !endpoint || !model) {
    throw new Error("AI environment variables are not configured");
  }

  const FALLBACK_MODELS = [model, "gpt-4o-mini"];

  const prompt = `You are a nutrition expert analyzing a photo of a meal. Identify each food item visible, estimate portion sizes, and calculate nutritional values. Return ONLY a valid JSON object with no extra text in this exact format:
{"foods":[{"name":"food name","portion":"estimated portion","calories":number}],"total_calories":number,"protein_g":number,"carbs_g":number,"fat_g":number,"fiber_g":number}
Be realistic with portions visible in the image. If unsure about a food item, make your best estimate. All numeric values must be numbers, not strings.`;

  let lastError;
  for (const currentModel of FALLBACK_MODELS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType};base64,${base64Image}` },
                },
              ],
            },
          ],
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = new Error(`AI API error (${response.status}) with model ${currentModel}: ${errorText}`);
        console.warn(`Model ${currentModel} failed, trying fallback...`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      if (!content) {
        lastError = new Error(`Model ${currentModel} returned empty response`);
        continue;
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        lastError = new Error(`Could not parse response from ${currentModel}: ${content}`);
        continue;
      }

      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      lastError = err;
      console.warn(`Model ${currentModel} error: ${err.message}`);
    }
  }

  throw lastError;
}
