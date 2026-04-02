export interface EyeColorEntry {
  eye_color: string;
  country: string;
  population_with_eye_color: number;
  percentage: number;
  region: string;
  resembles_countries: string[];
}

export const eyeColorData: EyeColorEntry[] = [
  // Brown
  { eye_color: "Brown", country: "India", population_with_eye_color: 1200000000, percentage: 85, region: "Asia", resembles_countries: ["Pakistan", "Bangladesh", "Sri Lanka"] },
  { eye_color: "Brown", country: "China", population_with_eye_color: 1100000000, percentage: 78, region: "Asia", resembles_countries: ["Japan", "South Korea", "Vietnam"] },
  { eye_color: "Brown", country: "Brazil", population_with_eye_color: 140000000, percentage: 65, region: "South America", resembles_countries: ["Argentina", "Colombia", "Peru"] },
  { eye_color: "Brown", country: "Nigeria", population_with_eye_color: 195000000, percentage: 92, region: "Africa", resembles_countries: ["Ghana", "Cameroon", "Senegal"] },
  { eye_color: "Brown", country: "Mexico", population_with_eye_color: 100000000, percentage: 78, region: "North America", resembles_countries: ["Guatemala", "Honduras", "El Salvador"] },
  { eye_color: "Brown", country: "Turkey", population_with_eye_color: 60000000, percentage: 70, region: "Europe", resembles_countries: ["Greece", "Iran", "Iraq"] },
  { eye_color: "Brown", country: "Indonesia", population_with_eye_color: 240000000, percentage: 88, region: "Asia", resembles_countries: ["Malaysia", "Philippines", "Thailand"] },
  { eye_color: "Brown", country: "Egypt", population_with_eye_color: 85000000, percentage: 82, region: "Africa", resembles_countries: ["Libya", "Tunisia", "Morocco"] },

  // Blue
  { eye_color: "Blue", country: "Finland", population_with_eye_color: 4700000, percentage: 89, region: "Europe", resembles_countries: ["Estonia", "Sweden", "Norway"] },
  { eye_color: "Blue", country: "Iceland", population_with_eye_color: 310000, percentage: 87, region: "Europe", resembles_countries: ["Denmark", "Norway", "Sweden"] },
  { eye_color: "Blue", country: "Sweden", population_with_eye_color: 7800000, percentage: 78, region: "Europe", resembles_countries: ["Norway", "Denmark", "Finland"] },
  { eye_color: "Blue", country: "Norway", population_with_eye_color: 4200000, percentage: 75, region: "Europe", resembles_countries: ["Sweden", "Denmark", "Iceland"] },
  { eye_color: "Blue", country: "Germany", population_with_eye_color: 33000000, percentage: 40, region: "Europe", resembles_countries: ["Austria", "Netherlands", "Switzerland"] },
  { eye_color: "Blue", country: "United Kingdom", population_with_eye_color: 29000000, percentage: 48, region: "Europe", resembles_countries: ["Ireland", "Scotland", "Wales"] },
  { eye_color: "Blue", country: "Denmark", population_with_eye_color: 4400000, percentage: 72, region: "Europe", resembles_countries: ["Sweden", "Norway", "Netherlands"] },

  // Green
  { eye_color: "Green", country: "Ireland", population_with_eye_color: 2900000, percentage: 58, region: "Europe", resembles_countries: ["Scotland", "Wales", "United Kingdom"] },
  { eye_color: "Green", country: "Scotland", population_with_eye_color: 2500000, percentage: 45, region: "Europe", resembles_countries: ["Ireland", "Wales", "England"] },
  { eye_color: "Green", country: "Hungary", population_with_eye_color: 1900000, percentage: 20, region: "Europe", resembles_countries: ["Czech Republic", "Slovakia", "Austria"] },
  { eye_color: "Green", country: "Iceland", population_with_eye_color: 120000, percentage: 35, region: "Europe", resembles_countries: ["Norway", "Denmark", "Sweden"] },
  { eye_color: "Green", country: "Turkey", population_with_eye_color: 16000000, percentage: 20, region: "Europe", resembles_countries: ["Greece", "Bulgaria", "Iran"] },

  // Hazel
  { eye_color: "Hazel", country: "United States", population_with_eye_color: 55000000, percentage: 18, region: "North America", resembles_countries: ["Canada", "United Kingdom", "Australia"] },
  { eye_color: "Hazel", country: "Spain", population_with_eye_color: 11000000, percentage: 24, region: "Europe", resembles_countries: ["Portugal", "Italy", "France"] },
  { eye_color: "Hazel", country: "France", population_with_eye_color: 13000000, percentage: 20, region: "Europe", resembles_countries: ["Belgium", "Switzerland", "Italy"] },
  { eye_color: "Hazel", country: "Brazil", population_with_eye_color: 32000000, percentage: 15, region: "South America", resembles_countries: ["Argentina", "Uruguay", "Chile"] },
  { eye_color: "Hazel", country: "Italy", population_with_eye_color: 12000000, percentage: 20, region: "Europe", resembles_countries: ["Spain", "Greece", "Portugal"] },

  // Amber
  { eye_color: "Amber", country: "Ethiopia", population_with_eye_color: 8000000, percentage: 7, region: "Africa", resembles_countries: ["Somalia", "Eritrea", "Djibouti"] },
  { eye_color: "Amber", country: "Japan", population_with_eye_color: 3800000, percentage: 3, region: "Asia", resembles_countries: ["South Korea", "China", "Taiwan"] },
  { eye_color: "Amber", country: "Romania", population_with_eye_color: 2800000, percentage: 15, region: "Europe", resembles_countries: ["Moldova", "Bulgaria", "Hungary"] },
  { eye_color: "Amber", country: "Pakistan", population_with_eye_color: 11000000, percentage: 5, region: "Asia", resembles_countries: ["Afghanistan", "Iran", "India"] },

  // Gray
  { eye_color: "Gray", country: "Russia", population_with_eye_color: 14000000, percentage: 10, region: "Europe", resembles_countries: ["Ukraine", "Belarus", "Lithuania"] },
  { eye_color: "Gray", country: "Estonia", population_with_eye_color: 260000, percentage: 20, region: "Europe", resembles_countries: ["Latvia", "Lithuania", "Finland"] },
  { eye_color: "Gray", country: "Latvia", population_with_eye_color: 340000, percentage: 18, region: "Europe", resembles_countries: ["Lithuania", "Estonia", "Belarus"] },
  { eye_color: "Gray", country: "Czech Republic", population_with_eye_color: 1500000, percentage: 14, region: "Europe", resembles_countries: ["Slovakia", "Poland", "Austria"] },

  // Black
  { eye_color: "Black", country: "Japan", population_with_eye_color: 100000000, percentage: 80, region: "Asia", resembles_countries: ["South Korea", "China", "Taiwan"] },
  { eye_color: "Black", country: "South Korea", population_with_eye_color: 40000000, percentage: 78, region: "Asia", resembles_countries: ["Japan", "China", "North Korea"] },
  { eye_color: "Black", country: "Kenya", population_with_eye_color: 48000000, percentage: 90, region: "Africa", resembles_countries: ["Tanzania", "Uganda", "Rwanda"] },
  { eye_color: "Black", country: "Congo", population_with_eye_color: 80000000, percentage: 95, region: "Africa", resembles_countries: ["Angola", "Zambia", "Cameroon"] },
  { eye_color: "Black", country: "Vietnam", population_with_eye_color: 82000000, percentage: 85, region: "Asia", resembles_countries: ["Laos", "Cambodia", "Thailand"] },
];

