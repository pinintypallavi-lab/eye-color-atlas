import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Globe, AlertTriangle, Heart, ChevronRight } from "lucide-react";
import { eyeColors } from "@/data/eyeColorData";

export default function EyeDetailPage() {
  const [, params] = useRoute("/eye/:id");
  const color = eyeColors.find((c) => c.id === params?.id);

  if (!color) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Eye color not found.</p>
          <Link href="/" className="text-blue-400 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const totalPop = color.countries.reduce((a, c) => a + c.percentage, 0);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at top, ${color.hex} 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Atlas
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-8"
          >
            {/* Eye SVG */}
            <div
              className="w-48 h-32 rounded-3xl flex items-center justify-center flex-shrink-0 border border-white/10"
              style={{
                background: `radial-gradient(ellipse at center, ${color.hex}44 0%, #111827 100%)`,
              }}
            >
              <LargeEyeIcon color={color.hex} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-black">{color.name}</h1>
                <span
                  className="w-8 h-8 rounded-full border-2 border-white/20 flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
              </div>
              <div className="flex flex-wrap gap-4 mb-4">
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  Global prevalence: <strong>{color.globalPrevalence}</strong>
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  Melanin: <strong>{color.melaninLevel}</strong>
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  {color.mainCountryFlag} Main country: <strong>{color.mainCountry}</strong>
                </span>
              </div>
              <p className="text-slate-300 text-base leading-relaxed max-w-2xl">{color.description}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20 space-y-12">
        {/* Primary Country Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border p-6"
          style={{
            background: `linear-gradient(135deg, ${color.hex}22, #111827)`,
            borderColor: `${color.hex}44`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold">Primary Country</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{color.mainCountryFlag}</span>
            <div>
              <p className="text-2xl font-bold">{color.mainCountry}</p>
              <p className="text-slate-300">
                <strong style={{ color: color.hex }}>{color.mainCountryPercentage}%</strong> of the population has {color.name.toLowerCase()} eyes
              </p>
              <p className="text-slate-400 text-sm mt-1">This is the highest concentration of {color.name.toLowerCase()} eyes globally.</p>
            </div>
          </div>
        </motion.div>

        {/* Countries Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-400" />
            Countries with {color.name} Eyes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {color.countries.map((country, i) => (
              <motion.div
                key={country.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{country.flag}</span>
                    <span className="font-semibold">{country.name}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: color.hex }}>
                    {country.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color.hex }}
                    initial={{ width: 0 }}
                    animate={{ width: `${country.percentage}%` }}
                    transition={{ delay: i * 0.05 + 0.3, duration: 0.8 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Similar Countries */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ChevronRight className="w-6 h-6 text-teal-400" />
            Resemblance to Other Countries
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {color.similarCountries.map((sc, i) => (
              <div key={i} className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4">
                <div className="text-3xl mb-2">{sc.flag}</div>
                <p className="font-bold">{sc.country}</p>
                <p className="text-sm text-teal-300">{sc.similarity}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Genetics */}
        <section className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
            <span className="text-purple-400">🧬</span> Genetics
          </h2>
          <p className="text-slate-300 leading-relaxed">{color.genetics}</p>
        </section>

        {/* Diseases */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Associated Health Risks
          </h2>
          <div className="space-y-5">
            {color.diseases.map((disease, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-red-300 mb-3">{disease.name}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">About this condition</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{disease.description}</p>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Recovery & Treatment
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed">{disease.recovery}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-green-400" />
            Recommendations
          </h2>
          <ul className="space-y-3">
            {color.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-300">
                <span className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold text-xs flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function LargeEyeIcon({ color }: { color: string }) {
  return (
    <svg width="140" height="80" viewBox="0 0 140 80" fill="none">
      <path
        d="M5 40 C25 10, 115 10, 135 40 C115 70, 25 70, 5 40 Z"
        fill="white"
        opacity="0.95"
      />
      <circle cx="70" cy="40" r="22" fill={color} />
      <circle cx="70" cy="40" r="14" fill="#111827" opacity="0.9" />
      <circle cx="60" cy="32" r="5" fill="white" opacity="0.75" />
      <circle cx="80" cy="46" r="2" fill="white" opacity="0.4" />
    </svg>
  );
}
