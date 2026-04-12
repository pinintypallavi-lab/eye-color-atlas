import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Eye, RefreshCw, Info, ArrowLeft, Loader2, Copy, Check, ScanEye } from "lucide-react";
import { eyeColors } from "@/data/eyeColorData";
import { Link } from "wouter";
import EyeIllustration from "@/components/EyeIllustration";

interface DetectedColor {
  id: string;
  name: string;
  exactName: string;
  hex: string;
  categoryHex: string;
}

/**
 * Find the pupil center using RING-CONTRAST scoring.
 * A real pupil is a dark disk surrounded by a lighter iris ring.
 * Eyebrows, shadows, and eyelashes are dark but have NO lighter ring —
 * so they score low and are ignored.
 */
function findPupilCenter(
  pixels: Uint8ClampedArray,
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  const shortSide = Math.min(canvasW, canvasH);
  const step = Math.max(3, Math.round(shortSide / 35));
  // Pupil radius: ~5% of image short side
  const pupilR = Math.round(shortSide * 0.05);
  // Iris search radius: ~18% (covers iris ring well past the pupil)
  const irisR  = Math.round(shortSide * 0.18);

  let bestScore = -Infinity;
  let bestX = Math.floor(canvasW / 2);
  let bestY = Math.floor(canvasH / 2);

  for (let cy = irisR; cy < canvasH - irisR; cy += step) {
    for (let cx = irisR; cx < canvasW - irisR; cx += step) {
      let centerTotal = 0, centerCount = 0;
      let ringTotal   = 0, ringCount   = 0;

      for (let dy = -irisR; dy <= irisR; dy += step) {
        for (let dx = -irisR; dx <= irisR; dx += step) {
          const px = cx + dx;
          const py = cy + dy;
          if (px < 0 || px >= canvasW || py < 0 || py >= canvasH) continue;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const idx  = (py * canvasW + px) * 4;
          const b    = (pixels[idx]! + pixels[idx + 1]! + pixels[idx + 2]!) / 3;

          if (dist <= pupilR) {
            centerTotal += b; centerCount++;
          } else if (dist <= irisR) {
            ringTotal += b; ringCount++;
          }
        }
      }

      if (centerCount === 0 || ringCount === 0) continue;
      const centerAvg = centerTotal / centerCount;
      const ringAvg   = ringTotal   / ringCount;

      // Require center to be dark (pupil is always dark, < 110)
      if (centerAvg > 110) continue;

      // Score = brightness contrast: lighter ring vs darker center
      // Eyebrows/shadows don't have this pattern so score very low
      const score = ringAvg - centerAvg;
      if (score > bestScore) {
        bestScore = score;
        bestX = cx;
        bestY = cy;
      }
    }
  }

  return { x: bestX, y: bestY };
}

/**
 * Estimate the radius where the iris ends and the sclera (white) begins,
 * by scanning outward from the pupil center and detecting a sharp brightness jump.
 * Returns adaptive iris outer radius.
 */
function estimateIrisRadius(
  pixels: Uint8ClampedArray,
  cx: number,
  cy: number,
  canvasW: number,
  canvasH: number,
): number {
  const shortSide = Math.min(canvasW, canvasH);
  const maxR = Math.round(shortSide * 0.35);
  const numAngles = 24;
  const radii: number[] = [];

  for (let i = 0; i < numAngles; i++) {
    const angle = (i / numAngles) * 2 * Math.PI;
    const cosA  = Math.cos(angle);
    const sinA  = Math.sin(angle);
    let prevB   = -1;

    for (let r = 4; r < maxR; r += 2) {
      const px = Math.round(cx + r * cosA);
      const py = Math.round(cy + r * sinA);
      if (px < 0 || px >= canvasW || py < 0 || py >= canvasH) break;
      const idx = (py * canvasW + px) * 4;
      const b   = (pixels[idx]! + pixels[idx + 1]! + pixels[idx + 2]!) / 3;

      // A sharp jump of > 55 brightness units = iris→sclera boundary
      if (prevB >= 0 && b - prevB > 55) {
        radii.push(r);
        break;
      }
      prevB = b;
    }
  }

  if (radii.length < 6) return Math.round(shortSide * 0.17); // fallback

  radii.sort((a, b) => a - b);
  // Use the 60th percentile (upper-mid) — avoids eyelid cutoffs on top/bottom
  return radii[Math.floor(radii.length * 0.6)]!;
}

