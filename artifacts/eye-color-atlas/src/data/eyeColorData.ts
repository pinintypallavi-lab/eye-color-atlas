export interface CountryData {
  name: string;
  percentage: number;
  flag: string;
  region?: string;
}

export type RiskLevel = "high" | "moderate" | "low" | "protective";

export interface DiseaseInfo {
  name: string;
  riskLevel: RiskLevel;
  description: string;
  riskPercent: number;
  recovery: string;
}

export interface EyeColorInfo {
  id: string;
  name: string;
  hex: string;
  mainCountry: string;
  mainCountryFlag: string;
  mainCountryRegion: string;
  mainCountryPercentage: number;
  globalPrevalence: string;
  description: string;
  countries: CountryData[];
  similarCountries: { country: string; flag: string; similarity: string }[];
  diseases: DiseaseInfo[];
  recommendations: string[];
  genetics: string;
  melaninLevel: string;
}

export const eyeColors: EyeColorInfo[] = [
  {
    id: "brown",
    name: "Brown",
    hex: "#7B4F32",
    mainCountry: "Nigeria",
    mainCountryFlag: "🇳🇬",
    mainCountryRegion: "West Africa",
    mainCountryPercentage: 99,
    globalPrevalence: "~79%",
    description:
      "Brown eyes are the most common eye color worldwide, dominated by high concentrations of melanin in the iris. They dominate in South Asia, East Asia, Middle East, Africa, and Latin America.",
    genetics:
      "Controlled primarily by OCA2 and HERC2 genes on chromosome 15. The brown allele is dominant over green and blue, meaning one copy of the brown variant is sufficient to produce brown eyes.",
    melaninLevel: "High",
    countries: [
      { name: "Nigeria", percentage: 99, flag: "🇳🇬", region: "West Africa" },
      { name: "India", percentage: 97, flag: "🇮🇳", region: "South Asia" },
      { name: "Bangladesh", percentage: 96, flag: "🇧🇩", region: "South Asia" },
      { name: "Pakistan", percentage: 95, flag: "🇵🇰", region: "South Asia" },
      { name: "Indonesia", percentage: 98, flag: "🇮🇩", region: "Southeast Asia" },
      { name: "China", percentage: 94, flag: "🇨🇳", region: "East Asia" },
      { name: "Brazil", percentage: 82, flag: "🇧🇷", region: "South America" },
      { name: "Mexico", percentage: 80, flag: "🇲🇽", region: "North America" },
      { name: "Saudi Arabia", percentage: 95, flag: "🇸🇦", region: "Middle East" },
      { name: "Egypt", percentage: 92, flag: "🇪🇬", region: "North Africa" },
    ],
    similarCountries: [
      { country: "Sri Lanka", flag: "🇱🇰", similarity: "96% brown eyes — very similar to India" },
      { country: "Nepal", flag: "🇳🇵", similarity: "95% brown eyes — South Asian pattern" },
      { country: "Ethiopia", flag: "🇪🇹", similarity: "98% dark eyes — high melanin population" },
    ],
    diseases: [
      {
        name: "Cataracts",
        riskLevel: "moderate",
        riskPercent: 62,
        description:
          "Brown eyes absorb more solar heat due to melanin, which can accelerate lens protein damage over time, increasing cataract risk compared to blue eyes.",
        recovery:
          "Cataract surgery is one of the safest procedures globally (>99% success rate). Recovery involves 4–6 weeks of eye drops, avoiding strain. UV sunglasses prevent recurrence.",
      },
      {
        name: "Glaucoma",
        riskLevel: "moderate",
        riskPercent: 55,
        description:
          "Studies show brown-eyed individuals may have a slightly elevated risk of primary open-angle glaucoma, potentially linked to melanin accumulation in the trabecular meshwork.",
        recovery:
          "Eye drops (prostaglandins, beta-blockers), laser therapy (SLT), or surgery. Annual intraocular pressure checks are essential for early detection.",
      },
      {
        name: "Age-Related Macular Degeneration (AMD)",
        riskLevel: "low",
        riskPercent: 25,
        description:
          "Brown eyes have a lower risk of AMD. High melanin in the retinal pigment epithelium (RPE) provides protective UV absorption, reducing oxidative stress on the macula.",
        recovery:
          "Managed with AREDS2 supplements for dry AMD. Wet AMD responds to anti-VEGF injections. Lifestyle changes (diet, no smoking) slow progression significantly.",
      },
      {
        name: "UV Protection",
        riskLevel: "protective",
        riskPercent: 80,
        description:
          "High melanin content in brown eyes provides significant natural UV protection, reducing the risk of UV-induced damage to the lens, retina, and surrounding tissues.",
        recovery: "Maintain protection with UV400 sunglasses in high-UV environments even with natural pigment.",
      },
    ],
    recommendations: [
      "Wear UV-400 rated sunglasses in high-sunlight environments",
      "Annual dilated eye exams after age 40",
      "Monitor blood glucose levels (diabetic retinopathy risk)",
      "Eat antioxidant-rich foods (leafy greens, carrots, berries)",
      "Avoid prolonged screen exposure without blue-light filters",
    ],
  },
  {
    id: "black",
    name: "Black",
    hex: "#1A0A00",
    mainCountry: "Ethiopia",
    mainCountryFlag: "🇪🇹",
    mainCountryRegion: "East Africa",
    mainCountryPercentage: 99,
    globalPrevalence: "~16%",
    description:
      "Very dark brown eyes that appear black are most common in sub-Saharan Africa and parts of East Asia. These eyes carry the highest concentration of eumelanin, providing maximum UV protection.",
    genetics:
      "Maximum OCA2 and TYRP1 expression produces the highest eumelanin levels. This is the ancestral human eye color, naturally selected in high-UV equatorial environments.",
    melaninLevel: "Maximum",
    countries: [
      { name: "Ethiopia", percentage: 99, flag: "🇪🇹", region: "East Africa" },
      { name: "Somalia", percentage: 99, flag: "🇸🇴", region: "East Africa" },
      { name: "Kenya", percentage: 98, flag: "🇰🇪", region: "East Africa" },
      { name: "Ghana", percentage: 99, flag: "🇬🇭", region: "West Africa" },
      { name: "Tanzania", percentage: 98, flag: "🇹🇿", region: "East Africa" },
      { name: "Congo", percentage: 99, flag: "🇨🇩", region: "Central Africa" },
      { name: "Japan", percentage: 85, flag: "🇯🇵", region: "East Asia" },
      { name: "Vietnam", percentage: 88, flag: "🇻🇳", region: "Southeast Asia" },
      { name: "Thailand", percentage: 90, flag: "🇹🇭", region: "Southeast Asia" },
      { name: "Myanmar", percentage: 92, flag: "🇲🇲", region: "Southeast Asia" },
    ],
    similarCountries: [
      { country: "Senegal", flag: "🇸🇳", similarity: "99% very dark eyes — West African pattern" },
      { country: "Cameroon", flag: "🇨🇲", similarity: "99% very dark eyes — Central African pattern" },
      { country: "South Korea", flag: "🇰🇷", similarity: "90%+ very dark eyes — East Asian pattern" },
    ],
    diseases: [
      {
        name: "Pigmentary Glaucoma",
        riskLevel: "moderate",
        riskPercent: 58,
        description:
          "High iris pigmentation can shed granules that block the trabecular meshwork, raising intraocular pressure. Common in dark-pigmented individuals with certain iris anatomy.",
        recovery:
          "Beta-blocker eye drops, selective laser trabeculoplasty (SLT), or surgery. Highly manageable with early detection through regular tonometry checks.",
      },
      {
        name: "Trachoma",
        riskLevel: "high",
        riskPercent: 72,
        description:
          "Bacterial infection (Chlamydia trachomatis) disproportionately affecting sub-Saharan African populations due to environmental factors. Leading infectious cause of blindness globally.",
        recovery:
          "SAFE strategy: Surgery for trichiasis, Antibiotics (azithromycin), Facial cleanliness, Environmental improvement. Fully curable if treated early. WHO elimination target: 2030.",
      },
      {
        name: "Pterygium",
        riskLevel: "moderate",
        riskPercent: 60,
        description:
          "Growth of fibrovascular tissue over the cornea. More common in high-UV equatorial regions where these eye color populations live. Dark eyes help but do not provide immunity.",
        recovery:
          "Surgical excision for vision-threatening cases. Eye drops for irritation. UV protection prevents recurrence (30–40% recurrence rate post-surgery).",
      },
      {
        name: "UV Protection (Melanin Shield)",
        riskLevel: "protective",
        riskPercent: 92,
        description:
          "Maximum melanin provides the strongest natural photoprotection of any eye color. Significantly reduces UV-induced retinal and lens damage.",
        recovery: "Maintain protection with quality UV400 sunglasses even in high-melanin populations.",
      },
    ],
    recommendations: [
      "Annual glaucoma screening with tonometry after age 35",
      "Facial hygiene practices in trachoma-endemic regions",
      "UV protection sunglasses in high-sunlight environments",
      "Access to preventive eye care services in rural areas",
    ],
  },
  {
    id: "blue",
    name: "Blue",
    hex: "#4A90D9",
    mainCountry: "Estonia",
    mainCountryFlag: "🇪🇪",
    mainCountryRegion: "Northern Europe",
    mainCountryPercentage: 89,
    globalPrevalence: "~8-10%",
    description:
      "Blue eyes result from low melanin in the iris, causing Rayleigh light scattering that produces a blue appearance. Most prevalent in Northern and Eastern Europe, with all blue-eyed people sharing a common ancestor.",
    genetics:
      "A single SNP (rs12913832) near the HERC2 gene reduces OCA2 expression. Scientists estimate this mutation arose 6,000–10,000 years ago near the Black Sea — making all blue-eyed people distant relatives.",
    melaninLevel: "Very Low",
    countries: [
      { name: "Estonia", percentage: 89, flag: "🇪🇪", region: "Northern Europe" },
      { name: "Finland", percentage: 85, flag: "🇫🇮", region: "Northern Europe" },
      { name: "Iceland", percentage: 80, flag: "🇮🇸", region: "Northern Europe" },
      { name: "Sweden", percentage: 78, flag: "🇸🇪", region: "Scandinavia" },
      { name: "Norway", percentage: 74, flag: "🇳🇴", region: "Scandinavia" },
      { name: "Denmark", percentage: 72, flag: "🇩🇰", region: "Scandinavia" },
      { name: "Netherlands", percentage: 68, flag: "🇳🇱", region: "Western Europe" },
      { name: "Ireland", percentage: 57, flag: "🇮🇪", region: "Western Europe" },
      { name: "Germany", percentage: 52, flag: "🇩🇪", region: "Central Europe" },
      { name: "UK", percentage: 48, flag: "🇬🇧", region: "Western Europe" },
    ],
    similarCountries: [
      { country: "Latvia", flag: "🇱🇻", similarity: "82% blue eyes — very similar to Estonia" },
      { country: "Lithuania", flag: "🇱🇹", similarity: "78% blue eyes — Baltic pattern" },
      { country: "Belarus", flag: "🇧🇾", similarity: "65% blue/grey eyes — Eastern European pattern" },
    ],
    diseases: [
      {
        name: "Age-related Macular Degeneration (AMD)",
        riskLevel: "high",
        riskPercent: 78,
        description:
          "Blue-eyed individuals face ~4× higher risk for AMD. Less melanin means reduced natural UV filtering for the macula, allowing greater oxidative damage over time.",
        recovery:
          "Anti-VEGF injections (ranibizumab, bevacizumab) for wet AMD. Dry AMD managed with AREDS2 supplements. Regular OCT scanning allows early intervention.",
      },
      {
        name: "Ocular Melanoma",
        riskLevel: "high",
        riskPercent: 71,
        description:
          "Blue-eyed individuals have a higher risk of uveal melanoma despite lower iris melanin — reduced pigment means less photoprotection for the uveal tract.",
        recovery:
          "Proton beam radiotherapy, plaque brachytherapy, or enucleation in severe cases. 5-year survival rate ~80% for localized disease. Annual dilated exams are critical.",
      },
      {
        name: "Photophobia",
        riskLevel: "moderate",
        riskPercent: 65,
        description:
          "Blue eyes transmit significantly more light through the iris due to minimal pigmentation, causing heightened sensitivity and discomfort in bright conditions.",
        recovery:
          "Polarized or tinted lenses, photochromic glasses. In severe cases, coloured contact lenses. Fully manageable with proper eyewear — not progressive.",
      },
      {
        name: "Skin & Eye Cancer (UV-related)",
        riskLevel: "high",
        riskPercent: 75,
        description:
          "Low melanin in blue-eyed populations correlates with higher UV sensitivity across the body, increasing risk of both skin cancers and UV-induced eye cancers.",
        recovery:
          "SPF 50+ sunscreen, UV-protective eyewear, annual dermatology checks. High treatable when caught early through regular screening.",
      },
    ],
    recommendations: [
      "Polarized UV400 sunglasses — essential, not optional",
      "AREDS2 supplements after age 50 for AMD prevention",
      "Annual OCT scans for early AMD and melanoma detection",
      "SPF 50+ sunscreen daily on skin around eyes",
      "Avoid tanning beds and prolonged direct sunlight",
    ],
  },
  {
    id: "green",
    name: "Green",
    hex: "#4A7C4E",
    mainCountry: "Ireland",
    mainCountryFlag: "🇮🇪",
    mainCountryRegion: "Western Europe",
    mainCountryPercentage: 46,
    globalPrevalence: "~2%",
    description:
      "Green is the rarest common eye color, occurring due to moderate melanin combined with Rayleigh light scattering. Most prevalent in Celtic and Slavic populations, and some Middle Eastern groups.",
    genetics:
      "Results from a combination of low-to-moderate melanin and the GCHI gene producing yellowish pheomelanin, combined with specific OCA2 variants. The interplay creates the characteristic green hue.",
    melaninLevel: "Low-Moderate",
    countries: [
      { name: "Ireland", percentage: 46, flag: "🇮🇪", region: "Western Europe" },
      { name: "Scotland", percentage: 35, flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", region: "UK" },
      { name: "Iceland", percentage: 32, flag: "🇮🇸", region: "Northern Europe" },
      { name: "Hungary", percentage: 29, flag: "🇭🇺", region: "Central Europe" },
      { name: "Netherlands", percentage: 22, flag: "🇳🇱", region: "Western Europe" },
      { name: "Denmark", percentage: 20, flag: "🇩🇰", region: "Scandinavia" },
      { name: "Germany", percentage: 16, flag: "🇩🇪", region: "Central Europe" },
      { name: "Brazil", percentage: 15, flag: "🇧🇷", region: "South America" },
      { name: "Norway", percentage: 14, flag: "🇳🇴", region: "Scandinavia" },
      { name: "Russia", percentage: 10, flag: "🇷🇺", region: "Eastern Europe" },
    ],
    similarCountries: [
      { country: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", similarity: "38% green/hazel — very similar to Ireland" },
      { country: "Poland", flag: "🇵🇱", similarity: "25% green eyes — Central European pattern" },
      { country: "Czech Republic", flag: "🇨🇿", similarity: "22% green — Central European pattern" },
    ],
    diseases: [
      {
        name: "Ocular Melanoma",
        riskLevel: "high",
        riskPercent: 68,
        description:
          "Green-eyed individuals share elevated uveal melanoma risk with blue-eyed individuals due to reduced iris pigmentation and weaker UV photoprotection.",
        recovery:
          "Radiation-based therapies first-line. Systemic immunotherapy (checkpoint inhibitors) for metastatic disease shows promising results. Annual screening recommended.",
      },
      {
        name: "Age-related Macular Degeneration",
        riskLevel: "moderate",
        riskPercent: 52,
        description:
          "Moderate risk — lower than blue eyes but higher than brown. Moderate melanin provides some but not complete UV protection to the macula.",
        recovery:
          "AREDS2 supplements, anti-VEGF injections, photodynamic therapy. Smoking cessation dramatically reduces progression risk.",
      },
      {
        name: "Allergic Conjunctivitis",
        riskLevel: "moderate",
        riskPercent: 48,
        description:
          "Green-eyed Northern European populations tend to have higher rates of environmental allergies, leading to recurrent allergic conjunctivitis and eye irritation.",
        recovery:
          "Antihistamine eye drops, mast cell stabilizers, cold compresses. Allergy immunotherapy for chronic cases. Usually fully resolvable with proper treatment.",
      },
    ],
    recommendations: [
      "Wear UV-protective sunglasses year-round",
      "Allergy testing if experiencing chronic eye irritation",
      "Annual comprehensive eye exams including dilated fundus check",
      "Omega-3 supplementation for eye membrane health",
      "Lubricating eye drops in dry or windy environments",
    ],
  },
  {
    id: "hazel",
    name: "Hazel",
    hex: "#8E6B3E",
    mainCountry: "Spain",
    mainCountryFlag: "🇪🇸",
    mainCountryRegion: "Southern Europe",
    mainCountryPercentage: 38,
    globalPrevalence: "~5%",
    description:
      "Hazel eyes display a stunning mix of brown, green, and amber tones that can shift in different lighting. Common in Southern Europe, the Middle East, and mixed-ancestry populations worldwide.",
    genetics:
      "Hazel results from moderate melanin in the anterior iris stroma. Multiple gene interactions (OCA2, HERC2, SLC45A2) contribute, creating the characteristic multi-tonal appearance.",
    melaninLevel: "Moderate",
    countries: [
      { name: "Spain", percentage: 38, flag: "🇪🇸", region: "Southern Europe" },
      { name: "Portugal", percentage: 35, flag: "🇵🇹", region: "Southern Europe" },
      { name: "Italy", percentage: 30, flag: "🇮🇹", region: "Southern Europe" },
      { name: "Lebanon", percentage: 22, flag: "🇱🇧", region: "Middle East" },
      { name: "Brazil", percentage: 25, flag: "🇧🇷", region: "South America" },
      { name: "France", percentage: 22, flag: "🇫🇷", region: "Western Europe" },
      { name: "Turkey", percentage: 20, flag: "🇹🇷", region: "Middle East/Europe" },
      { name: "USA", percentage: 18, flag: "🇺🇸", region: "North America" },
      { name: "Morocco", percentage: 16, flag: "🇲🇦", region: "North Africa" },
      { name: "Argentina", percentage: 20, flag: "🇦🇷", region: "South America" },
    ],
    similarCountries: [
      { country: "Greece", flag: "🇬🇷", similarity: "28% hazel/light brown — Mediterranean pattern" },
      { country: "Romania", flag: "🇷🇴", similarity: "24% hazel — Southern European pattern" },
      { country: "Chile", flag: "🇨🇱", similarity: "22% hazel — mixed European ancestry pattern" },
    ],
    diseases: [
      {
        name: "Iritis (Anterior Uveitis)",
        riskLevel: "moderate",
        riskPercent: 50,
        description:
          "Hazel-eyed individuals of European descent show moderate prevalence of autoimmune-related iritis, possibly linked to HLA-B27 gene variants common in Southern European populations.",
        recovery:
          "Steroid eye drops and pupil-dilating drops prevent adhesion. Most cases resolve in 6–8 weeks. Chronic cases may need immunosuppressants. Early treatment is critical.",
      },
      {
        name: "Pigment Dispersion Syndrome",
        riskLevel: "moderate",
        riskPercent: 45,
        description:
          "Moderate pigment levels can lead to pigment granule shedding in the eye, raising intraocular pressure and increasing glaucoma risk over time.",
        recovery:
          "Eye drops (prostaglandins, beta-blockers), laser therapy, or surgery. With early detection via regular pressure checks, vision preservation rate is excellent.",
      },
      {
        name: "AMD (Partial Protection)",
        riskLevel: "low",
        riskPercent: 35,
        description:
          "Moderate melanin in hazel eyes provides intermediate protection against AMD — better than blue eyes, not as strong as brown eyes.",
        recovery:
          "AREDS2 supplements, healthy diet, no smoking. Regular retinal check-ups after age 50 are sufficient for monitoring.",
      },
    ],
    recommendations: [
      "Regular intraocular pressure checks every 2 years",
      "UV protection outdoors at all times",
      "Watch for any sudden eye redness or pain (sign of iritis)",
      "Maintain healthy blood pressure for optic nerve protection",
    ],
  },
  {
    id: "amber",
    name: "Amber",
    hex: "#C8940A",
    mainCountry: "South Korea",
    mainCountryFlag: "🇰🇷",
    mainCountryRegion: "East Asia",
    mainCountryPercentage: 18,
    globalPrevalence: "~1%",
    description:
      "Amber eyes are a rare solid golden-yellow or copper tone caused by pheomelanin pigment in the iris. They appear almost luminous and are most common in East Asia and parts of South America.",
    genetics:
      "Caused by pheomelanin (yellowish melanin) rather than eumelanin (brown/black). Linked to SLC45A2 and TYRP1 gene variants that shift the melanin type without changing overall quantity.",
    melaninLevel: "Moderate (Pheomelanin)",
    countries: [
      { name: "South Korea", percentage: 18, flag: "🇰🇷", region: "East Asia" },
      { name: "Japan", percentage: 15, flag: "🇯🇵", region: "East Asia" },
      { name: "Peru", percentage: 16, flag: "🇵🇪", region: "South America" },
      { name: "Bolivia", percentage: 15, flag: "🇧🇴", region: "South America" },
      { name: "Colombia", percentage: 14, flag: "🇨🇴", region: "South America" },
      { name: "China", percentage: 12, flag: "🇨🇳", region: "East Asia" },
      { name: "Iran", percentage: 10, flag: "🇮🇷", region: "Middle East" },
      { name: "Algeria", percentage: 8, flag: "🇩🇿", region: "North Africa" },
      { name: "Ethiopia", percentage: 7, flag: "🇪🇹", region: "East Africa" },
      { name: "Brazil", percentage: 8, flag: "🇧🇷", region: "South America" },
    ],
    similarCountries: [
      { country: "Vietnam", flag: "🇻🇳", similarity: "12% amber tones — Southeast Asian pattern" },
      { country: "Ecuador", flag: "🇪🇨", similarity: "14% amber eyes — Andean pattern" },
      { country: "Myanmar", flag: "🇲🇲", similarity: "10% amber tones — Southeast Asian pattern" },
    ],
    diseases: [
      {
        name: "Wilson's Disease Eye Signs",
        riskLevel: "moderate",
        riskPercent: 40,
        description:
          "In Wilson's disease (copper metabolism disorder), copper deposits in the iris create golden-amber ring patterns (Kayser-Fleischer rings) that mimic amber eye color. Amber-eyed individuals should be monitored.",
        recovery:
          "Chelation therapy (D-penicillamine, trientine) removes copper deposits. Zinc supplementation prevents re-absorption. Liver transplant for severe cases.",
      },
      {
        name: "UV-induced Iris Pigment Degradation",
        riskLevel: "moderate",
        riskPercent: 42,
        description:
          "Pheomelanin in amber eyes is more susceptible to UV degradation than eumelanin, potentially leading to color changes and increased free radical activity in the iris.",
        recovery:
          "UV protection is primary prevention. Antioxidant-rich diet (Vitamin C, E, zinc) supports iris pigment stability. No curative treatment needed if caught early.",
      },
      {
        name: "Photosensitivity",
        riskLevel: "low",
        riskPercent: 38,
        description:
          "Pheomelanin absorbs light differently than eumelanin and may cause mild photosensitivity in very bright conditions, though less severe than blue or green eyes.",
        recovery:
          "Amber or yellow-tinted lenses are particularly effective. Photochromic lenses work well for outdoor use.",
      },
    ],
    recommendations: [
      "High-quality UV-400 sunglasses — essential",
      "Liver function monitoring if amber eyes develop ring patterns",
      "Antioxidant-rich diet for pigment protection",
      "Avoid excessive alcohol (stresses copper metabolism)",
    ],
  },
  {
    id: "grey",
    name: "Gray",
    hex: "#7E9BA8",
    mainCountry: "Russia",
    mainCountryFlag: "🇷🇺",
    mainCountryRegion: "Eastern Europe",
    mainCountryPercentage: 42,
    globalPrevalence: "~3%",
    description:
      "Grey eyes contain minimal melanin but have a high concentration of collagen in the stroma, which scatters light differently than blue eyes. Most common in Eastern Europe and parts of the Middle East.",
    genetics:
      "Grey eyes may be a variation of blue caused by greater collagen fiber density in the iris stroma, or thin melanin distribution. EYCL3 and OCA2 gene variants contribute.",
    melaninLevel: "Very Low (High Collagen)",
    countries: [
      { name: "Russia", percentage: 42, flag: "🇷🇺", region: "Eastern Europe" },
      { name: "Belarus", percentage: 38, flag: "🇧🇾", region: "Eastern Europe" },
      { name: "Ukraine", percentage: 35, flag: "🇺🇦", region: "Eastern Europe" },
      { name: "Finland", percentage: 28, flag: "🇫🇮", region: "Northern Europe" },
      { name: "Poland", percentage: 22, flag: "🇵🇱", region: "Central Europe" },
      { name: "Iran", percentage: 18, flag: "🇮🇷", region: "Middle East" },
      { name: "Lithuania", percentage: 20, flag: "🇱🇹", region: "Northern Europe" },
      { name: "Afghanistan", percentage: 15, flag: "🇦🇫", region: "Central Asia" },
      { name: "Georgia", percentage: 14, flag: "🇬🇪", region: "Caucasus" },
      { name: "Turkey", percentage: 12, flag: "🇹🇷", region: "Middle East/Europe" },
    ],
    similarCountries: [
      { country: "Kazakhstan", flag: "🇰🇿", similarity: "15% grey eyes — Central Asian pattern" },
      { country: "Armenia", flag: "🇦🇲", similarity: "10% grey eyes — Caucasus pattern" },
      { country: "Tajikistan", flag: "🇹🇯", similarity: "12% grey eyes — Central Asian pattern" },
    ],
    diseases: [
      {
        name: "Fuchs Endothelial Corneal Dystrophy",
        riskLevel: "high",
        riskPercent: 70,
        description:
          "More prevalent in lighter-eyed populations of Northern and Eastern European descent. Progressive loss of corneal endothelial cells leads to corneal clouding and vision loss.",
        recovery:
          "DMEK (Descemet Membrane Endothelial Keratoplasty) is the gold-standard treatment. Recovery takes 3–6 months. Success rate >90%. Corneal transplant in severe cases.",
      },
      {
        name: "Photophobia",
        riskLevel: "moderate",
        riskPercent: 60,
        description:
          "Like blue eyes, grey eyes transmit more light through the iris due to minimal pigmentation, causing discomfort in bright conditions, especially outdoors.",
        recovery:
          "Photochromic lenses, wraparound sunglasses, indoor lighting modification. Not progressive — fully manageable with appropriate eyewear.",
      },
      {
        name: "AMD Risk",
        riskLevel: "moderate",
        riskPercent: 55,
        description:
          "Similar to blue eyes in AMD risk profile due to low melanin. Grey-eyed individuals have moderate-to-elevated AMD risk compared to brown-eyed populations.",
        recovery:
          "AREDS2 supplements, anti-VEGF injections for wet AMD. Regular retinal monitoring critical after age 50.",
      },
    ],
    recommendations: [
      "Polarized sunglasses for light sensitivity management",
      "Monitor for any corneal clouding (Fuchs dystrophy early warning)",
      "Regular corneal thickness measurements after age 40",
      "Avoid contact lens overuse to protect corneal endothelium",
    ],
  },
  {
    id: "violet",
    name: "Violet / Purple",
    hex: "#7B2D8B",
    mainCountry: "Worldwide (Albinism)",
    mainCountryFlag: "🌐",
    mainCountryRegion: "Global — extremely rare",
    mainCountryPercentage: 0.001,
    globalPrevalence: "<0.01%",
    description:
      "True violet eyes are extraordinarily rare, occurring almost exclusively in individuals with albinism. Without melanin, blood vessels in the iris create a reddish-violet hue visible through the iris.",
    genetics:
      "Associated with Type 1 Oculocutaneous Albinism (OCA1), caused by complete absence of tyrosinase enzyme activity due to TYR gene mutations, resulting in zero melanin production.",
    melaninLevel: "None (Albinism)",
    countries: [
      { name: "Tanzania", percentage: 0.003, flag: "🇹🇿", region: "East Africa" },
      { name: "Zimbabwe", percentage: 0.003, flag: "🇿🇼", region: "Southern Africa" },
      { name: "Nigeria", percentage: 0.002, flag: "🇳🇬", region: "West Africa" },
      { name: "Norway", percentage: 0.001, flag: "🇳🇴", region: "Northern Europe" },
      { name: "Worldwide", percentage: 0.001, flag: "🌐", region: "Global" },
    ],
    similarCountries: [
      { country: "Any country with OCA1 albinism", flag: "🌐", similarity: "Equally rare at ~1/17,000 births" },
    ],
    diseases: [
      {
        name: "Severe Photophobia",
        riskLevel: "high",
        riskPercent: 95,
        description:
          "Without any melanin, the eye transmits nearly all incoming light, causing extreme sensitivity and significant pain even in normal indoor lighting conditions.",
        recovery:
          "Tinted or prosthetic contact lenses are the most effective intervention. Wraparound sunglasses required outdoors. Indoor lighting dimming. No cure — lifelong management.",
      },
      {
        name: "Nystagmus",
        riskLevel: "high",
        riskPercent: 90,
        description:
          "Involuntary rapid eye movements (nystagmus) are almost universal in albinism, caused by abnormal foveal development due to absent melanin during retinal development.",
        recovery:
          "Prism glasses, tinted contact lenses, or surgery on extraocular muscles to reduce the null point. Vision aids and low-vision rehabilitation are essential components of care.",
      },
      {
        name: "Skin Cancer",
        riskLevel: "high",
        riskPercent: 88,
        description:
          "Albinism dramatically increases skin cancer risk (up to 1000× in high-UV equatorial regions, particularly in sub-Saharan Africa where albinism rates are higher).",
        recovery:
          "SPF 50+ sunscreen daily on all exposed skin, protective clothing, regular dermatology checks. Skin cancer is highly treatable when caught early through screening.",
      },
    ],
    recommendations: [
      "Tinted or prosthetic contact lenses for light management",
      "SPF 50+ sunscreen — entire body, every single day",
      "Comprehensive low-vision rehabilitation services",
      "Regular dermatology checks for skin cancer screening",
      "Genetic counseling for family planning decisions",
    ],
  },
];

export const inheritanceData: Record<string, { [key: string]: number } & { successRate: number; note: string }> = {
  // ── Amber combinations ──────────────────────────────────────────────────
  "amber-amber":  { amber: 60, hazel: 20, brown: 10, green: 5, blue: 3, grey: 2, successRate: 82, note: "Amber × Amber: Amber is likely dominant in this pairing but moderate-melanin genes allow hazel and brown to emerge. Blue and grey are uncommon but not impossible." },
  "amber-black":  { black: 55, brown: 25, amber: 15, hazel: 5, successRate: 78, note: "Amber × Black: Black's high melanin dominance pushes most outcomes toward very dark eyes. Amber has a minority chance of expression through moderate-melanin pathways." },
  "amber-blue":   { amber: 38, hazel: 27, brown: 15, blue: 12, green: 5, grey: 3, successRate: 70, note: "Amber × Blue: One of the more unpredictable pairings. Amber's moderate melanin competes with blue's recessive genes, making hazel and amber most likely but blue still a real outcome." },
  "amber-brown":  { brown: 45, amber: 30, hazel: 20, green: 5, successRate: 75, note: "Amber × Brown: Brown's dominance is clear but amber has a strong 30% foothold. Hazel fills the middle ground. A warm-toned outcome is very likely for the child." },
  "amber-green":  { amber: 35, hazel: 30, green: 20, brown: 10, blue: 5, successRate: 68, note: "Amber × Green: Both are mid-melanin colours making this one of the more evenly spread results. Hazel and amber are most probable; green and brown are real alternatives." },
  "amber-grey":   { amber: 38, hazel: 25, grey: 20, brown: 10, blue: 7, successRate: 65, note: "Amber × Grey: An unusual pairing. Amber's warm melanin competes with grey's structural low-melanin pattern. Hazel is a common middle ground." },
  "amber-hazel":  { hazel: 40, amber: 35, brown: 15, green: 7, blue: 3, successRate: 75, note: "Amber × Hazel: These two closely related colours make hazel and amber the overwhelming favourites. Brown appears occasionally through shared dominant alleles." },
  "amber-violet": { amber: 35, hazel: 25, blue: 20, grey: 12, violet: 5, green: 3, successRate: 60, note: "Amber × Violet: Violet is genetically near-blue, so amber's moderate melanin competes with blue's recessive nature. A wide spread of outcomes is possible." },

  // ── Black combinations ──────────────────────────────────────────────────
  "black-black":  { black: 90, brown: 8, hazel: 2, successRate: 98, note: "Black × Black: Near-certainty of very dark eyes. The very high melanin alleles are overwhelmingly dominant. Lighter outcomes require rare recessive modifiers." },
  "black-blue":   { black: 50, brown: 25, blue: 15, hazel: 7, grey: 3, successRate: 78, note: "Black × Blue: Black's dominant high-melanin suppresses most of blue's recessive contribution, but blue still has a meaningful 15% expression chance." },
  "black-brown":  { black: 55, brown: 38, hazel: 5, green: 2, successRate: 88, note: "Black × Brown: Both parents carry strong melanin dominance. Very dark to medium-brown eyes are almost certain. Lighter outcomes are very rare." },
  "black-green":  { black: 50, brown: 30, green: 12, hazel: 8, successRate: 75, note: "Black × Green: Black's dominance leads most outcomes. Green can still emerge at around 12% through moderate-melanin recessive pathways." },
  "black-grey":   { black: 50, brown: 28, grey: 15, blue: 7, successRate: 72, note: "Black × Grey: Black's melanin dominance prevails but grey — being genetically akin to blue — can appear in about 1 in 7 children." },
  "black-hazel":  { black: 50, brown: 28, hazel: 17, amber: 5, successRate: 76, note: "Black × Hazel: Strong dark dominance with hazel as the most likely lighter alternative. Amber is a small but real possibility via shared moderate-melanin genes." },
  "black-violet": { black: 50, brown: 28, blue: 12, grey: 8, violet: 2, successRate: 70, note: "Black × Violet: Violet is structurally blue, so outcomes follow a black × blue pattern with a rare chance of true violet in around 1 in 50 children." },

  // ── Blue combinations ───────────────────────────────────────────────────
  "blue-blue":    { blue: 99, green: 1, successRate: 99, note: "Blue × Blue: Nearly 100% blue. A very rare green variant is theoretically possible via modifier genes, but extremely unlikely in practice." },
  "blue-brown":   { brown: 50, blue: 50, successRate: 92, note: "Blue × Brown: Equal 50/50 chance. The brown allele is dominant but the blue allele persists in the genome and has a strong chance of expression." },
  "blue-green":   { blue: 50, green: 50, successRate: 85, note: "Blue × Green: Equal probability of blue or green. Neither is strongly dominant over the other in this pairing. Brown is extremely unlikely." },
  "blue-grey":    { grey: 50, blue: 45, green: 5, successRate: 88, note: "Blue × Grey: These two colours are genetically very similar — both low-melanin with structural light-scattering effects. Grey and blue are almost equally probable." },
  "blue-hazel":   { blue: 50, hazel: 25, green: 25, successRate: 78, note: "Blue × Hazel: Blue is most likely but hazel and green are both real possibilities. This is one of the more complex pairings genetically." },
  "blue-violet":  { blue: 55, violet: 25, grey: 15, green: 5, successRate: 72, note: "Blue × Violet: Violet is a rare structural variant of blue. Most children will have blue or grey eyes; true violet has about a 1-in-4 chance." },

  // ── Brown combinations ──────────────────────────────────────────────────
  "brown-brown":  { brown: 75, green: 18.75, blue: 6.25, successRate: 99, note: "Brown × Brown: Highly predictable. Most children will have brown eyes. The recessiveness of blue and green can still occasionally appear if both parents carry recessive alleles." },
  "brown-green":  { brown: 50, green: 37.5, blue: 12.5, successRate: 88, note: "Brown × Green: Mostly brown or green. Green adds genetic complexity making precise prediction harder than simpler combinations." },
  "brown-grey":   { brown: 50, grey: 25, blue: 15, hazel: 10, successRate: 78, note: "Brown × Grey: Brown dominates strongly. Grey — genetically close to blue — appears in about 1 in 4 children. Hazel fills the intermediate range." },
  "brown-hazel":  { brown: 50, hazel: 37.5, green: 12.5, successRate: 82, note: "Brown × Hazel: Majority brown with hazel possible. Hazel genes introduce moderate dominance complicating the prediction slightly." },
  "brown-violet": { brown: 50, blue: 25, grey: 15, hazel: 5, violet: 3, green: 2, successRate: 75, note: "Brown × Violet: Brown's dominance leads most outcomes. Violet is genetically near-blue, giving blue and grey a combined ~40% chance. True violet is very rare." },

  // ── Green combinations ──────────────────────────────────────────────────
  "green-green":  { green: 75, blue: 25, successRate: 90, note: "Green × Green: Green is dominant in this pairing. Some blue possibility remains. Brown is extremely unlikely from two green-eyed parents." },
  "green-grey":   { green: 40, grey: 35, blue: 20, hazel: 5, successRate: 75, note: "Green × Grey: Both are low-to-moderate melanin colours. Green leads slightly, grey is a strong second, and blue fills the remainder. A cool-toned outcome is most probable." },
  "green-hazel":  { green: 50, hazel: 25, brown: 12.5, blue: 12.5, successRate: 72, note: "Green × Hazel: The most genetically complex common combination. Multiple outcomes are genuinely possible with moderate prediction confidence." },
  "green-violet": { green: 40, blue: 30, grey: 15, violet: 10, hazel: 5, successRate: 68, note: "Green × Violet: Violet's near-blue genetics blend with green's moderate melanin for a cool-spectrum range of outcomes. True violet has about a 1-in-10 chance." },

  // ── Grey combinations ───────────────────────────────────────────────────
  "grey-grey":    { grey: 70, blue: 25, green: 5, successRate: 90, note: "Grey × Grey: Very high probability of grey eyes. Blue is a common second outcome due to the genetic closeness of grey and blue. Green appears very rarely." },
  "grey-hazel":   { grey: 35, hazel: 30, green: 20, blue: 12, brown: 3, successRate: 70, note: "Grey × Hazel: A genetically interesting pairing — grey's low melanin meets hazel's moderate melanin giving a wide spread. No single colour dominates strongly." },
  "grey-violet":  { grey: 45, blue: 30, violet: 18, green: 7, successRate: 72, note: "Grey × Violet: Both colours sit in the low-melanin spectrum. Grey and blue are the most probable outcomes; true violet appears in roughly 1 in 6 children." },

  // ── Hazel combinations ──────────────────────────────────────────────────
  "hazel-hazel":  { hazel: 50, brown: 25, green: 25, successRate: 80, note: "Hazel × Hazel: Hazel most likely. Both brown and green are real possibilities. A good range of outcomes makes this combination visually interesting." },
  "hazel-violet": { hazel: 40, blue: 25, grey: 20, green: 10, violet: 5, successRate: 65, note: "Hazel × Violet: Hazel's moderate melanin meets violet's near-blue genetics, producing a broad spread. Blue and grey together account for nearly half of outcomes." },

  // ── Violet combinations ─────────────────────────────────────────────────
  "violet-violet": { violet: 50, blue: 30, grey: 15, green: 5, successRate: 75, note: "Violet × Violet: With both parents carrying this ultra-rare genetic trait, violet eyes have a 50% chance of appearing — far higher than any other pairing. Blue and grey fill the remainder." },
};

export const countryEyeColorData: Record<string, Record<string, number>> = {
  "India": { brown: 97, blue: 0.5, green: 0.5, hazel: 1, grey: 0.5, amber: 0.5 },
  "Estonia": { blue: 89, brown: 5, green: 3, hazel: 2, grey: 1 },
  "Finland": { blue: 85, brown: 5, green: 5, hazel: 3, grey: 2 },
  "Sweden": { blue: 78, brown: 8, green: 8, hazel: 4, grey: 2 },
  "Germany": { blue: 52, brown: 22, green: 16, hazel: 6, grey: 4 },
  "Ireland": { green: 46, blue: 42, brown: 10, hazel: 1, grey: 1 },
  "UK": { blue: 48, brown: 22, green: 18, hazel: 8, grey: 4 },
  "France": { brown: 45, blue: 25, green: 15, hazel: 12, grey: 3 },
  "Spain": { hazel: 38, brown: 35, blue: 18, green: 8, grey: 1 },
  "Italy": { brown: 45, hazel: 28, blue: 12, green: 12, grey: 2, amber: 1 },
  "Russia": { grey: 42, blue: 30, brown: 20, green: 5, hazel: 3 },
  "China": { brown: 94, amber: 4, hazel: 1, grey: 0.5, green: 0.5 },
  "Japan": { brown: 85, amber: 15 },
  "Nigeria": { brown: 98, black: 1, hazel: 0.5, other: 0.5 },
  "Ethiopia": { black: 99, brown: 0.5, other: 0.5 },
  "Brazil": { brown: 82, blue: 5, green: 5, hazel: 5, grey: 1, amber: 2 },
  "USA": { brown: 45, blue: 28, hazel: 18, green: 9 },
  "Mexico": { brown: 80, blue: 5, hazel: 8, green: 5, grey: 1, amber: 1 },
  "Turkey": { brown: 55, blue: 15, green: 12, hazel: 10, grey: 8 },
  "South Korea": { brown: 75, amber: 25 },
  "Pakistan": { brown: 95, blue: 2, green: 1, hazel: 1, grey: 1 },
  "Australia": { blue: 40, brown: 30, green: 15, hazel: 10, grey: 5 },
  "Canada": { blue: 35, brown: 32, hazel: 17, green: 12, grey: 4 },
  "Argentina": { brown: 42, blue: 25, hazel: 18, green: 12, grey: 2, amber: 1 },
  "Egypt": { brown: 92, blue: 3, green: 2, hazel: 2, grey: 1 },
  "Saudi Arabia": { brown: 95, blue: 1, green: 1, hazel: 2, grey: 1 },
  "Iran": { brown: 65, grey: 13, green: 10, hazel: 7, blue: 5 },
  "Afghanistan": { brown: 70, grey: 10, blue: 10, hazel: 5, green: 5 },
  "Poland": { blue: 40, grey: 15, brown: 25, green: 12, hazel: 8 },
  "Ukraine": { grey: 32, blue: 35, brown: 18, green: 10, hazel: 5 },
  "Greece": { brown: 45, hazel: 25, blue: 15, green: 10, grey: 4, amber: 1 },
  "Portugal": { brown: 40, hazel: 32, blue: 15, green: 10, grey: 2, amber: 1 },
  "Netherlands": { blue: 68, green: 18, brown: 5, hazel: 5, grey: 4 },
  "Norway": { blue: 74, green: 10, brown: 5, hazel: 7, grey: 4 },
  "Denmark": { blue: 72, green: 15, brown: 5, hazel: 4, grey: 4 },
  "Iceland": { blue: 56, green: 28, brown: 5, hazel: 8, grey: 3 },
  "Switzerland": { blue: 35, brown: 28, green: 18, hazel: 15, grey: 4 },
  "Indonesia": { brown: 98, amber: 1, hazel: 0.5, grey: 0.5 },
  "Thailand": { brown: 80, amber: 19, hazel: 0.5, grey: 0.5 },
  "Vietnam": { brown: 78, amber: 21, hazel: 0.5, grey: 0.5 },
  "Philippines": { brown: 97, amber: 1, hazel: 1, grey: 0.5, other: 0.5 },
  "Lebanon": { brown: 50, hazel: 20, blue: 15, green: 12, grey: 3 },
  "Morocco": { brown: 72, hazel: 12, blue: 8, green: 5, grey: 3 },
  "Algeria": { brown: 80, hazel: 8, blue: 5, green: 5, grey: 2 },
  "Kenya": { black: 94, brown: 5, hazel: 0.5, other: 0.5 },
  "Somalia": { black: 98, brown: 1, other: 1 },
};
