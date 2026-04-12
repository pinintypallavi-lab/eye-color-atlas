import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

const CATEGORY_META: Record<string, { name: string; hex: string }> = {
  brown:  { name: "Brown",           hex: "#7B4F32" },
  black:  { name: "Dark / Black",    hex: "#1A0A00" },
  blue:   { name: "Blue",            hex: "#4A90D9" },
  green:  { name: "Green",           hex: "#4A7C4E" },
  hazel:  { name: "Hazel",           hex: "#8E6B3E" },
  amber:  { name: "Amber",           hex: "#C8940A" },
  grey:   { name: "Gray",            hex: "#7E9BA8" },
  violet: { name: "Violet / Purple", hex: "#7B2D8B" },
};

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

router.post("/analyze-eye", async (req, res) => {
  try {
    const { imageData, sampledHex } = req.body as {
      imageData?: string;
      sampledHex?: string;
    };

    if (!imageData || !imageData.startsWith("data:image/")) {
      res.status(400).json({ error: "imageData must be a base64 data URL" });
      return;
    }

    // Use the pixel-sampled hex if provided and valid — it's read directly
    // from the image pixels so it is the most accurate colour possible.
    const exactHex =
      sampledHex && isValidHex(sampledHex) ? sampledHex : null;

    // Ask GPT-4o only for the descriptive name and category.
    // If we already have the exact hex from pixel sampling, tell the model
    // what colour it is so it can name it accurately.
    const hexHint = exactHex
      ? `The iris pixel colour has already been measured precisely as ${exactHex}. `
      : "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 80,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageData, detail: "high" },
            },
            {
              type: "text",
              text: `You are an expert iris colour analyst. ${hexHint}Look at the iris in this eye image.

Return a JSON object with:
- "name": a poetic descriptive colour name (2–4 words, e.g. "Smoky Steel Blue", "Warm Amber Honey", "Deep Forest Green", "Soft Dove Grey", "Rich Dark Espresso"). Be precise and evocative — avoid generic single words.
- "category": one word from: brown, black, blue, green, hazel, amber, grey, violet

Reply with ONLY valid compact JSON, no markdown, no other text.
Example: {"name":"Smoky Steel Blue","category":"blue"}`,
            },
          ],
        },
      ],
    });

    const raw = (response.choices[0]?.message?.content ?? "").trim();

    let parsed: { name?: string; category?: string } = {};
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = {};
    }

    const exactName =
      typeof parsed.name === "string" && parsed.name.trim()
        ? parsed.name.trim()
        : "Unknown Shade";

    const category =
      typeof parsed.category === "string" &&
      Object.keys(CATEGORY_META).includes(parsed.category.toLowerCase())
        ? parsed.category.toLowerCase()
        : "brown";

    const categoryMeta = CATEGORY_META[category]!;

    // Final hex: pixel-sampled (exact) takes priority; fall back to category default
    const finalHex = exactHex ?? categoryMeta.hex;

    res.json({
      id: category,
      name: categoryMeta.name,
      exactName,
      hex: finalHex,
      categoryHex: categoryMeta.hex,
    });
  } catch (err) {
    console.error("analyze-eye error:", err);
    res.status(500).json({ error: "Failed to analyse eye colour" });
  }
});

export default router;