/**
 * Sample pixels in a donut ring around the detected iris center.
 * Uses adaptive radii from estimateIrisRadius so it stays inside the iris
 * regardless of image zoom level.
 * Returns the median RGB as a hex string.
 */
function sampleIrisPixels(
  pixels: Uint8ClampedArray,
  cx: number,
  cy: number,
  canvasW: number,
  canvasH: number,
): string {
  const irisOuter = estimateIrisRadius(pixels, cx, cy, canvasW, canvasH);
  // Pupil skip: inner 35% of iris radius
  const innerR = Math.round(irisOuter * 0.35);
  // Stay within 90% of the detected iris boundary (avoid sclera bleed)
  const outerR = Math.round(irisOuter * 0.90);

  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];

  const x0 = Math.max(0, Math.round(cx - outerR));
  const y0 = Math.max(0, Math.round(cy - outerR));
  const x1 = Math.min(canvasW - 1, Math.round(cx + outerR));
  const y1 = Math.min(canvasH - 1, Math.round(cy + outerR));

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < innerR || dist > outerR) continue;

      const idx = (y * canvasW + x) * 4;
      const r = pixels[idx]!;
      const g = pixels[idx + 1]!;
      const b = pixels[idx + 2]!;

      const brightness = (r + g + b) / 3;
      // Skip very dark pixels (pupil/shadow) and very bright (reflections/sclera)
      if (brightness < 30 || brightness > 220) continue;

      rs.push(r);
      gs.push(g);
      bs.push(b);
    }
  }

  if (rs.length < 10) return "#7B4F32"; // fallback if too few pixels found

  rs.sort((a, b) => a - b);
  gs.sort((a, b) => a - b);
  bs.sort((a, b) => a - b);

  const mid = Math.floor(rs.length / 2);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(rs[mid]!)}${toHex(gs[mid]!)}${toHex(bs[mid]!)}`;
}

/** Crop a 512×512 region around the detected iris center for AI naming */
function cropIrisRegion(canvas: HTMLCanvasElement, cx: number, cy: number): string {
  const shortSide = Math.min(canvas.width, canvas.height);
  const half = Math.min(Math.round(shortSide * 0.32), 400);

  const x0 = Math.max(0, Math.round(cx - half));
  const y0 = Math.max(0, Math.round(cy - half));
  const x1 = Math.min(canvas.width, Math.round(cx + half));
  const y1 = Math.min(canvas.height, Math.round(cy + half));
  const w = x1 - x0;
  const h = y1 - y0;

  const crop = document.createElement("canvas");
  const maxDim = 512;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  crop.width = Math.round(w * scale);
  crop.height = Math.round(h * scale);
  crop.getContext("2d")!.drawImage(canvas, x0, y0, w, h, 0, 0, crop.width, crop.height);
  return crop.toDataURL("image/jpeg", 0.92);
}

function toHex2(n: number) {
  return n.toString(16).padStart(2, "0");
}

function lightenHex(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
}

function HexCopyButton({ hex }: { hex: string }) {
  const [copied, setCopied] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex.toUpperCase()).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div
      onClick={copy}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && copy(e as unknown as React.MouseEvent)}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-mono font-bold border-2 cursor-pointer transition hover:scale-105 active:scale-95 select-none"
      style={{ borderColor: hex, color: hex, background: hex + "18" }}
      title="Copy hex code"
    >
      <span className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0" style={{ backgroundColor: hex }} />
      {hex.toUpperCase()}
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
    </div>
  );
}

export default function UploadPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DetectedColor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Detected iris center in display (CSS) coordinates — for the overlay dot
  const [irisCenter, setIrisCenter] = useState<{ x: number; y: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  /**
   * Core analysis routine. Always uses the auto-detected iris center,
   * so the color never changes regardless of where the user clicks.
   */
  const analyzeImage = useCallback(async (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setResult(null);
    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Get all pixel data once
      const fullData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = fullData.data;

      // Step 2: Auto-detect the pupil/iris center
      const { x: pupilX, y: pupilY } = findPupilCenter(pixels, canvas.width, canvas.height);

      // Convert canvas coords → display coords for the overlay dot
      const img = imgRef.current;
      if (img) {
        const rect = img.getBoundingClientRect();
        const displayX = (pupilX / canvas.width) * rect.width;
        const displayY = (pupilY / canvas.height) * rect.height;
        setIrisCenter({ x: displayX, y: displayY });
      }

      // Step 3: Sample the iris ring around the auto-detected center
      const sampledHex = sampleIrisPixels(pixels, pupilX, pupilY, canvas.width, canvas.height);

      // Step 4: Crop region around iris and send to AI for descriptive name
      const imageData = cropIrisRegion(canvas, pupilX, pupilY);

      const res = await fetch("/api/analyze-eye", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, sampledHex }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = (await res.json()) as DetectedColor;
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Could not detect eye colour. Please use a clear, close-up eye photo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        alert("Please upload a JPG, PNG, or WebP image.");
        return;
      }
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setResult(null);
      setIrisCenter(null);
      setError(null);

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        // Auto-analyze immediately once image is painted
        analyzeImage(canvas);
      };
      img.src = url;
    },
    [analyzeImage],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const reset = () => {
    setImageUrl(null);
    setResult(null);
    setIrisCenter(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const reanalyze = () => {
    const canvas = canvasRef.current;
    if (canvas && !isLoading) analyzeImage(canvas);
  };

  const matchedColor = result ? eyeColors.find((c) => c.id === result.id) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Atlas
        </Link>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Camera className="w-5 h-5 text-gray-700" />
              <h1 className="text-xl font-black text-gray-900">AI Iris Analysis — Exact Eye Colour Detection</h1>
            </div>
            <p className="text-gray-400 text-sm">Pixel-precise colour · Powered by GPT-4o Vision · Auto-detects iris automatically</p>
          </div>
          <div className="p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Reference Eye Colors</p>
            <div className="flex flex-wrap gap-2">
              {eyeColors.map((ec) => (
                <EyeIllustration key={ec.id} irisColor={ec.hex} size={70} selected={result?.id === ec.id} label={ec.name} />
              ))}
            </div>
          </div>
        </div>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-sm text-blue-700">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
          <div>
            <strong>Auto-detection:</strong> The app automatically finds and scans the iris in your photo — no need to click precisely. Upload any clear eye photo and it detects the exact colour instantly.
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!imageUrl ? (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-200 bg-white ${
                  isDragging ? "border-orange-400 bg-orange-50" : "border-gray-300 hover:border-orange-300 hover:bg-orange-50/30"
                }`}
              >
                <Upload className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-800 mb-2">Drop your eye image here</p>
                <p className="text-gray-400 text-sm mb-2">or click to browse</p>
                <p className="text-xs text-gray-300">Supports JPG, PNG, WebP — any clear eye photo works</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">

                {/* Image panel */}
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                  <div className="relative">
                    <img
                      ref={imgRef}
                      src={imageUrl}
                      alt="Eye"
                      className="w-full object-cover max-h-80 select-none"
                      draggable={false}
                    />

                    {/* Detected iris center dot */}
                    {irisCenter && (
                      <div
                        className="absolute pointer-events-none"
                        style={{ left: irisCenter.x, top: irisCenter.y, transform: "translate(-50%, -50%)" }}
                      >
                        {isLoading ? (
                          <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                          </div>
                        ) : (
                          <>
                            <div
                              className="w-10 h-10 rounded-full border-4 border-white shadow-lg animate-ping absolute inset-0 opacity-40"
                              style={{ borderColor: result?.hex ?? "#f97316" }}
                            />
                            <div
                              className="w-10 h-10 rounded-full border-4 border-white shadow-lg relative z-10"
                              style={{ backgroundColor: result?.hex ?? "#f97316" }}
                            />
                          </>
                        )}
                      </div>
                    )}

                    {/* Scanning overlay while loading */}
                    {isLoading && !irisCenter && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] pointer-events-none">
                        <div className="bg-white/95 rounded-2xl px-5 py-3 shadow-lg flex items-center gap-2 text-sm font-semibold text-gray-800">
                          <ScanEye className="w-4 h-4 text-orange-500 animate-pulse" />
                          Auto-detecting iris…
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <p className="text-gray-400 text-sm">
                      {isLoading ? "Scanning pixels & naming with AI…" : irisCenter ? "Iris auto-detected" : ""}
                    </p>
                    <div className="flex items-center gap-3">
                      {!isLoading && result && (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={reanalyze}
                          onKeyDown={(e) => e.key === "Enter" && reanalyze()}
                          className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-700 transition cursor-pointer font-semibold"
                        >
                          <ScanEye className="w-3.5 h-3.5" /> Re-scan
                        </div>
                      )}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={reset}
                        onKeyDown={(e) => e.key === "Enter" && reset()}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> New image
                      </div>
                    </div>
                  </div>
                </div>

                {/* Result panel */}
                <div className="flex flex-col gap-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">{error}</div>
                  )}

                  {isLoading && !result && (
                    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-10 flex flex-col items-center justify-center text-center flex-1 min-h-64">
                      <Loader2 className="w-10 h-10 text-orange-400 animate-spin mb-4" />
                      <p className="text-gray-700 font-semibold">Scanning iris pixels…</p>
                      <p className="text-gray-400 text-sm mt-1">Auto-locating iris and reading exact colour</p>
                    </div>
                  )}

                  {result && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white border-2 rounded-3xl shadow-sm overflow-hidden"
                      style={{ borderColor: result.hex }}
                    >
                      {/* Gradient swatch — exact detected colour */}
                      <div
                        className="h-24 w-full relative flex items-end px-5 pb-3"
                        style={{
                          background: `linear-gradient(135deg, ${lightenHex(result.hex, 40)} 0%, ${result.hex} 60%, ${result.hex} 100%)`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/25" />
                        <div className="relative z-10 flex items-center gap-3">
                          <span
                            className="w-8 h-8 rounded-full border-4 border-white/80 shadow-md flex-shrink-0"
                            style={{ backgroundColor: result.hex }}
                          />
                          <div>
                            <p className="text-white text-xs font-semibold tracking-widest uppercase opacity-80">Exact Iris Colour</p>
                            <p className="text-white font-mono text-sm font-bold">{result.hex.toUpperCase()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 pt-5 pb-2 text-center">
                        <h2 className="text-2xl font-black text-gray-900 mb-0.5">{result.exactName}</h2>
                        <p className="text-sm text-gray-400 mb-4">Category: {result.name}</p>
                        <div className="flex justify-center mb-5">
                          <HexCopyButton hex={result.hex} />
                        </div>
                        <div className="flex justify-center mb-3">
                          <EyeIllustration irisColor={result.hex} size={110} selected />
                        </div>
                        <div
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white shadow-sm mb-5"
                          style={{ backgroundColor: result.hex }}
                        >
                          <Eye className="w-4 h-4" />
                          Auto-detected · Named by GPT-4o
                        </div>
                      </div>

                      {matchedColor && (
                        <div className="px-6 pb-5">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Facts</p>
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{matchedColor.mainCountryFlag}</span>
                              <span>Most common in <strong>{matchedColor.mainCountry}</strong> ({matchedColor.mainCountryPercentage}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>🌍</span>
                              <span><strong>{matchedColor.globalPrevalence}</strong> of world population</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>🧬</span>
                              <span>Melanin: <strong>{matchedColor.melaninLevel}</strong></span>
                            </div>
                          </div>
                          <Link href={`/eye/${result.id}`}>
                            <div
                              className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold text-white transition cursor-pointer"
                              style={{ backgroundColor: result.hex }}
                            >
                              <Eye className="w-4 h-4" />
                              View full {result.name} profile
                            </div>
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {!result && !isLoading && !error && (
                    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-10 flex flex-col items-center justify-center text-center flex-1 min-h-64">
                      <ScanEye className="w-10 h-10 text-gray-200 mb-3" />
                      <p className="text-gray-500 font-semibold">Ready to scan</p>
                      <p className="text-gray-300 text-sm mt-1">Upload an eye photo to auto-detect iris colour</p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-center text-xs text-gray-400">
                Iris is auto-located from the image · Pixels sampled for exact hex · GPT-4o names the shade
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