export const eyeColors = ["Brown", "Blue", "Green", "Hazel", "Amber", "Gray", "Black"] as const;
export type EyeColor = typeof eyeColors[number];

export const regions = ["All", "Asia", "Europe", "Africa", "North America", "South America"] as const;
export type Region = typeof regions[number];

export const eyeColorMap: Record<string, string> = {
  Brown: "hsl(30, 60%, 40%)",
  Blue: "hsl(210, 80%, 55%)",
  Green: "hsl(140, 50%, 45%)",
  Hazel: "hsl(45, 55%, 45%)",
  Amber: "hsl(38, 90%, 50%)",
  Gray: "hsl(210, 10%, 55%)",
  Black: "hsl(0, 0%, 25%)",
};

export function getFilteredData(eyeColor: string, region: string): EyeColorEntry[] {
  return eyeColorData.filter(
    (d) => d.eye_color === eyeColor && (region === "All" || d.region === region)
  );
}

export function getStats(data: EyeColorEntry[]) {
  if (data.length === 0) return { avgPercentage: 0, totalPopulation: 0, countryCount: 0 };
  const totalPopulation = data.reduce((s, d) => s + d.population_with_eye_color, 0);
  const avgPercentage = data.reduce((s, d) => s + d.percentage, 0) / data.length;
  return { avgPercentage: Math.round(avgPercentage * 10) / 10, totalPopulation, countryCount: data.length };
}

export function predictCountry(data: EyeColorEntry[]): EyeColorEntry | null {
  if (data.length === 0) return null;
  // Weighted random by percentage
  const totalWeight = data.reduce((s, d) => s + d.percentage, 0);
  let r = Math.random() * totalWeight;
  for (const d of data) {
    r -= d.percentage;
    if (r <= 0) return d;
  }
  return data[data.length - 1];
}
