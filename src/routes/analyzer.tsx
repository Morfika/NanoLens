import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Camera, RefreshCw, FileDown, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { analyzePixels, type AnalysisResult } from "@/lib/colorAnalysis";

export const Route = createFileRoute("/analyzer")({
  head: () => ({
    meta: [
      { title: "Analizador de muestra — NanoLens" },
      { name: "description", content: "Sube o captura una foto de tu muestra de AgNPs y obtén una estimación del tamaño de partícula." },
    ],
  }),
  component: AnalyzerPage,
});

interface CropRect { x: number; y: number; w: number; h: number }

function AnalyzerPage() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const onFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImgSrc(e.target?.result as string);
      setCrop(null);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  // Cropping (mouse + touch)
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (!overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    startRef.current = { x, y };
    setCrop({ x, y, w: 0, h: 0 });
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!startRef.current || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const sx = startRef.current.x, sy = startRef.current.y;
    setCrop({ x: Math.min(sx, x), y: Math.min(sy, y), w: Math.abs(x - sx), h: Math.abs(y - sy) });
  };
  const onPointerUp = () => { startRef.current = null; };

  const analyze = useCallback(() => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    const overlayRect = overlayRef.current!.getBoundingClientRect();
    const scaleX = img.naturalWidth / overlayRect.width;
    const scaleY = img.naturalHeight / overlayRect.height;

    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (crop && crop.w > 10 && crop.h > 10) {
      sx = Math.round(crop.x * scaleX);
      sy = Math.round(crop.y * scaleY);
      sw = Math.round(crop.w * scaleX);
      sh = Math.round(crop.h * scaleY);
    }
    // Cap canvas size for speed
    const maxDim = 400;
    const scale = Math.min(1, maxDim / Math.max(sw, sh));
    const cw = Math.max(1, Math.round(sw * scale));
    const ch = Math.max(1, Math.round(sh * scale));
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    const data = ctx.getImageData(0, 0, cw, ch).data;
    const r = analyzePixels(data);
    setResult(r);
  }, [crop]);

  const reset = () => { setImgSrc(null); setCrop(null); setResult(null); };

  const exportPDF = () => window.print();

  useEffect(() => {
    if (result) {
      requestAnimationFrame(() => {
        document.getElementById("results-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [result]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground">Analizador de muestra</h1>
        <p className="mt-1 text-muted-foreground">Sube una foto de tu muestra de AgNPs en solución, recorta la zona coloreada y obtén el rango estimado.</p>
      </header>

      {!imgSrc ? (
        <Card
          className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed p-10 text-center transition-colors ${dragOver ? "border-primary bg-accent" : "border-border"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary">
            <Upload className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">Arrastra tu imagen aquí</p>
            <p className="mt-1 text-sm text-muted-foreground">o selecciona desde tu dispositivo (JPG, PNG)</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => fileRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" /> Subir imagen
            </Button>
            <Button variant="outline" onClick={() => cameraRef.current?.click()} className="gap-2">
              <Camera className="h-4 w-4" /> Usar cámara
            </Button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                <Info className="mr-1 inline h-4 w-4 text-primary" />
                Arrastra sobre la imagen para seleccionar la zona de la solución (excluye paredes del tubo y fondo).
              </p>
              <Button size="sm" variant="ghost" onClick={reset} className="gap-1"><RefreshCw className="h-4 w-4" /> Nueva</Button>
            </div>
            <div
              ref={overlayRef}
              className="relative w-full select-none overflow-hidden rounded-lg border border-border bg-secondary touch-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img ref={imgRef} src={imgSrc} className="block h-auto w-full" draggable={false} alt="Muestra cargada" />
              {crop && crop.w > 0 && crop.h > 0 && (
                <div
                  className="pointer-events-none absolute border-2 border-primary bg-primary/10"
                  style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
                />
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={analyze} className="gap-2"><CheckCircle2 className="h-4 w-4" /> Analizar color</Button>
              <Button variant="outline" onClick={() => setCrop(null)}>Limpiar selección</Button>
            </div>
          </Card>

          <div id="results-panel">
            {result ? <ResultsPanel result={result} onReset={reset} onExport={exportPDF} /> : (
              <Card className="p-6 text-sm text-muted-foreground">
                Selecciona una zona y presiona <span className="font-semibold text-foreground">Analizar color</span>. El procesamiento ocurre en tu navegador.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function confidenceBadge(c: AnalysisResult["confidence"]) {
  if (c === "alta") return { color: "bg-success text-success-foreground", label: "Confianza alta" };
  if (c === "media") return { color: "bg-warning text-warning-foreground", label: "Confianza media" };
  return { color: "bg-destructive text-destructive-foreground", label: "Confianza baja" };
}

function ResultsPanel({ result, onReset, onExport }: { result: AnalysisResult; onReset: () => void; onExport: () => void }) {
  const cb = confidenceBadge(result.confidence);
  const midSize = (result.sizeRange.min + result.sizeRange.max) / 2;
  const gaugePct = Math.min(100, Math.max(0, (midSize / 100) * 100));
  return (
    <Card className="fade-in-up space-y-5 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Resultado</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cb.color}`}>{cb.label}</span>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="h-20 w-20 rounded-full border-2 border-border shadow-card"
          style={{ background: result.hex }}
          aria-label={`Color dominante ${result.hex}`}
        />
        <div className="space-y-1 text-sm">
          <div><span className="text-muted-foreground">HEX:</span> <code className="font-semibold text-foreground">{result.hex}</code></div>
          <div><span className="text-muted-foreground">RGB:</span> <code className="text-foreground">{result.rgb.r}, {result.rgb.g}, {result.rgb.b}</code></div>
          <div><span className="text-muted-foreground">HSV:</span> <code className="text-foreground">{Math.round(result.hsv.h)}°, {(result.hsv.s * 100).toFixed(0)}%, {(result.hsv.v * 100).toFixed(0)}%</code></div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-secondary p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pico de absorbancia estimado</div>
        <div className="mt-1 text-2xl font-semibold text-primary">{result.estimatedWavelength} nm</div>
        <div className="mt-1 text-xs text-muted-foreground">Inferido a partir del tono dominante (correlación UV-Vis)</div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rango de tamaño estimado</span>
          <span className="text-lg font-semibold text-foreground">{result.sizeRange.label}</span>
        </div>
        <div className="relative h-3 w-full rounded-full bg-secondary">
          <div
            className="absolute top-0 h-3 rounded-full bg-gradient-to-r from-primary to-primary-hover"
            style={{ left: `${(result.sizeRange.min / 100) * 100}%`, width: `${((result.sizeRange.max - result.sizeRange.min) / 100) * 100}%` }}
          />
          <div className="absolute -top-1 h-5 w-1 rounded-full bg-foreground" style={{ left: `calc(${gaugePct}% - 2px)` }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>0</span><span>50</span><span>100 nm</span></div>
        <p className="mt-2 text-sm text-muted-foreground">{result.sizeRange.description}</p>
      </div>

      {result.warnings.length > 0 && (
        <div className="space-y-2">
          {result.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button onClick={onReset} variant="outline" className="flex-1 gap-2"><RefreshCw className="h-4 w-4" /> Nueva muestra</Button>
        <Button onClick={onExport} className="flex-1 gap-2"><FileDown className="h-4 w-4" /> Exportar PDF</Button>
      </div>
    </Card>
  );
}
