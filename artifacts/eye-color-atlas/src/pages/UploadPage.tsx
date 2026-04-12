import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Eye, RefreshCw, Info, ArrowLeft, Loader2, Copy, Check, MousePointer } from "lucide-react";
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
 * Sample pixels in a disc around the exact click point.
 * Filters out very dark pixels (pupil/eyelash shadow) and very bright
 * pixels (specular reflections, sclera) so only the iris pigment remains.
 * Returns the median RGB as a CSS hex string.
 */
function sampleFromClick(
  pixels: Uint8ClampedArray,
  cx: number,
  cy: number,
  canvasW: number,
  canvasH: number,
): string {
  const shortSide = Math.min(canvasW, canvasH);
  // Disc radius — big enough to average many iris pixels, small enough to
  // stay inside one iris even in close-up photos.
  const radius = Math.round(shortSide * 0.07);

  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];

  const x0 = Math.max(0, cx - radius);
  const y0 = Math.max(0, cy - radius);
  const x1 = Math.min(canvasW - 1, cx + radius);
  const y1 = Math.min(canvasH - 1, cy + radius);

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 > radius * radius) continue;

      const idx = (y * canvasW + x) * 4;
      const r   = pixels[idx]!;
      const g   = pixels[idx + 1]!;
      const b   = pixels[idx + 2]!;
      const bri = (r + g + b) / 3;

      // Skip pupil / deep shadows and sclera / reflections
      if (bri < 28 || bri > 228) continue;

      rs.push(r); gs.push(g); bs.push(b);
    }
  }

  if (rs.length < 6) return "#7B4F32"; // fallback

  rs.sort((a, b) => a - b);
  gs.sort((a, b) => a - b);
  bs.sort((a, b) => a - b);

  const mid = Math.floor(rs.length / 2);
  const h   = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(rs[mid]!)}${h(gs[mid]!)}${h(bs[mid]!)}`;
}

/** Crop a square region around the click for AI colour naming */
function cropRegion(canvas: HTMLCanvasElement, cx: number, cy: number): string {
  const shortSide = Math.min(canvas.width, canvas.height);
  const half = Math.min(Math.round(shortSide * 0.25), 350);

  const x0 = Math.max(0, cx - half);
  const y0 = Math.max(0, cy - half);
  const x1 = Math.min(canvas.width,  cx + half);
  const y1 = Math.min(canvas.height, cy + half);
  const w  = x1 - x0, h = y1 - y0;

  const crop  = document.createElement("canvas");
  const scale = Math.min(1, 512 / Math.max(w, h));
  crop.width  = Math.round(w * scale);
  crop.height = Math.round(h * scale);
  crop.getContext("2d")!.drawImage(canvas, x0, y0, w, h, 0, 0, crop.width, crop.height);
  return crop.toDataURL("image/jpeg", 0.92);
}

function lightenHex(hex: string, amount: number): string {
  const c = (s: number, e: number) => Math.min(255, parseInt(hex.slice(s, e), 16) + amount);
  const t = (n: number) => n.toString(16).padStart(2, "0");
  return `#${t(c(1, 3))}${t(c(3, 5))}${t(c(5, 7))}`;
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
  const [imageUrl,   setImageUrl]   = useState<string | null>(null);
  const [result,     setResult]     = useState<DetectedColor | null>(null);
  const [dotPos,     setDotPos]     = useState<{ x: number; y: number } | null>(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);
  const pixelsRef    = useRef<Uint8ClampedArray | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      alert("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResult(null);
    setDotPos(null);
    setError(null);
    pixelsRef.current = null;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      // Cache pixel data once; reuse on every click
      pixelsRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    };
    img.src = url;
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleImageClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    const pixels = pixelsRef.current;
    if (!canvas || !img || !pixels || isLoading) return;

    // Map CSS display coordinates → actual canvas pixel coordinates
    const rect   = img.getBoundingClientRect();
    const dispX  = e.clientX - rect.left;
    const dispY  = e.clientY - rect.top;
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx     = Math.round(dispX * scaleX);
    const cy     = Math.round(dispY * scaleY);

    // Place dot exactly where user clicked (no relocation)
    setDotPos({ x: dispX, y: dispY });
    setResult(null);
    setError(null);
    setIsLoading(true);

    try {
      // Sample iris pixels directly at the click point
      const sampledHex = sampleFromClick(pixels, cx, cy, canvas.width, canvas.height);

      // Crop the region around the click for AI colour naming
      const imageData = cropRegion(canvas, cx, cy);

      const res = await fetch("/api/analyze-eye", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ imageData, sampledHex }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = (await res.json()) as DetectedColor;
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Could not detect colour. Click directly on the coloured part of the iris.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const reset = () => {
    setImageUrl(null);
    setResult(null);
    setDotPos(null);
    setError(null);
    pixelsRef.current = null;
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
            <p className="text-gray-400 text-sm">Pixel-precise colour · Powered by GPT-4o Vision · Click directly on the iris</p>
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
            <strong>How to use:</strong> Upload a clear eye photo, then click directly on the coloured part of the iris (not the pupil or white area). The dot marks exactly where you clicked and the colour is sampled from that spot.
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
                  isDragging
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-300 hover:border-orange-300 hover:bg-orange-50/30"
                }`}
              >
                <Upload className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-800 mb-2">Drop your eye image here</p>
                <p className="text-gray-400 text-sm mb-2">or click to browse</p>
                <p className="text-xs text-gray-300">JPG, PNG, WebP · Close-up eye photos work best</p>
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

                    {/* Dot placed exactly at click position */}
                    {dotPos && (
                      <div
                        className="absolute pointer-events-none"
                        style={{ left: dotPos.x, top: dotPos.y, transform: "translate(-50%,-50%)" }}
                      >
                        {isLoading ? (
                          <div className="w-9 h-9 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                          </div>
                        ) : (
                          <>
                            <div
                              className="w-9 h-9 rounded-full border-4 border-white shadow-lg animate-ping absolute inset-0 opacity-40"
                              style={{ borderColor: result?.hex ?? "#f97316" }}
                            />
                            <div
                              className="w-9 h-9 rounded-full border-4 border-white shadow-lg relative z-10"
                              style={{ backgroundColor: result?.hex ?? "#f97316" }}
                            />
                          </>
                        )}
                      </div>
                    )}

                    {/* First-click hint overlay */}
                    {!dotPos && !isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] pointer-events-none">
                        <div className="bg-white/95 rounded-2xl px-5 py-3 shadow-lg flex items-center gap-2 text-sm font-semibold text-gray-800">
                          <MousePointer className="w-4 h-4 text-orange-500" />
                          Click on the iris to detect colour
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <p className="text-gray-400 text-sm">
                      {isLoading
                        ? "Reading pixels…"
                        : dotPos
                          ? "Click anywhere else to re-detect"
                          : "Waiting for click"}
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
                      <p className="text-gray-700 font-semibold">Sampling iris pixels…</p>
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
                      {/* Colour swatch header */}
                      <div
                        className="h-24 w-full relative flex items-end px-5 pb-3"
                        style={{ background: `linear-gradient(135deg, ${lightenHex(result.hex, 40)} 0%, ${result.hex} 60%)` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/25" />
                        <div className="relative z-10 flex items-center gap-3">
                          <span
                            className="w-8 h-8 rounded-full border-4 border-white/80 shadow-md"
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
                          Pixel-sampled · Named by GPT-4o
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
                      <MousePointer className="w-10 h-10 text-gray-200 mb-3" />
                      <p className="text-gray-500 font-semibold">Click the iris</p>
                      <p className="text-gray-300 text-sm mt-1">Click on the coloured ring of the eye — not the pupil or white area</p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-center text-xs text-gray-400">
                Dot marks exactly where you clicked · Pixels at that spot give the exact hex · GPT-4o names the shade
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
