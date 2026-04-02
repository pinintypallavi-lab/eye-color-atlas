export interface EyeHealthInfo {
  eyeColor: string;
  sensitivity: "Low" | "Moderate" | "High";
  risks: string[];
  recommendation: string;
  sensitivityScore: number; // 1-10 for chart
  diseaseRiskScore: number; // 1-10 for chart
}

export const eyeHealthData: Record<string, EyeHealthInfo> = {
  Brown: {
    eyeColor: "Brown",
    sensitivity: "Low",
    risks: ["Possible glaucoma-related pigmentation risk", "Cataract development in later age"],
    recommendation: "Regular eye checkup every 12 months",
    sensitivityScore: 3,
    diseaseRiskScore: 4,
  },
  Blue: {
    eyeColor: "Blue",
    sensitivity: "High",
    risks: ["High light sensitivity (photophobia)", "Increased UV damage risk", "Higher macular degeneration risk"],
    recommendation: "Use UV-blocking sunglasses in sunlight; avoid prolonged exposure",
    sensitivityScore: 9,
    diseaseRiskScore: 6,
  },
  Green: {
    eyeColor: "Green",
    sensitivity: "Moderate",
    risks: ["Moderate UV sensitivity", "Slightly elevated melanoma risk in iris"],
    recommendation: "Wear outdoor eye protection with UV coating",
    sensitivityScore: 6,
    diseaseRiskScore: 5,
  },
  Hazel: {
    eyeColor: "Hazel",
    sensitivity: "Moderate",
    risks: ["Moderate dry-eye sensitivity", "Fluctuating pigmentation under sunlight"],
    recommendation: "Stay hydrated and use lubricating eye drops as needed",
    sensitivityScore: 5,
    diseaseRiskScore: 4,
  },
  Amber: {
    eyeColor: "Amber",
    sensitivity: "Moderate",
    risks: ["Rare pigmentation sensitivity", "Lipofuscin accumulation risk"],
    recommendation: "Regular ophthalmic checkup every 6–12 months",
    sensitivityScore: 5,
    diseaseRiskScore: 3,
  },
  Gray: {
    eyeColor: "Gray",
    sensitivity: "High",
    risks: ["High light sensitivity", "Uveal melanoma association", "Glare discomfort"],
    recommendation: "Use anti-glare lenses and limit screen time in bright environments",
    sensitivityScore: 8,
    diseaseRiskScore: 5,
  },
  Black: {
    eyeColor: "Black",
    sensitivity: "Low",
    risks: ["Low light sensitivity", "Possible glaucoma-related pigmentation risk"],
    recommendation: "Regular eye checkup; monitor intraocular pressure",
    sensitivityScore: 2,
    diseaseRiskScore: 4,
  },
};

export const allHealthComparison = Object.values(eyeHealthData).map((h) => ({
  name: h.eyeColor,
  lightSensitivity: h.sensitivityScore,
  diseaseRisk: h.diseaseRiskScore,
}));
