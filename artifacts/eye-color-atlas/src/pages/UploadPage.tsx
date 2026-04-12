import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Eye, RefreshCw, Info, ArrowLeft, MousePointer, Loader2, Copy, Check } from "lucide-react";
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

/** Sample pixels in a donut ring around the click point, filtering out
 *  pupil (very dark) and specular reflections (very bright).
 *  Returns the median RGB as a hex string.
 */
function sampleIrisPixels(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  canvasW: number,
  canvasH: number,
): string {
  const shortSide = Math.min(canvasW, canvasH);
  // Inner ring starts at 12% of short side to skip the pupil centre
  const innerR = Math.round(shortSide * 0.06);
  // Outer ring goes to 30% — covers most of the iris
  const outerR = Math.round(shortSide * 0.22);

  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];

  const x0 = Math.max(0, Math.round(cx - outerR));
  const y0 = Math.max(0, Math.round(cy - outerR));
  const x1 = Math.min(canvasW - 1, Math.round(cx + outerR));
  const y1 = Math.min(canvasH - 1, Math.round(cy + outerR));

  const imageData = ctx.getImageData(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
  const data = imageData.data;
  const w = x1 - x0 + 1;

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < innerR || dist > outerR) continue;

      const idx = ((y - y0) * w + (x - x0)) * 4;
      const r = data[idx]!;
      const g = data[idx + 1]!;
      const b = data[idx + 2]!;

      // Skip very dark pixels (pupil / shadow) and very bright (reflections)
      const brightness = (r + g + b) / 3;
      if (brightness < 25 || brightness > 230) continue;

      rs.push(r);
      gs.push(g);
      bs.push(b);
    }
  }

  if (rs.length === 0) return "#7B4F32"; // fallback

  rs.sort((a, b) => a - b);
  gs.sort((a, b) => a - b);
  bs.sort((a, b) => a - b);

  const mid = Math.floor(rs.length / 2);
  const r = rs[mid]!;
  const g = gs[mid]!;
  const b = bs[mid]!;

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Crop a region around the click and return a base64 JPEG data URL */
function cropRegion(canvas: HTMLCanvasElement, px: number, py: number): string {
  const shortSide = Math.min(canvas.width, canvas.height);
  const half = Math.min(Math.floor(shortSide * 0.35), 400);

  const x0 = Math.max(0, Math.round(px - half));
  const y0 = Math.max(0, Math.round(py - half));
  const x1 = Math.min(canvas.width, Math.round(px + half));
  const y1 = Math.min(canvas.height, Math.round(py + half));
  const w = x1 - x0;
  const h = y1 - y0;

  const crop = document.createElement("canvas");
  const maxDim = 512;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  crop.width = Math.round(w * scale);
  crop.height = Math.round(h * scale);
  const ctx = crop.getContext("2d")!;
  ctx.drawImage(canvas, x0, y0, w, h, 0, 0, crop.width, crop.height);
  return crop.toDataURL("image/jpeg", 0.92);
}

function toHex2(n: number) {
  return n.toString(16).padStart(2, "0");
}

/** Lighten a hex color slightly for the swatch gradient */
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
      <span
        className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
        style={{ backgroundColor: hex }}
      />
      {hex.toUpperCase()}
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
    </div>
  );
}

