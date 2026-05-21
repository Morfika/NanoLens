import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Camera, RefreshCw, FileDown, AlertTriangle, CheckCircle2, Info, Aperture, Activity, ScanLine, Atom, ZoomIn, ZoomOut, Hand, Crop } from "lucide-react";
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

  // Zoom & Pan states
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [tool, setTool] = useState<"crop" | "pan">("crop");

  // Interaction tracking refs
  const dragTypeRef = useRef<"draw" | "move" | "resize" | "pan" | null>(null);
  const resizeHandleRef = useRef<"tl" | "tr" | "bl" | "br" | null>(null);
  const startPointerRef = useRef<{ x: number; y: number } | null>(null);
  const startCropRef = useRef<CropRect | null>(null);
  const startPanRef = useRef<{ x: number; y: number } | null>(null);
  const startBaseRef = useRef<{ x: number; y: number } | null>(null);

  const onFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImgSrc(e.target?.result as string);
      setCrop(null);
      setResult(null);
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setTool("crop");
    };
    reader.readAsDataURL(file);
  }, []);

  // Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  // Zoom adjustments with bound checking and viewport relative pan clamping
  const adjustZoom = (factor: number | ((prev: number) => number)) => {
    setZoom((prev) => {
      let nextZoom = typeof factor === "function" ? factor(prev) : prev + factor;
      nextZoom = Math.max(1, Math.min(4, Math.round(nextZoom * 10) / 10)); // Clamp zoom between 1x and 4x
      
      if (nextZoom === 1) {
        setPanX(0);
        setPanY(0);
      } else if (overlayRef.current) {
        const rect = overlayRef.current.getBoundingClientRect();
        const minPanX = rect.width * (1 - nextZoom);
        const minPanY = rect.height * (1 - nextZoom);
        setPanX((px) => Math.max(minPanX, Math.min(0, px)));
        setPanY((py) => Math.max(minPanY, Math.min(0, py)));
      }
      return nextZoom;
    });
  };

  // Interactive drawing, moving, resizing and panning via unified PointerEvents
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!overlayRef.current || isScanning) return;
    const rect = overlayRef.current.getBoundingClientRect();
    
    // Viewport relative client coords
    const vx = e.clientX - rect.left;
    const vy = e.clientY - rect.top;
    
    // Convert to untransformed base container space
    const x = Math.max(0, Math.min(rect.width, (vx - panX) / zoom));
    const y = Math.max(0, Math.min(rect.height, (vy - panY) / zoom));

    const target = e.target as HTMLElement;
    const handle = target.getAttribute("data-handle") as "tl" | "tr" | "bl" | "br" | null;

    if (handle) {
      // 1. Resizing corner
      dragTypeRef.current = "resize";
      resizeHandleRef.current = handle;
      startPointerRef.current = { x: e.clientX, y: e.clientY };
      startCropRef.current = crop ? { ...crop } : null;
    } else if (crop && x >= crop.x && x <= crop.x + crop.w && y >= crop.y && y <= crop.y + crop.h) {
      // 2. Dragging/moving the entire crop box
      dragTypeRef.current = "move";
      startPointerRef.current = { x: e.clientX, y: e.clientY };
      startCropRef.current = { ...crop };
    } else if (tool === "pan" || e.button === 1 || e.shiftKey) {
      // 3. Panning the viewport (either with Hand tool, middle mouse click, or shift key)
      dragTypeRef.current = "pan";
      startPointerRef.current = { x: e.clientX, y: e.clientY };
      startPanRef.current = { x: panX, y: panY };
    } else {
      // 4. Drawing a new crop box
      dragTypeRef.current = "draw";
      startBaseRef.current = { x, y };
      setCrop({ x, y, w: 0, h: 0 });
    }
    
    target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragTypeRef.current || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    
    // Viewport relative client coords
    const vx = e.clientX - rect.left;
    const vy = e.clientY - rect.top;
    
    // Convert to untransformed base container space (with clamp)
    const x = Math.max(0, Math.min(rect.width, (vx - panX) / zoom));
    const y = Math.max(0, Math.min(rect.height, (vy - panY) / zoom));

    if (dragTypeRef.current === "draw" && startBaseRef.current) {
      const sx = startBaseRef.current.x;
      const sy = startBaseRef.current.y;
      setCrop({
        x: Math.min(sx, x),
        y: Math.min(sy, y),
        w: Math.abs(x - sx),
        h: Math.abs(y - sy)
      });
    } else if (dragTypeRef.current === "move" && startPointerRef.current && startCropRef.current) {
      const dxClient = e.clientX - startPointerRef.current.x;
      const dyClient = e.clientY - startPointerRef.current.y;
      
      // Convert client space delta to base space delta
      const dx = dxClient / zoom;
      const dy = dyClient / zoom;
      
      let newX = startCropRef.current.x + dx;
      let newY = startCropRef.current.y + dy;
      
      // Clamp crop box position inside image boundaries
      newX = Math.max(0, Math.min(rect.width - startCropRef.current.w, newX));
      newY = Math.max(0, Math.min(rect.height - startCropRef.current.h, newY));
      
      setCrop({
        ...startCropRef.current,
        x: newX,
        y: newY
      });
    } else if (dragTypeRef.current === "resize" && startPointerRef.current && startCropRef.current && resizeHandleRef.current) {
      const dx = (e.clientX - startPointerRef.current.x) / zoom;
      const dy = (e.clientY - startPointerRef.current.y) / zoom;
      const handle = resizeHandleRef.current;
      
      const sc = startCropRef.current;
      const minSize = 10; // Min crop box dimension

      if (handle === "tl") {
        const fixedX = sc.x + sc.w;
        const fixedY = sc.y + sc.h;
        const newX = Math.max(0, Math.min(fixedX - minSize, sc.x + dx));
        const newY = Math.max(0, Math.min(fixedY - minSize, sc.y + dy));
        setCrop({ x: newX, y: newY, w: fixedX - newX, h: fixedY - newY });
      } else if (handle === "tr") {
        const fixedX = sc.x;
        const fixedY = sc.y + sc.h;
        const newRight = Math.max(fixedX + minSize, Math.min(rect.width, sc.x + sc.w + dx));
        const newY = Math.max(0, Math.min(fixedY - minSize, sc.y + dy));
        setCrop({ x: fixedX, y: newY, w: newRight - fixedX, h: fixedY - newY });
      } else if (handle === "bl") {
        const fixedX = sc.x + sc.w;
        const fixedY = sc.y;
        const newX = Math.max(0, Math.min(fixedX - minSize, sc.x + dx));
        const newBottom = Math.max(fixedY + minSize, Math.min(rect.height, sc.y + sc.h + dy));
        setCrop({ x: newX, y: fixedY, w: fixedX - newX, h: newBottom - fixedY });
      } else if (handle === "br") {
        const fixedX = sc.x;
        const fixedY = sc.y;
        const newRight = Math.max(fixedX + minSize, Math.min(rect.width, sc.x + sc.w + dx));
        const newBottom = Math.max(fixedY + minSize, Math.min(rect.height, sc.y + sc.h + dy));
        setCrop({ x: fixedX, y: fixedY, w: newRight - fixedX, h: newBottom - fixedY });
      }
    } else if (dragTypeRef.current === "pan" && startPointerRef.current && startPanRef.current) {
      const dx = e.clientX - startPointerRef.current.x;
      const dy = e.clientY - startPointerRef.current.y;
      
      let newPanX = startPanRef.current.x + dx;
      let newPanY = startPanRef.current.y + dy;
      
      // Clamp pan coordinate boundaries to keep image in viewport
      const minPanX = rect.width * (1 - zoom);
      const minPanY = rect.height * (1 - zoom);
      newPanX = Math.max(minPanX, Math.min(0, newPanX));
      newPanY = Math.max(minPanY, Math.min(0, newPanY));
      
      setPanX(newPanX);
      setPanY(newPanY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    (e.target as Element).releasePointerCapture(e.pointerId);
    dragTypeRef.current = null;
    resizeHandleRef.current = null;
    startPointerRef.current = null;
    startCropRef.current = null;
    startPanRef.current = null;
    startBaseRef.current = null;
  };

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

  const reset = () => {
    setImgSrc(null);
    setCrop(null);
    setResult(null);
    setIsScanning(false);
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setTool("crop");
  };

  const exportPDF = () => window.print();

  useEffect(() => {
    if (result) {
      requestAnimationFrame(() => {
        document.getElementById("results-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [result]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8 sm:py-16 relative overflow-x-hidden">
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
              {/* Premium Workspace Control Toolbar */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-secondary/30 backdrop-blur-md p-2 rounded-xl border border-border/50">
                <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-lg border border-border/30">
                  <Button
                    size="sm"
                    variant={tool === "crop" ? "default" : "ghost"}
                    onClick={() => setTool("crop")}
                    className={`h-8 px-2.5 text-xs gap-1.5 transition-all ${
                      tool === "crop" 
                        ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Herramienta de Selección (Recorte)"
                  >
                    <Crop className="h-3.5 w-3.5" /> Selección
                  </Button>
                  <Button
                    size="sm"
                    variant={tool === "pan" ? "default" : "ghost"}
                    onClick={() => setTool("pan")}
                    className={`h-8 px-2.5 text-xs gap-1.5 transition-all ${
                      tool === "pan" 
                        ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Herramienta de Mano (Desplazar lienzo)"
                  >
                    <Hand className="h-3.5 w-3.5" /> Mano
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg border border-border/30">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => adjustZoom(-0.2)}
                      disabled={zoom <= 1}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
                      title="Alejar Zoom"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </Button>
                    
                    <span className="text-xs font-mono font-bold w-12 text-center text-foreground select-none">
                      {Math.round(zoom * 100)}%
                    </span>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => adjustZoom(0.2)}
                      disabled={zoom >= 4}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
                      title="Acercar Zoom"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}
                    disabled={zoom === 1 && panX === 0 && panY === 0}
                    className="h-8 text-xs border-border/50 bg-background/50 hover:bg-background disabled:opacity-40 transition-all"
                    title="Restablecer escala 1:1"
                  >
                    1:1
                  </Button>
                </div>
              </div>

              {/* Viewport Viewport (overlayRef) */}
              <div
                ref={overlayRef}
                className={`relative w-full select-none overflow-hidden rounded-xl border border-primary/20 bg-black touch-none shadow-inner transition-all duration-300 ${
                  tool === "pan" 
                    ? "cursor-grab active:cursor-grabbing" 
                    : "cursor-crosshair"
                }`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {/* Inner transformed container containing image and crop handles */}
                <div
                  style={{
                    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                    transformOrigin: "0 0",
                    width: "100%",
                    position: "relative"
                  }}
                  className="transition-transform duration-75 ease-out"
                >
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <img 
                    ref={imgRef} 
                    src={imgSrc} 
                    className="block h-auto w-full opacity-90 transition-opacity" 
                    draggable={false} 
                    alt="Muestra cargada" 
                  />
                  
                  {crop && crop.w > 0 && crop.h > 0 && (
                    <div
                      className="absolute border border-primary bg-primary/20 backdrop-blur-[1px] nl-sweep"
                      style={{ 
                        left: crop.x, 
                        top: crop.y, 
                        width: crop.w, 
                        height: crop.h,
                        borderWidth: `${1 / zoom}px` 
                      }}
                    >
                      {/* Interactive Drag Handles - adaptively scaled based on zoom level */}
                      <div
                        data-handle="tl"
                        className="absolute bg-primary border border-background rounded-full hover:scale-125 transition-transform cursor-nwse-resize"
                        style={{
                          left: 0,
                          top: 0,
                          width: `${12 / zoom}px`,
                          height: `${12 / zoom}px`,
                          transform: `translate(-50%, -50%)`,
                          borderWidth: `${1 / zoom}px`
                        }}
                        title="Arrastrar esquina superior izquierda"
                      />
                      <div
                        data-handle="tr"
                        className="absolute bg-primary border border-background rounded-full hover:scale-125 transition-transform cursor-nesw-resize"
                        style={{
                          right: 0,
                          top: 0,
                          width: `${12 / zoom}px`,
                          height: `${12 / zoom}px`,
                          transform: `translate(50%, -50%)`,
                          borderWidth: `${1 / zoom}px`
                        }}
                        title="Arrastrar esquina superior derecha"
                      />
                      <div
                        data-handle="bl"
                        className="absolute bg-primary border border-background rounded-full hover:scale-125 transition-transform cursor-nesw-resize"
                        style={{
                          left: 0,
                          bottom: 0,
                          width: `${12 / zoom}px`,
                          height: `${12 / zoom}px`,
                          transform: `translate(-50%, 50%)`,
                          borderWidth: `${1 / zoom}px`
                        }}
                        title="Arrastrar esquina inferior izquierda"
                      />
                      <div
                        data-handle="br"
                        className="absolute bg-primary border border-background rounded-full hover:scale-125 transition-transform cursor-nwse-resize"
                        style={{
                          right: 0,
                          bottom: 0,
                          width: `${12 / zoom}px`,
                          height: `${12 / zoom}px`,
                          transform: `translate(50%, 50%)`,
                          borderWidth: `${1 / zoom}px`
                        }}
                        title="Arrastrar esquina inferior derecha"
                      />

                      {/* Precise corner markers */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary pointer-events-none" style={{ borderWidth: `${2 / zoom}px` }} />
                      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary pointer-events-none" style={{ borderWidth: `${2 / zoom}px` }} />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary pointer-events-none" style={{ borderWidth: `${2 / zoom}px` }} />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary pointer-events-none" style={{ borderWidth: `${2 / zoom}px` }} />
                    </div>
                  )}
                </div>
                
                {/* Fixed Overlay Scan Line (stays steady as canvas zooms/pans behind it) */}
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
  // Use precise spline diameter if available, fallback to midpoint of range
  const displayDiameter = result.estimatedDiameter || (result.sizeRange.min + result.sizeRange.max) / 2;
  const gaugePct = Math.min(100, Math.max(0, (displayDiameter / 100) * 100));
  
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

        {/* 2-Column Telemetry Grid: Wavelength vs Cubic Spline Diameter */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Plasmon Resonance */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-15 group-hover:opacity-60 transition-opacity">
              <Atom className="w-10 h-10 text-primary nl-spin-slow" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/80 mb-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              Resonancia de Plasmón
            </div>
            <div className="text-3xl font-bold text-foreground font-display flex items-baseline gap-1 shadow-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              {result.estimatedWavelength} <span className="text-sm text-primary/70 font-sans font-normal">nm</span>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
              Estimación inferida por correlación espectral UV-Vis.
            </div>
          </div>

          {/* Spline Cubic Diameter */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-15 group-hover:opacity-60 transition-opacity">
              <Activity className="w-10 h-10 text-primary nl-pulse" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/80 mb-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              Diámetro por Spline
            </div>
            <div className="text-3xl font-bold text-foreground font-display flex items-baseline gap-1 shadow-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              {result.estimatedDiameter > 0 ? result.estimatedDiameter.toFixed(1) : "—"} <span className="text-sm text-primary/70 font-sans font-normal">nm</span>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
              Búsqueda inversa de alta precisión en la curva spline calibrada.
            </div>
          </div>
        </div>

        {/* Colorimetry Spline Match Comparison */}
        {result.estimatedDiameter > 0 && (
          <div className="bg-black/30 border border-border/40 p-4 rounded-xl space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
              <span>Comparación de Ajuste Spline Cúbico</span>
              <span className="font-bold text-foreground font-sans">Métrico error</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Real Measured Color */}
              <div className="flex flex-col items-center gap-2 bg-secondary/15 p-2.5 rounded-lg border border-border/15">
                <div 
                  className="w-full h-10 rounded-md border border-white/10 shadow-inner relative overflow-hidden" 
                  style={{ background: result.hex }}
                >
                  <div className="absolute inset-0 shadow-[inset_0_0_8px_rgba(0,0,0,0.4)]" />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase">Color Medido</span>
                <span className="text-[11px] font-bold text-foreground font-mono">{result.hex}</span>
              </div>

              {/* Reconstructed Spline Color */}
              <div className="flex flex-col items-center gap-2 bg-secondary/15 p-2.5 rounded-lg border border-border/15">
                <div 
                  className="w-full h-10 rounded-md border border-white/10 shadow-inner relative overflow-hidden" 
                  style={{ background: result.splineHex }}
                >
                  <div className="absolute inset-0 shadow-[inset_0_0_8px_rgba(0,0,0,0.4)]" />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase">Color Spline</span>
                <span className="text-[11px] font-bold text-foreground font-mono">{result.splineHex}</span>
              </div>
            </div>
            
            <div className="text-[10px] text-center font-mono">
              {result.splineDistance < 15 ? (
                <span className="text-emerald-400 flex items-center justify-center gap-1 bg-emerald-500/10 py-1 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Ajuste del modelo: Excelente (Err: {result.splineDistance.toFixed(1)})
                </span>
              ) : result.splineDistance < 35 ? (
                <span className="text-amber-400 flex items-center justify-center gap-1 bg-amber-500/10 py-1 rounded-md border border-amber-500/20">
                  <Info className="h-3.5 w-3.5" /> Ajuste del modelo: Aceptable (Err: {result.splineDistance.toFixed(1)})
                </span>
              ) : (
                <span className="text-rose-400 flex items-center justify-center gap-1 bg-rose-500/10 py-1 rounded-md border border-rose-500/20 animate-pulse">
                  <AlertTriangle className="h-3.5 w-3.5" /> Desviación alta del calibrador (Err: {result.splineDistance.toFixed(1)})
                </span>
              )}
            </div>
          </div>
        )}

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

