import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Camera, RefreshCw, FileDown, AlertTriangle, CheckCircle2, Info, Aperture, Activity, ScanLine } from "lucide-react";
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
  const [isScanning, setIsScanning] = useState(false);
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
    setIsScanning(true);
    
    // Simulate scan delay for visual effect
    setTimeout(() => {
      const img = imgRef.current!;
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
      if (!ctx) { setIsScanning(false); return; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
      const data = ctx.getImageData(0, 0, cw, ch).data;
      const r = analyzePixels(data);
      setResult(r);
      setIsScanning(false);
    }, 1500);
  }, [crop]);

  const reset = () => { setImgSrc(null); setCrop(null); setResult(null); setIsScanning(false); };

  const exportPDF = () => window.print();

  useEffect(() => {
    if (result) {
      requestAnimationFrame(() => {
        document.getElementById("results-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [result]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-16 relative">
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] opacity-20 nl-aurora" />
      
      <header className="mb-10 text-center sm:text-left fade-in-up">
        <h1 className="text-4xl font-semibold text-foreground flex items-center justify-center sm:justify-start gap-3">
          <Aperture className="h-8 w-8 text-primary nl-spin-slow" />
          <span>Analizador Óptico</span>
        </h1>
        <p className="mt-2 text-muted-foreground text-lg max-w-2xl">
          Inicializa la secuencia de análisis. Carga la captura de tu solución coloidal de AgNPs y recorta la región de interés para el algoritmo.
        </p>
      </header>

      {!imgSrc ? (
        <div 
          className={`relative overflow-hidden rounded-2xl transition-all duration-300 fade-in-up-delay-1 nl-card ${
            dragOver ? "scale-[1.02] border-primary/60 shadow-glow" : "border-border/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="absolute inset-0 nl-grid-bg opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center justify-center gap-8 p-12 sm:p-20 text-center">
            <div className="nl-glow-ring rounded-full p-6 bg-background/50 backdrop-blur-sm relative group">
              <div className="absolute inset-0 rounded-full bg-primary/20 nl-pulse" />
              <ScanLine className="h-12 w-12 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Enlace de datos establecido</h3>
              <p className="text-muted-foreground text-base">Arrastra la imagen espectral aquí o selecciona el canal de entrada</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 w-full max-w-md">
              <Button 
                onClick={() => fileRef.current?.click()} 
                className="flex-1 gap-2 h-12 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 backdrop-blur-md transition-all hover:shadow-[0_0_20px_-5px_var(--primary)]"
              >
                <Upload className="h-5 w-5" /> Importar Archivo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => cameraRef.current?.click()} 
                className="flex-1 gap-2 h-12 border-border/50 bg-background/50 backdrop-blur-md hover:border-primary/50 hover:text-primary transition-all"
              >
                <Camera className="h-5 w-5" /> Iniciar Sensor
              </Button>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start fade-in-up">
          <Card className="p-1 nl-card overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="bg-secondary/40 p-3 flex items-start justify-between gap-3 border-b border-border/50 rounded-t-[15px]">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Define el área de muestreo. Excluye interferencias del recipiente.
              </p>
              <Button size="sm" variant="ghost" onClick={reset} className="h-7 px-2 text-xs gap-1 hover:text-primary"><RefreshCw className="h-3 w-3" /> Reiniciar</Button>
            </div>
            
            <div className="p-4 relative">
              <div
                ref={overlayRef}
                className="relative w-full select-none overflow-hidden rounded-xl border border-primary/20 bg-black touch-none cursor-crosshair shadow-inner"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img ref={imgRef} src={imgSrc} className="block h-auto w-full opacity-90 transition-opacity" draggable={false} alt="Muestra cargada" />
                
                {crop && crop.w > 0 && crop.h > 0 && (
                  <div
                    className="absolute border border-primary bg-primary/20 backdrop-blur-[1px] nl-sweep"
                    style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
                  >
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary" />
                  </div>
                )}
                
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none z-20">
                    <div className="absolute inset-0 bg-primary/10" />
                    <div className="h-full w-full nl-scanline bg-gradient-to-b from-transparent via-primary to-transparent opacity-70" />
                  </div>
                )}
              </div>
              
              <div className="mt-5 flex flex-wrap gap-3">
                <Button 
                  onClick={analyze} 
                  disabled={isScanning}
                  className="flex-1 gap-2 h-12 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 relative overflow-hidden group"
                >
                  {isScanning ? (
                    <>
                      <Activity className="h-5 w-5 animate-pulse" /> Analizando matriz...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" /> Ejecutar Análisis
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full group-hover:animate-[nlSweep_2s_ease-in-out_infinite]" />
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setCrop(null)} className="h-12 border-border/50 hover:border-border">Limpiar Coordenadas</Button>
              </div>
            </div>
          </Card>

          <div id="results-panel" className="sticky top-24">
            {result ? <ResultsPanel result={result} onReset={reset} onExport={exportPDF} /> : (
              <div className="nl-card border-dashed border-border/50 p-8 text-center flex flex-col items-center justify-center min-h-[300px] text-muted-foreground bg-background/30 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center mb-4 nl-spin-slow">
                  <Atom className="h-6 w-6 text-primary/50" />
                </div>
                <p className="text-sm uppercase tracking-widest font-mono text-primary/70 mb-2">Esperando Telemetría</p>
                <p className="text-sm">Selecciona una región de interés en la imagen y presiona Ejecutar Análisis para procesar los datos a nivel de píxel.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function confidenceBadge(c: AnalysisResult["confidence"]) {
  if (c === "alta") return { color: "bg-success/20 text-success border-success/50", label: "Señal Óptima" };
  if (c === "media") return { color: "bg-warning/20 text-warning border-warning/50", label: "Señal Media" };
  return { color: "bg-destructive/20 text-destructive border-destructive/50", label: "Señal Débil" };
}

function ResultsPanel({ result, onReset, onExport }: { result: AnalysisResult; onReset: () => void; onExport: () => void }) {
  const cb = confidenceBadge(result.confidence);
  const midSize = (result.sizeRange.min + result.sizeRange.max) / 2;
  const gaugePct = Math.min(100, Math.max(0, (midSize / 100) * 100));
  
  return (
    <Card className="fade-in-up nl-card relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="absolute inset-0 nl-grid-bg opacity-[0.15] pointer-events-none" />
      
      <div className="p-6 relative z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground font-mono uppercase tracking-wider">Reporte</h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-wider border ${cb.color} flex items-center gap-1.5`}>
            <div className={`w-1.5 h-1.5 rounded-full bg-current ${result.confidence === 'alta' ? 'animate-pulse' : ''}`} />
            {cb.label}
          </span>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-6 items-center">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-md" />
            <div
              className="relative h-20 w-20 rounded-xl border border-white/20 shadow-glow z-10 flex items-center justify-center overflow-hidden nl-sweep"
              style={{ background: result.hex }}
              aria-label={`Color dominante ${result.hex}`}
            >
              <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]" />
            </div>
          </div>
          
          <div className="space-y-2 font-mono text-xs bg-black/40 p-3 rounded-lg border border-border/50 backdrop-blur-md">
            <div className="flex justify-between border-b border-border/50 pb-1">
              <span className="text-muted-foreground">HEX_VAL</span> 
              <code className="text-primary font-bold">{result.hex}</code>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1">
              <span className="text-muted-foreground">RGB_VEC</span> 
              <code className="text-foreground">{result.rgb.r}, {result.rgb.g}, {result.rgb.b}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">HSV_MAT</span> 
              <code className="text-foreground">{Math.round(result.hsv.h)}°, {(result.hsv.s * 100).toFixed(0)}%, {(result.hsv.v * 100).toFixed(0)}%</code>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
            <Atom className="w-12 h-12 text-primary nl-spin-slow" />
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/80 mb-1 flex items-center gap-2">
            <div className="w-1 h-1 bg-primary rounded-full" />
            Resonancia de Plasmón
          </div>
          <div className="text-4xl font-bold text-foreground font-display flex items-baseline gap-1 shadow-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
            {result.estimatedWavelength} <span className="text-lg text-primary/70 font-sans font-normal">nm</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed max-w-[85%]">
            Estimación inferida algorítmicamente basada en correlación espectral UV-Vis.
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-end justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Diámetro Nanométrico</span>
            <span className="text-lg font-bold text-primary font-display">{result.sizeRange.label}</span>
          </div>
          
          <div className="relative h-4 w-full rounded-full bg-black/60 border border-border/50 overflow-hidden backdrop-blur-md p-[2px]">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
            
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-primary/50 via-primary to-primary/50"
              style={{ left: `${(result.sizeRange.min / 100) * 100}%`, width: `${((result.sizeRange.max - result.sizeRange.min) / 100) * 100}%` }}
            >
              <div className="absolute inset-0 opacity-50 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[nlSweep_1s_linear_infinite]" />
            </div>
            <div 
              className="absolute top-0 h-full w-[2px] bg-white shadow-[0_0_8px_2px_var(--primary)]" 
              style={{ left: `calc(${gaugePct}% - 1px)` }} 
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-mono text-muted-foreground/70">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100nm</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">
            {result.sizeRange.description}
          </p>
        </div>

        {result.warnings.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            {result.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-foreground/90 font-mono backdrop-blur-sm">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-warning" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50 print:hidden">
          <Button onClick={onReset} variant="outline" className="flex-1 gap-2 h-10 text-xs font-mono tracking-wider border-border/50 hover:bg-white/5"><RefreshCw className="h-3.5 w-3.5" /> REINICIAR</Button>
          <Button onClick={onExport} className="flex-1 gap-2 h-10 text-xs font-mono tracking-wider bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"><FileDown className="h-3.5 w-3.5" /> EXPORTAR.PDF</Button>
        </div>
      </div>
    </Card>
  );
}

