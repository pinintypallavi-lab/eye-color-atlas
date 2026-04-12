import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const CATEGORY_META = {
  brown: { name: "Brown", hex: "#7B4F32" },
  black: { name: "Dark / Black", hex: "#1A0A00" },
  blue: { name: "Blue", hex: "#4A90D9" },
  green: { name: "Green", hex: "#4A7C4E" },
  hazel: { name: "Hazel", hex: "#8E6B3E" },
  amber: { name: "Amber", hex: "#C8940A" },
  grey: { name: "Gray", hex: "#7E9BA8" },
  violet: { name: "Violet / Purple", hex: "#7B2D8B" },
} as const;

type Category = keyof typeof CATEGORY_META;

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

function hexToRgb(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return { hue: 0, saturation: 0, lightness };
  }

  const saturation =
    lightness > 0.5
      ? delta / (2 - max - min)
      : delta / (max + min);

  let hue: number;

  if (max === red) {
    hue = (green - blue) / delta + (green < blue ? 6 : 0);
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  return { hue: hue * 60, saturation, lightness };
}

function classifyCategory(hex: string): Category {
  const { hue, saturation, lightness } = rgbToHsl(hex);

  if (lightness < 0.12) return "black";
  if (saturation < 0.12 && lightness > 0.35) return "grey";
  if (hue >= 20 && hue <= 48) return lightness < 0.42 ? "brown" : "amber";
  if (hue > 48 && hue <= 70) return "hazel";
  if (hue > 70 && hue <= 165) return "green";
  if (hue > 165 && hue <= 255) return "blue";
  if (hue > 255 && hue <= 320) return "violet";
  return lightness < 0.3 ? "brown" : "hazel";
}

function describeShade(hex: string, category: Category) {
  const { hue, saturation, lightness } = rgbToHsl(hex);

  const depth =
    lightness < 0.18
      ? "Deep"
      : lightness < 0.35
        ? "Rich"
        : lightness > 0.72
          ? "Soft"
          : "Warm";

  const tone =
    saturation < 0.18
      ? "Muted"
      : saturation > 0.55
        ? "Vivid"
        : "Smoky";

  const palette: Record<Category, string[]> = {
    black: ["Onyx", "Midnight", "Obsidian"],
    brown: ["Espresso", "Chestnut", "Walnut"],
    blue: ["Steel", "Ocean", "Sky"],
    green: ["Moss", "Forest", "Sage"],
    hazel: ["Hazel", "Olive", "Moss"],
    amber: ["Honey", "Amber", "Golden"],
    grey: ["Slate", "Mist", "Silver"],
    violet: ["Violet", "Amethyst", "Plum"],
  };

  const names = palette[category];
  const index = Math.min(
    names.length - 1,
    Math.floor(((hue % 360) / 360) * names.length),
  );

  return `${depth} ${tone} ${names[index]}`;
}

async function detectWithOpenAI(imageData: string, exactHex: string | null) {
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

  if (!apiKey) {
    return null;
  }

  const openai = new OpenAI({
    baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
    apiKey,
  });

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
- "name": a poetic descriptive colour name (2-4 words, e.g. "Smoky Steel Blue", "Warm Amber Honey", "Deep Forest Green", "Soft Dove Grey", "Rich Dark Espresso"). Be precise and evocative.
- "category": one word from: brown, black, blue, green, hazel, amber, grey, violet

Reply with ONLY valid compact JSON, no markdown, no other text.
Example: {"name":"Smoky Steel Blue","category":"blue"}`,
          },
        ],
      },
    ],
  });

  const raw = (response.choices[0]?.message?.content ?? "").trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return null;
  }

  return JSON.parse(jsonMatch[0]) as { name?: string; category?: string };
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

    const exactHex =
      sampledHex && isValidHex(sampledHex) ? sampledHex : null;

    let parsed: { name?: string; category?: string } | null = null;

    try {
      parsed = await detectWithOpenAI(imageData, exactHex);
    } catch (error) {
      console.warn("OpenAI analysis unavailable, using local fallback:", error);
    }

    const fallbackHex = exactHex ?? CATEGORY_META.brown.hex;
    const fallbackCategory = classifyCategory(fallbackHex);
    const parsedCategory = parsed?.category?.toLowerCase();
    const category =
      parsedCategory && parsedCategory in CATEGORY_META
        ? (parsedCategory as Category)
        : fallbackCategory;

    const categoryMeta = CATEGORY_META[category];
    const exactName =
      typeof parsed?.name === "string" && parsed.name.trim()
        ? parsed.name.trim()
        : describeShade(fallbackHex, category);

    res.json({
      id: category,
      name: categoryMeta.name,
      exactName,
      hex: exactHex ?? categoryMeta.hex,
      categoryHex: categoryMeta.hex,
    });
  } catch (err) {
    console.error("analyze-eye error:", err);
    res.status(500).json({ error: "Failed to analyse eye colour" });
  }
});

export default router;
