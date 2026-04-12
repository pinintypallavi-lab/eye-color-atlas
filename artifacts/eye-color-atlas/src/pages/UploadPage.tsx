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
 * Within a LOCAL search area around the user's click, find the best pupil center
 * using ring-contrast scoring: a true pupil is a dark disk surrounded by a
 * lighter iris ring. Eyebrows, eyelashes, and shadows are dark but have
 * no lighter ring, so they score near zero and are ignored.
 *
 * searchR controls how far from the click we look for the pupil center.
 */
function findLocalPupilCenter(
  pixels: Uint8ClampedArray,
  clickX: number,
  clickY: number,
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  const shortSide = Math.min(canvasW, canvasH);

  // Pupil radius assumption: ~5% of image short side
  const pupilR  = Math.round(shortSide * 0.05);
  // Iris ring extends to ~16% of image short side from center
  const irisR   = Math.round(shortSide * 0.16);
  // How far from the click to search for the pupil center
  const searchR = Math.round(shortSide * 0.20);
  // Grid step for candidate points
  const step    = Math.max(2, Math.round(shortSide / 45));

  let bestScore = -Infinity;
  let bestX = clickX;
  let bestY = clickY;

  const x0 = Math.max(irisR, Math.round(clickX - searchR));
  const y0 = Math.max(irisR, Math.round(clickY - searchR));
  const x1 = Math.min(canvasW - irisR - 1, Math.round(clickX + searchR));
  const y1 = Math.min(canvasH - irisR - 1, Math.round(clickY + searchR));

  for (let cy = y0; cy <= y1; cy += step) {
    for (let cx = x0; cx <= x1; cx += step) {
      let centerSum = 0, centerN = 0;
      let ringSum   = 0, ringN   = 0;

      for (let dy = -irisR; dy <= irisR; dy += step) {
        for (let dx = -irisR; dx <= irisR; dx += step) {
          const px = cx + dx;
          const py = cy + dy;
          if (px < 0 || px >= canvasW || py < 0 || py >= canvasH) continue;

          const dist = Math.sqrt(dx * dx + dy * dy);
          const idx  = (py * canvasW + px) * 4;
          const b    = (pixels[idx]! + pixels[idx + 1]! + pixels[idx + 2]!) / 3;

          if (dist <= pupilR) {
            centerSum += b; centerN++;
          } else if (dist <= irisR) {
            ringSum += b; ringN++;
          }
        }
      }

      if (centerN === 0 || ringN === 0) continue;
      const centerAvg = centerSum / centerN;
      const ringAvg   = ringSum   / ringN;

      // Pupil must be fairly dark — reject skin/sclera highlights
      if (centerAvg > 115) continue;

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
 * Scan outward from the pupil center in multiple directions to find
 * where the iris meets the sclera (sharp brightness jump).
 * Returns the adaptive iris outer radius.
 */
function estimateIrisRadius(
  pixels: Uint8ClampedArray,
  cx: number,
  cy: number,
  canvasW: number,
  canvasH: number,
): number {
  const shortSide = Math.min(canvasW, canvasH);
  const maxR = Math.round(shortSide * 0.30);
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

      // Sharp brightness jump > 55 = iris→sclera boundary
      if (prevB >= 0 && b - prevB > 55) {
        radii.push(r);
        break;
      }
      prevB = b;
    }
  }

  if (radii.length < 6) return Math.round(shortSide * 0.15); // fallback

  radii.sort((a, b) => a - b);
  // 60th percentile avoids eyelid cutoffs top/bottom
  return radii[Math.floor(radii.length * 0.6)]!;
}

/**
 * Sample a donut ring of iris pixels around the detected pupil center.
 * Uses adaptive radii — stays strictly inside the iris ring.
 * Returns the median RGB as a CSS hex string.
 */
function sampleIrisPixels(
  pixels: Uint8ClampedArray,
  cx: number,
  cy: number,
  canvasW: number,
  canvasH: number,
): string {
  const irisOuter = estimateIrisRadius(pixels, cx, cy, canvasW, canvasH);
  const innerR    = Math.round(irisOuter * 0.38); // skip pupil
  const outerR    = Math.round(irisOuter * 0.88); // stay inside iris

  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];

  const x0 = Math.max(0, Math.round(cx - outerR));
  const y0 = Math.max(0, Math.round(cy - outerR));
  const x1 = Math.min(canvasW - 1, Math.round(cx + outerR));
  const y1 = Math.min(canvasH - 1, Math.round(cy + outerR));

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist < innerR || dist > outerR) continue;

      const idx = (y * canvasW + x) * 4;
      const r   = pixels[idx]!;
      const g   = pixels[idx + 1]!;
      const b   = pixels[idx + 2]!;
      const bri = (r + g + b) / 3;

      // Exclude very dark (pupil/shadow) and very bright (reflection/sclera)
      if (bri < 28 || bri > 225) continue;

      rs.push(r); gs.push(g); bs.push(b);
    }
  }

  if (rs.length < 8) return "#7B4F32"; // fallback

  rs.sort((a, b) => a - b);
  gs.sort((a, b) => a - b);
  bs.sort((a, b) => a - b);

  const mid = Math.floor(rs.length / 2);
  const h   = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(rs[mid]!)}${h(gs[mid]!)}${h(bs[mid]!)}`;
}

/** Crop a region around the iris center and return a base64 JPEG for AI naming */
function cropIrisRegion(canvas: HTMLCanvasElement, cx: number, cy: number): string {
  const shortSide = Math.min(canvas.width, canvas.height);
  const half = Math.min(Math.round(shortSide * 0.30), 380);

  const x0 = Math.max(0, Math.round(cx - half));
  const y0 = Math.max(0, Math.round(cy - half));
  const x1 = Math.min(canvas.width,  Math.round(cx + half));
  const y1 = Math.min(canvas.height, Math.round(cy + half));
  const w = x1 - x0, h = y1 - y0;

  const crop  = document.createElement("canvas");
  const scale = Math.min(1, 512 / Math.max(w, h));
  crop.width  = Math.round(w * scale);
  crop.height = Math.round(h * scale);
  crop.getContext("2d")!.drawImage(canvas, x0, y0, w, h, 0, 0, crop.width, crop.height);
  return crop.toDataURL("image/jpeg", 0.92);
}

function lightenHex(hex: string, amount: number): string {
  const h = (s: number, e: number) => Math.min(255, parseInt(hex.slice(s, e), 16) + amount);
  const t = (n: number) => n.toString(16).padStart(2, "0");
  return `#${t(h(1, 3))}${t(h(3, 5))}${t(h(5, 7))}`;
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
  const [imageUrl,  setImageUrl]  = useState<string | null>(null);
  const [result,    setResult]    = useState<DetectedColor | null>(null);
  const [dotPos,    setDotPos]    = useState<{ x: number; y: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [isDragging,setIsDragging]= useState(false);

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
      // Cache pixel data so we don't re-read it on every click
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

  /** Called when user clicks anywhere on the eye image */
  const handleImageClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    const pixels = pixelsRef.current;
    if (!canvas || !img || !pixels || isLoading) return;

    // Map display click → canvas pixel coordinates
    const rect     = img.getBoundingClientRect();
    const displayX = e.clientX - rect.left;
    const displayY = e.clientY - rect.top;
    const scaleX   = canvas.width  / rect.width;
    const scaleY   = canvas.height / rect.height;
    const clickX   = Math.round(displayX * scaleX);
    const clickY   = Math.round(displayY * scaleY);

    setResult(null);
    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Find the actual pupil center near where the user clicked
      const { x: pupilX, y: pupilY } = findLocalPupilCenter(
        pixels, clickX, clickY, canvas.width, canvas.height,
      );

      // Show dot at the refined pupil center (in display coords)
      setDotPos({
        x: (pupilX / canvas.width)  * rect.width,
        y: (pupilY / canvas.height) * rect.height,
      });

      // Step 2: Sample the iris ring around the pupil
      const sampledHex = sampleIrisPixels(pixels, pupilX, pupilY, canvas.width, canvas.height);

      // Step 3: Send cropped iris region to AI for descriptive name
      const imageData = cropIrisRegion(canvas, pupilX, pupilY);

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
      setError("Could not detect colour. Try clicking directly on the iris.");
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
            <p className="text-gray-400 text-sm">Pixel-precise colour · Powered by GPT-4o Vision · Click on the iris to detect</p>
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
            <strong>How to use:</strong> Upload any clear eye photo, then click once on the iris. The app locates the pupil near your click, samples the iris ring pixels, and gets an exact hex colour — no matter where on the iris you click.
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

                    {/* Dot at detected pupil center */}
                    {dotPos && (
                      <div
                        className="absolute pointer-events-none"
                        style={{ left: dotPos.x, top: dotPos.y, transform: "translate(-50%,-50%)" }}
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

                    {/* Overlay hint before first click */}
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
                      {isLoading ? "Finding iris & reading pixels…" : dotPos ? "Click again to re-detect" : "Waiting for click"}
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
                      {/* Gradient swatch */}
                      <div
                        className="h-24 w-full relative flex items-end px-5 pb-3"
                        style={{ background: `linear-gradient(135deg, ${lightenHex(result.hex, 40)} 0%, ${result.hex} 60%)` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/25" />
                        <div className="relative z-10 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full border-4 border-white/80 shadow-md" style={{ backgroundColor: result.hex }} />
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
                      <p className="text-gray-300 text-sm mt-1">Click anywhere on or near the iris in the image</p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-center text-xs text-gray-400">
                Click anywhere on the iris · Pupil auto-located near your click · Pixels sampled for exact hex · GPT-4o names the shade
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