export default function UploadPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DetectedColor | null>(null);
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      alert("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResult(null);
    setClickPos(null);
    setError(null);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
    };
    img.src = url;
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleImageClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img || isLoading) return;

      const rect = img.getBoundingClientRect();
      const displayX = e.clientX - rect.left;
      const displayY = e.clientY - rect.top;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = displayX * scaleX;
      const canvasY = displayY * scaleY;

      setClickPos({ x: displayX, y: displayY });
      setResult(null);
      setError(null);
      setIsLoading(true);

      try {
        // Step 1: Sample real pixels from the iris area for the exact hex
        const ctx = canvas.getContext("2d");
        const sampledHex = ctx
          ? sampleIrisPixels(ctx, canvasX, canvasY, canvas.width, canvas.height)
          : "#7B4F32";

        // Step 2: Crop the region and send to AI for descriptive name + category
        const imageData = cropRegion(canvas, canvasX, canvasY);

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
        setError("Could not detect eye colour. Try clicking directly on the iris.");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const reset = () => {
    setImageUrl(null);
    setResult(null);
    setClickPos(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
            <p className="text-gray-400 text-sm">Pixel-precise colour · Powered by GPT-4o Vision · Upload a photo · Click on the iris</p>
          </div>

          <div className="p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Reference Eye Colors</p>
            <div className="flex flex-wrap gap-2">
              {eyeColors.map((ec) => (
                <EyeIllustration
                  key={ec.id}
                  irisColor={ec.hex}
                  size={70}
                  selected={result?.id === ec.id}
                  label={ec.name}
                />
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
            <strong>How it works:</strong> Click directly on the iris. The app reads the actual pixel colours from your image to get the precise hex, then GPT-4o names the shade. Click again to re-sample.
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!imageUrl ? (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
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
                <p className="text-xs text-gray-300">Supports JPG, PNG, WebP — any eye photo works</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                {/* Image with click target */}
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                  <div
                    className="relative"
                    style={{ cursor: isLoading ? "wait" : "crosshair" }}
                    onClick={handleImageClick}
                  >
                    <img
                      ref={imgRef}
                      src={imageUrl}
                      alt="Eye"
                      className="w-full object-cover max-h-80 select-none"
                      draggable={false}
                    />

                    {clickPos && (
                      <div
                        className="absolute pointer-events-none"
                        style={{ left: clickPos.x, top: clickPos.y, transform: "translate(-50%, -50%)" }}
                      >
                        {isLoading ? (
                          <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                          </div>
                        ) : (
                          <>
                            <div
                              className="w-8 h-8 rounded-full border-4 border-white shadow-lg animate-ping absolute inset-0 opacity-50"
                              style={{ borderColor: result?.hex ?? "white" }}
                            />
                            <div
                              className="w-8 h-8 rounded-full border-4 border-white shadow-lg relative z-10"
                              style={{ backgroundColor: result?.hex ?? "white" }}
                            />
                          </>
                        )}
                      </div>
                    )}

                    {!clickPos && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] pointer-events-none">
                        <div className="bg-white/95 rounded-2xl px-5 py-3 shadow-lg flex items-center gap-2 text-sm font-semibold text-gray-800">
                          <MousePointer className="w-4 h-4 text-orange-500" />
                          Click on the iris to detect exact colour
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <p className="text-gray-400 text-sm">
                      {isLoading ? "Sampling pixels & naming with AI…" : clickPos ? "Click again to re-sample" : "Waiting for click"}
                    </p>
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

                {/* Result panel */}
                <div className="flex flex-col gap-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">{error}</div>
                  )}

                  {isLoading && !result && (
                    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-10 flex flex-col items-center justify-center text-center flex-1 min-h-64">
                      <Loader2 className="w-10 h-10 text-orange-400 animate-spin mb-4" />
                      <p className="text-gray-700 font-semibold">Reading iris pixels…</p>
                      <p className="text-gray-400 text-sm mt-1">Getting exact colour from your image</p>
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
                            <p className="text-white text-xs font-semibold tracking-widest uppercase opacity-80">
                              Exact Iris Colour
                            </p>
                            <p className="text-white font-mono text-sm font-bold">{result.hex.toUpperCase()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 pt-5 pb-2 text-center">
                        {/* Descriptive name from AI */}
                        <h2 className="text-2xl font-black text-gray-900 mb-0.5">{result.exactName}</h2>
                        <p className="text-sm text-gray-400 mb-4">Category: {result.name}</p>

                        {/* Copyable hex badge */}
                        <div className="flex justify-center mb-5">
                          <HexCopyButton hex={result.hex} />
                        </div>

                        {/* Eye illustration with exact colour */}
                        <div className="flex justify-center mb-3">
                          <EyeIllustration irisColor={result.hex} size={110} selected />
                        </div>

                        <div
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white shadow-sm mb-5"
                          style={{ backgroundColor: result.hex }}
                        >
                          <Eye className="w-4 h-4" />
                          Pixel-sampled · Named by GPT-4o
                        </div>
                      </div>

                      {matchedColor && (
                        <div className="px-6 pb-5">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Facts</p>
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{matchedColor.mainCountryFlag}</span>
                              <span>
                                Most common in <strong>{matchedColor.mainCountry}</strong> ({matchedColor.mainCountryPercentage}%)
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>🌍</span>
                              <span>
                                <strong>{matchedColor.globalPrevalence}</strong> of world population
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>🧬</span>
                              <span>
                                Melanin: <strong>{matchedColor.melaninLevel}</strong>
                              </span>
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
                      <MousePointer className="w-10 h-10 text-gray-200 mb-3" />
                      <p className="text-gray-500 font-semibold">Click on the iris</p>
                      <p className="text-gray-300 text-sm mt-1">in the image on the left</p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-center text-xs text-gray-400">
                Pixels are sampled directly from your image for the exact hex · GPT-4o names the shade · Click anywhere on the iris
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
