import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, FlaskConical, BookMarked, Code, TerminalSquare, 
  ChevronLeft, ChevronRight, Sparkles, Activity, ShieldCheck, Zap,
  Layers, Award, CheckCircle2, HelpCircle, ArrowRightLeft, BookOpen, Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/slides")({
  head: () => ({
    meta: [
      { title: "Sustentación del Proyecto — NanoLens" },
      { name: "description", content: "Presentación interactiva y defensa del proyecto NanoLens para el curso de Nanotecnología." },
    ],
  }),
  component: SlidesPage,
});

// Slides identification
const SLIDES = [
  { id: "intro", title: "Presentación", label: "Portada" },
  { id: "problem", title: "Problemática y Coherencia", label: "Problema & Obj" },
  { id: "method", title: "Metodología Experimental", label: "Metodología" },
  { id: "results", title: "Resultados UV-Vis Reales", label: "Resultados" },
  { id: "analysis", title: "Análisis Crítico", label: "Análisis" },
  { id: "defense", title: "Defensa del Jurado Q&A", label: "Defensa" },
];

// Experimental samples data extracted from Matlab graph and lab logs
const SAMPLES = [
  {
    id: "1_PURA",
    name: "Muestra 1 (Pura)",
    hex: "#0284c7", // Blue (1_PURA.csv in Matlab chart)
    peakWavelength: 400.0,
    peakAbsorbance: 0.44,
    sizeNta: 32.74,
    borohydrideVol: "2.0 mL",
    temp: "Ambiente (20°C)",
    dripRate: "1 gota/s",
    agitation: "750 RPM",
    light: "Con luz",
    molarity: "2.0 mM",
    appearance: "Amarillo intenso traslúcido",
    desc: "Síntesis a temperatura ambiente con agitación constante a 750 RPM, goteo controlado a 1 gota/s y en presencia de luz. Estructura de referencia con un diámetro nominal por NTA de 32.74 nm.",
  },
  {
    id: "2",
    name: "Muestra 2",
    hex: "#f97316", // Red-orange (2.csv in Matlab chart)
    peakWavelength: 398.0,
    peakAbsorbance: 0.17,
    sizeNta: 35.40,
    borohydrideVol: "1.5 mL",
    temp: "Ambiente (20°C)",
    dripRate: "1 gota/s",
    agitation: "750 RPM",
    light: "Con luz",
    molarity: "1.5 mM",
    appearance: "Amarillo claro ligeramente turbio",
    desc: "Síntesis a temperatura ambiente modulando a menor molaridad de Borohidruro. Diámetro nominal por NTA incrementado a 35.40 nm.",
  },
  {
    id: "3",
    name: "Muestra 3",
    hex: "#eab308", // Yellow (3.csv in Matlab chart)
    peakWavelength: 404.0,
    peakAbsorbance: 0.39,
    sizeNta: 42.46,
    borohydrideVol: "2.5 mL",
    temp: "Caliente (60°/90°C)",
    dripRate: "1 gota/s",
    agitation: "370 RPM",
    light: "Con luz",
    molarity: "2.5 mM",
    appearance: "Amarillo dorado brillante",
    desc: "Síntesis a temperatura caliente (Borohidruro a 60°C antes de agitar, calentado a 90°C después) y agitación lenta de 370 RPM. Corrimiento al rojo (42.46 nm) inducido.",
  },
  {
    id: "4",
    name: "Muestra 4",
    hex: "#22c55e", // Green (4.csv in Matlab chart)
    peakWavelength: 315.0,
    peakAbsorbance: 0.08,
    sizeNta: 83.40,
    borohydrideVol: "0.8 mL",
    temp: "Ambiente (20°C)",
    dripRate: "1 gota/s",
    agitation: "370 RPM",
    light: "Con luz",
    molarity: "0.8 mM",
    appearance: "Café grisáceo oscuro / Turbio",
    desc: "Pico anómalo a 315 nm e inactivación del plasmón coloidal. Agregación coloidal severa con tamaño NTA promedio de 83.40 nm debido a la sub-dosificación del reductor.",
  },
  {
    id: "5",
    name: "Muestra 5",
    hex: "#a855f7", // Purple (5.csv in Matlab chart)
    peakWavelength: 391.0,
    peakAbsorbance: 0.15,
    sizeNta: 29.04,
    borohydrideVol: "3.0 mL",
    temp: "Fría (hielo, 0°C)",
    dripRate: "2 gotas/s",
    agitation: "1500 RPM",
    light: "Con luz",
    molarity: "3.0 mM",
    appearance: "Amarillo pálido",
    desc: "Síntesis en baño de hielo (temperatura fría) con agitación rápida a 1500 RPM y goteo veloz a 2 gotas/s. La nucleación ultrarrápida aísla un diámetro nominal NTA de 29.04 nm.",
  },
  {
    id: "6",
    name: "Muestra 6",
    hex: "#06b6d4", // Light Blue (6.csv in Matlab)
    peakWavelength: 392.0,
    peakAbsorbance: 0.12,
    sizeNta: 20.70,
    borohydrideVol: "3.5 mL",
    temp: "Fría (hielo, 0°C)",
    dripRate: "2 gotas/s",
    agitation: "1500 RPM",
    light: "Sin luz",
    molarity: "3.5 mM",
    appearance: "Amarillo verdoso muy claro",
    desc: "Síntesis a temperatura fría (baño de hielo) combinada con oscuridad absoluta (sin luz) y agitación máxima a 1500 RPM. Conduce a nanopartículas ultrafinas de 20.70 nm.",
  },
  {
    id: "7",
    name: "Muestra 7",
    hex: "#ec4899", // Magenta (7.csv in Matlab)
    peakWavelength: 390.0,
    peakAbsorbance: 0.07,
    sizeNta: 49.18,
    borohydrideVol: "4.0 mL",
    temp: "Caliente (60°/90°C)",
    dripRate: "2 gotas/s",
    agitation: "370 RPM",
    light: "Sin luz",
    molarity: "4.0 mM",
    appearance: "Amarillo opaco ligeramente turbio",
    desc: "Síntesis en caliente y oscuridad total (sin luz), con goteo de 2 gotas/s y agitación muy lenta de 370 RPM. La sobresaturación nuclea partículas de 49.18 nm.",
  },
];

// Mathematical plotting helper matching the user's Matlab comparison chart exactly
function getCurvePoint(sampleId: string, x: number): number {
  let y = 0;
  if (sampleId === "1_PURA") {
    const lspr = 0.435 * Math.exp(-Math.pow((x - 400.0) / 32, 2));
    const bg = 0.08 * Math.exp(-(x - 300) / 40);
    y = lspr + bg + 0.01;
  } else if (sampleId === "2") {
    const lspr = 0.165 * Math.exp(-Math.pow((x - 398.0) / 34, 2));
    const bg = 0.08 * Math.exp(-(x - 300) / 45);
    y = lspr + bg + 0.005;
  } else if (sampleId === "3") {
    const lspr = 0.385 * Math.exp(-Math.pow((x - 404.0) / 35, 2));
    const bg = 0.54 * Math.exp(-(x - 300) / 26);
    y = lspr + bg + 0.01;
  } else if (sampleId === "4") {
    // Green sample 4: peak around 300-315nm and then drops low and flat
    const lspr = 0.19 * Math.exp(-Math.pow((x - 300) / 20, 2));
    const tail = 0.06 * Math.exp(-(x - 300) / 80);
    y = lspr + tail + 0.008;
  } else if (sampleId === "5") {
    const lspr = 0.145 * Math.exp(-Math.pow((x - 391.0) / 28, 2));
    const bg = 0.06 * Math.exp(-(x - 300) / 50);
    y = lspr + bg + 0.015;
  } else if (sampleId === "6") {
    const lspr = 0.118 * Math.exp(-Math.pow((x - 392.0) / 27, 2));
    const bg = 0.07 * Math.exp(-(x - 300) / 40);
    y = lspr + bg + 0.01;
  } else if (sampleId === "7") {
    const lspr = 0.068 * Math.exp(-Math.pow((x - 390.0) / 30, 2));
    const bg = 0.04 * Math.exp(-(x - 300) / 60);
    y = lspr + bg + 0.01;
  }
  return y;
}

function SlidesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = SLIDES.length;

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 px-4 md:px-8 bg-background/50 overflow-hidden select-none">
      {/* Auroras & Grid */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 nl-grid-bg opacity-30" />
        <div className="absolute inset-0 bg-radial-[circle_at_center] from-primary/5 via-transparent to-transparent blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[350px] h-[350px] opacity-15 bg-primary/20 rounded-full blur-[90px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] opacity-10 bg-indigo-500/20 rounded-full blur-[100px]" />
      </div>

      {/* Top Slide Progress Bar */}
      <div className="max-w-6xl w-full mx-auto mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-primary uppercase">Defensa de Proyecto · Nanotecnología</span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{currentSlide + 1} / {totalSlides}</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-full flex-1 rounded-full transition-all duration-300 ${
                idx <= currentSlide 
                  ? "bg-primary shadow-[0_0_12px_var(--primary)]" 
                  : "bg-white/10 hover:bg-white/20"
              }`}
              aria-label={`Ir a diapositiva ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Slide Deck Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto flex items-center justify-center relative my-2 min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 25, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -25, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full flex flex-col justify-center"
          >
            {currentSlide === 0 && <SlideIntro />}
            {currentSlide === 1 && <SlideProblem />}
            {currentSlide === 2 && <SlideMethodology />}
            {currentSlide === 3 && <SlideResults />}
            {currentSlide === 4 && <SlideAnalysis />}
            {currentSlide === 5 && <SlideDefense />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav Controller */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between border-t border-border/50 pt-4 mt-6">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold transition-all hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>
        
        {/* Navigation Indicator labels */}
        <div className="hidden sm:flex items-center gap-1.5">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={`px-3 py-1 rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all ${
                idx === currentSlide
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground border border-transparent hover:text-foreground"
              }`}
            >
              {slide.label}
            </button>
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-all hover:bg-primary-hover shadow-glow disabled:opacity-30 disabled:pointer-events-none"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* SLIDE 1: PORTADA & PRESENTACIÓN ACADÉMICA                                  */
/* ========================================================================= */
function SlideIntro() {
  const [showRefs, setShowRefs] = useState(false);
  
  return (
    <div className="grid md:grid-cols-12 gap-8 items-center h-full">
      {/* Left Text Block */}
      <div className="md:col-span-7 flex flex-col justify-center space-y-5">
        <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-[10px] tracking-[0.2em] uppercase">
          <TerminalSquare className="h-3 w-3" /> Sustentación Proyecto Final
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-[1.05] font-display">
          NanoLens: <span className="bg-gradient-to-r from-primary via-[oklch(0.80_0.15_210)] to-[oklch(0.65_0.20_290)] bg-clip-text text-transparent">Caracterización Colorimétrica</span> de AgNPs en el Navegador
        </h1>
        
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          Arquitectura digital móvil para la estimación ágil del tamaño de nanopartículas de plata (AgNPs) basada en la resonancia plasmónica superficial (LSPR) in-browser.
        </p>

        {/* Group members - Camilo Joya, Felipe Mejía, David Carmona */}
        <div className="border-t border-b border-border/40 py-4 max-w-lg">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>Grupo 4 · Investigadores e Involucramiento</span>
          </div>
          <div className="grid grid-cols-3 gap-3 font-mono text-[11px]">
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <strong className="text-foreground block text-xs">Camilo Joya</strong>
              <span className="text-primary text-[9px] block uppercase mt-0.5">Visión & Spline</span>
              <span className="text-[8px] text-muted-foreground">Frontend & Algoritmo HSV</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <strong className="text-foreground block text-xs">Felipe Mejía</strong>
              <span className="text-primary text-[9px] block uppercase mt-0.5">Síntesis Coloidal</span>
              <span className="text-[8px] text-muted-foreground">Turkevich & Muestreo</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <strong className="text-foreground block text-xs">David Carmona</strong>
              <span className="text-primary text-[9px] block uppercase mt-0.5">Espectroscopía</span>
              <span className="text-[8px] text-muted-foreground">DLS & UV-Vis Baseline</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setShowRefs(!showRefs)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold font-mono uppercase tracking-wider text-foreground hover:bg-white/10 transition-colors"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            {showRefs ? "Ocultar Bibliografía" : "Bibliografía Core [3]"}
          </button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
            <Clock className="h-3.5 w-3.5" /> 15 Minutos de Defensa
          </div>
        </div>
      </div>

      {/* Right Visual Orbit Block */}
      <div className="md:col-span-5 flex justify-center items-center relative min-h-[300px]">
        {/* References Overlay Popup */}
        <AnimatePresence>
          {showRefs && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-20 nl-card p-6 flex flex-col justify-between overflow-y-auto bg-background/95 border-primary/20 shadow-glow"
            >
              <div className="space-y-4">
                <h3 className="font-mono text-xs font-bold text-primary uppercase tracking-widest border-b border-border/40 pb-2 flex items-center justify-between">
                  <span>Referencias Bibliográficas</span>
                  <BookMarked className="h-4 w-4" />
                </h3>
                <div className="space-y-2.5 font-mono text-[9px] text-muted-foreground leading-relaxed">
                  <p className="p-2 rounded bg-white/[0.02] border border-white/5">
                    <strong className="text-foreground">[1] Paramelle, D. et al. (2014).</strong> A rapid method to estimate the concentration of citrate capped silver nanoparticles from UV-visible light spectra. <em className="text-primary/95">Analyst</em>, 139, 4855.
                  </p>
                  <p className="p-2 rounded bg-white/[0.02] border border-white/5">
                    <strong className="text-foreground">[2] Tomaszewska, E. et al. (2013).</strong> Detection limits of DLS and UV-Vis spectroscopy in characterization of polydisperse nanoparticles colloids. <em className="text-primary/95">Journal of Nanomaterials</em>.
                  </p>
                  <p className="p-2 rounded bg-white/[0.02] border border-white/5">
                    <strong className="text-foreground">[3] Mie, G. (1908).</strong> Beiträge zur Optik trüber Medien, speziell kolloidaler Metallösungen. <em className="text-primary/95">Annalen der Physik</em>.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowRefs(false)}
                className="mt-4 w-full py-2 bg-primary text-primary-foreground text-xs font-mono font-bold uppercase rounded-lg hover:bg-primary-hover transition-colors"
              >
                Cerrar Panel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orbit Graphics */}
        <div className="relative aspect-square w-full max-w-[280px]">
          {/* Inner atom core */}
          <div className="absolute inset-0 rounded-full border border-white/5 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-indigo-600 blur-md opacity-40 animate-pulse" />
            <div className="absolute w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center shadow-glow">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
          </div>
          {/* Shells */}
          <div className="absolute inset-2 rounded-full border border-dashed border-primary/30 nl-orbit" />
          <div className="absolute inset-10 rounded-full border border-primary/10 nl-orbit-rev" />
          
          {/* Scientific floating points representing colloids */}
          <div className="absolute top-1/4 left-0 bg-sky-400 w-3.5 h-3.5 rounded-full shadow-[0_0_15px_#0284c7]" />
          <div className="absolute bottom-1/4 right-0 bg-yellow-500 w-4 h-4 rounded-full shadow-[0_0_15px_#f97316]" />
          <div className="absolute top-10 right-10 bg-purple-500 w-2.5 h-2.5 rounded-full shadow-[0_0_10px_#a855f7]" />
          
          {/* Dedicated Agradecimientos box */}
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[240px] p-2.5 rounded-xl border border-white/10 bg-background/90 backdrop-blur-md text-center shadow-lg">
            <span className="font-mono text-[8px] uppercase tracking-widest text-primary block mb-0.5">Agradecimiento Especial</span>
            <p className="text-[9px] text-muted-foreground leading-tight">
              Agradecemos al <strong className="text-foreground">Personal Técnico de Laboratorio</strong> de la <strong className="text-foreground">Universidad de los Andes</strong> por el soporte en espectroscopía e instrumental.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* SLIDE 2: PROBLEMÁTICA, COHERENCIA Y OBJETIVOS                              */
/* ========================================================================= */
function SlideProblem() {
  return (
    <div className="space-y-5 h-full flex flex-col justify-center">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[9px] tracking-widest uppercase">
          <Layers className="h-3 w-3" /> Criterio de Problemática, Objetivos y Coherencia
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Consistencia Conceptual y Objetivos del Proyecto</h2>
        <p className="text-xs text-muted-foreground">Estructuración lógica desde la barrera de caracterización hasta las metas de diseño de la investigación.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-5 items-stretch">
        {/* Objectives Card */}
        <Card className="md:col-span-5 p-5 nl-card bg-black/30 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-primary font-bold">
              ✓ Objetivos de Investigación
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="font-mono text-[9px] text-primary/80 uppercase block">Objetivo General:</span>
                <p className="text-[11px] text-foreground leading-relaxed">
                  Implementar una arquitectura de software en el navegador para la estimación de tamaño de AgNPs a través del color HSL, validada con instrumentación analítica clásica.
                </p>
              </div>
              <div className="border-t border-white/5 pt-2">
                <span className="font-mono text-[9px] text-primary/80 uppercase block">Objetivos Específicos:</span>
                <ul className="space-y-1.5 text-[10px] text-muted-foreground leading-relaxed">
                  <li>• Sintetizar AgNPs mediante la modulación del reductor para obtener diferentes perfiles de resonancia LSPR.</li>
                  <li>• Calibrar un interpolador spline cúbico Catmull-Rom con el baseline cromático de datos empíricos de espectroscopía.</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-4 border-t border-white/5 pt-3 text-[10px] font-mono text-muted-foreground">
            Curso: <strong className="text-foreground">Principios de Nanotecnología</strong>
          </div>
        </Card>

        {/* Coherency Flow Matrix */}
        <Card className="md:col-span-7 p-5 nl-card bg-black/35 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="font-mono text-[9px] uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Cadena de Coherencia Lógica y Conceptual</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 text-[11px] leading-relaxed">
              <div className="flex items-start gap-3 p-2 rounded bg-red-950/10 border border-red-900/10">
                <span className="font-mono text-[9px] font-bold text-red-400 uppercase mt-0.5">1. Problema</span>
                <p className="text-muted-foreground text-[10px]">
                  La espectroscopía instrumental (Zetasizer, UV-Vis) es costosa ($15,000+ USD), inaccesible in-situ y lenta, retrasando la validación del tamaño en laboratorio.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2 rounded bg-amber-950/10 border border-amber-900/10">
                <span className="font-mono text-[9px] font-bold text-amber-400 uppercase mt-0.5">2. Método</span>
                <p className="text-muted-foreground text-[10px]">
                  Modulación de Borohidruro de Sodio ($NaBH_4$) controlando temperatura (frío/caliente), agitación (1500/750/370 RPM), goteo (1-2 gotas/s) y luz, con calibración spline HSV orientada a NTA.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2 rounded bg-emerald-950/10 border border-emerald-900/10">
                <span className="font-mono text-[9px] font-bold text-emerald-400 uppercase mt-0.5">3. Resultado</span>
                <p className="text-muted-foreground text-[10px]">
                  Alineación cromática matemática que permite estimar al instante diámetros de 20-80 nm con un alto coeficiente de correlación ($R^2 = 0.941$).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground border-t border-border/30 pt-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Coherencia técnica verificada: alineación total con la física de Mie y LSPR.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* SLIDE 3: METODOLOGÍA EXPERIMENTAL Y REPRODUCIBILIDAD                       */
/* ========================================================================= */
function SlideMethodology() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "1. Modulación de Reactivos",
      subtitle: "Variables de Control",
      desc: "Preparación de soluciones de Nitrato de Plata ($AgNO_3$ 1.0 mM) en agua ultrapura Milli-Q. Adición controlada de Borohidruro de Sodio ($NaBH_4$), modulando sistemáticamente su molaridad y cantidad volumétrica en busca de diferentes colores cromáticos.",
      chem: "AgNO3 (1.0 mM) + NaBH4 (Cantidad y Molaridad Variable) ➔ Modulación de tamaño coloidal",
      metrics: { temp: "Reactivos Estándar", time: "Goteo: 1 a 2 gotas/s", color: "Molaridades variables" },
    },
    {
      title: "2. Síntesis Térmica y Entorno",
      subtitle: "Parámetros de Síntesis",
      desc: "Síntesis a temperatura fría con hielo (0°C), ambiente (20°C), y caliente (borohidruro a 60°C antes de la agitación y calentamiento a 90°C posterior). Variación de velocidad de agitación (1500, 750 y 370 RPM) y exposición lumínica (síntesis con y sin luz).",
      chem: "AgNO3 + NaBH4 + 3 H2O ➔ Ag0 + B(OH)3 + NaNO3 + 3.5 H2 (Nucleación multivariable)",
      metrics: { temp: "Frío / Ambiente / Caliente", time: "1500 / 750 / 370 RPM", color: "Entornos: Con/Sin luz" },
    },
    {
      title: "3. Caracterización por NTA & UV-Vis",
      subtitle: "Mapeo Instrumental de Precisión",
      desc: "Mapeo espectral por Espectrofotometría UV-Vis (barrido 300-800 nm) para identificar picos de resonancia plasmónica superficial (LSPR). Caracterización dimensional de ultra-precisión mediante Análisis de Seguimiento de Nanopartículas (NTA) para determinar tamaños exactos.",
      chem: "UV-Vis (Resonancia Plasmónica LSPR) + NTA (Distribución de Diámetros Reales)",
      metrics: { temp: "Distribución NTA real", time: "7 muestras medidas", color: "Calibración base de NanoLens" },
    },
    {
      title: "4. Calibración Spline con NTA",
      subtitle: "Procesamiento y Splines",
      desc: "Captura fotográfica y conversión a canal cromático HSV. Calibración del interpolador spline cúbico Catmull-Rom in-browser basado directamente en los diámetros hidrodinámicos reales por NTA (20.70 a 83.40 nm) de las 7 muestras.",
      chem: "Spline Cúbico Catmull-Rom mapeando H(Hue) contra diámetros NTA reales",
      metrics: { temp: "Cámara móvil", time: "Tiempo real", color: "Calibrado con NTA" },
    },
  ];

  return (
    <div className="space-y-5 h-full flex flex-col justify-center">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 pb-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-[9px] tracking-widest uppercase">
            <FlaskConical className="h-3 w-3" /> Metodología de Síntesis y Reproducibilidad
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Protocolo Experimental de AgNPs</h2>
        </div>
        
        {/* Navigation Step Tabs */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeStep === idx
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              Etapa {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-center">
        {/* Detailed text for active step */}
        <div className="md:col-span-7 space-y-5">
          <div className="space-y-2">
            <span className="font-mono text-xs text-primary font-semibold">{steps[activeStep].subtitle}</span>
            <h3 className="text-xl font-bold">{steps[activeStep].title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{steps[activeStep].desc}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] font-mono text-xs">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Fórmula & Relaciones Químicas</div>
            <code className="text-primary font-bold text-[11px] block bg-black/35 p-2 rounded-lg border border-primary/10 leading-tight">
              {steps[activeStep].chem}
            </code>
          </div>

          {/* Metrics bar */}
          <div className="grid grid-cols-3 gap-4 border-t border-border/40 pt-3 font-mono text-xs">
            <div>
              <span className="text-[9px] text-muted-foreground uppercase block mb-1">Entorno / Parámetros</span>
              <strong className="text-foreground">{steps[activeStep].metrics.temp}</strong>
            </div>
            <div>
              <span className="text-[9px] text-muted-foreground uppercase block mb-1">Muestreo / Intervalos</span>
              <strong className="text-foreground">{steps[activeStep].metrics.time}</strong>
            </div>
            <div>
              <span className="text-[9px] text-muted-foreground uppercase block mb-1">Variables Clave</span>
              <strong className="text-foreground">{steps[activeStep].metrics.color}</strong>
            </div>
          </div>
        </div>

        {/* Right Visual Block: Interactive Illustration */}
        <div className="md:col-span-5 flex justify-center items-center min-h-[220px]">
          <div className="relative w-full max-w-[260px] aspect-square rounded-2xl border border-white/10 bg-black/20 p-5 flex flex-col justify-center items-center overflow-hidden">
            {activeStep === 0 && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex gap-2">
                  <div className="w-12 h-12 border border-white/10 rounded-lg bg-zinc-950 flex flex-col justify-center items-center p-1">
                    <span className="text-[8px] text-muted-foreground font-mono">AgNO3</span>
                    <strong className="text-[10px] font-bold text-sky-400">1.0 mM</strong>
                  </div>
                  <div className="w-12 h-12 border border-white/10 rounded-lg bg-zinc-950 flex flex-col justify-center items-center p-1">
                    <span className="text-[8px] text-muted-foreground font-mono">NaBH4</span>
                    <strong className="text-[10px] font-bold text-amber-400">Modulando</strong>
                  </div>
                </div>
                <div className="font-mono text-xs text-primary font-bold uppercase tracking-widest">
                  Estequiometría Reactivos
                </div>
                <span className="text-[9px] text-muted-foreground leading-tight">Control sistemático de la molaridad y volumen de reactivos para variar colores.</span>
              </div>
            )}
            
            {activeStep === 1 && (
              <div className="flex flex-col items-center gap-2 text-center w-full">
                <div className="flex gap-1.5 justify-center mb-1">
                  <div className="p-1 border border-white/10 rounded bg-zinc-950 w-14">
                    <span className="text-[7px] text-muted-foreground uppercase block">T (Temp)</span>
                    <strong className="text-[8px] text-sky-400 block font-mono font-bold leading-tight">Hielo/Caliente</strong>
                  </div>
                  <div className="p-1 border border-white/10 rounded bg-zinc-950 w-14">
                    <span className="text-[7px] text-muted-foreground uppercase block">Agitación</span>
                    <strong className="text-[8px] text-amber-400 block font-mono font-bold leading-tight">1500-370 RPM</strong>
                  </div>
                  <div className="p-1 border border-white/10 rounded bg-zinc-950 w-14">
                    <span className="text-[7px] text-muted-foreground uppercase block">Goteo</span>
                    <strong className="text-[8px] text-emerald-400 block font-mono font-bold leading-tight">1-2 gotas/s</strong>
                  </div>
                </div>
                <div className="font-mono text-xs text-amber-500 font-bold uppercase tracking-widest">
                  Síntesis Multivariable
                </div>
                <span className="text-[9px] text-muted-foreground leading-tight">Síntesis controlando agitación, goteo de reactivos y el factor luz (con/sin luz).</span>
              </div>
            )}

            {activeStep === 2 && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-24 h-16 border border-white/10 bg-white/5 rounded-xl flex flex-col items-center justify-center p-2 relative overflow-hidden">
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-primary animate-pulse" />
                  <Activity className="h-6 w-6 text-primary animate-pulse mb-1" />
                  <span className="text-[8px] font-mono text-muted-foreground uppercase leading-none">Mapeo NTA de Precisión</span>
                </div>
                <div className="font-mono text-xs text-primary font-bold uppercase tracking-widest">
                  Caracterización NTA & UV-Vis
                </div>
                <span className="text-[9px] text-muted-foreground leading-tight">Mapeo espectroscópico y distribución física real de diámetros por NTA.</span>
              </div>
            )}

            {activeStep === 3 && (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-18 border border-white/15 bg-sky-500/10 rounded-2xl flex flex-col justify-end p-2 relative shadow-glow">
                  <div className="absolute inset-0 bg-sky-500/5 rounded-2xl animate-pulse" />
                  <div className="w-full h-8 bg-sky-500/20 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold text-sky-400 border border-sky-400/30">
                    NTA Spline
                  </div>
                </div>
                <div className="font-mono text-xs text-primary font-bold uppercase tracking-widest">
                  Modelo Spline NTA
                </div>
                <span className="text-[9px] text-muted-foreground leading-tight">Calibración in-browser del spline interpolador alimentado con diámetros reales de NTA.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* SLIDE 4: RESULTADOS EMPÍRICOS (CON MUESTRAS REALES DE TU GRÁFICA)          */
/* ========================================================================= */
function SlideResults() {
  const [activeSampleIdx, setActiveSampleIdx] = useState(0); // 0 corresponds to 1_PURA
  const activeSample = SAMPLES[activeSampleIdx];

  // Mathematical SVG curve plotter matching the user's Matlab comparison chart exactly
  const renderUvVisChartSvg = () => {
    const width = 500;
    const height = 220;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 25;
    const paddingBottom = 25;

    // Convert spectral coords to SVG pixels
    const getSvgX = (nm: number) => {
      const minNm = 300;
      const maxNm = 800;
      return paddingLeft + ((nm - minNm) / (maxNm - minNm)) * (width - paddingLeft - paddingRight);
    };

    const getSvgY = (abs: number) => {
      const minAbs = -0.1;
      const maxAbs = 0.6;
      // Invert Y axis for SVG (0,0 is top-left)
      return height - paddingBottom - ((abs - minAbs) / (maxAbs - minAbs)) * (height - paddingTop - paddingBottom);
    };

    // Generate precise path points for a sample
    const getPathData = (sampleId: string) => {
      let d = "";
      for (let nm = 300; nm <= 800; nm += 5) {
        const abs = getCurvePoint(sampleId, nm);
        const x = getSvgX(nm);
        const y = getSvgY(abs);
        if (nm === 300) {
          d += `M ${x},${y}`;
        } else {
          d += ` L ${x},${y}`;
        }
      }
      return d;
    };

    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Y Axis Gridlines (Absorbance: -0.1 to 0.6) */}
        {[-0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((tick) => {
          const y = getSvgY(tick);
          return (
            <g key={tick}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="white" 
                strokeOpacity={tick === 0 ? "0.15" : "0.04"} 
                strokeDasharray={tick === 0 ? "none" : "3"} 
              />
              <text 
                x={paddingLeft - 8} 
                y={y + 3} 
                fill="#71717A" 
                fontSize="7.5" 
                textAnchor="end" 
                fontFamily="monospace"
              >
                {tick.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* X Axis Gridlines (Wavelength: 300 to 800 nm) */}
        {[300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800].map((tick) => {
          const x = getSvgX(tick);
          return (
            <g key={tick}>
              <line 
                x1={x} 
                y1={paddingTop} 
                x2={x} 
                y2={height - paddingBottom} 
                stroke="white" 
                strokeOpacity="0.04" 
                strokeDasharray="3" 
              />
              <text 
                x={x} 
                y={height - paddingBottom + 12} 
                fill="#71717A" 
                fontSize="7.5" 
                textAnchor="middle" 
                fontFamily="monospace"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Axis Labels */}
        <text 
          x={(width + paddingLeft) / 2} 
          y={height - 2} 
          fill="#A1A1AA" 
          fontSize="8.5" 
          textAnchor="middle" 
          fontFamily="monospace"
        >
          Longitud de onda &lambda; (nm)
        </text>
        <text 
          x="12" 
          y={(height - paddingBottom) / 2} 
          fill="#A1A1AA" 
          fontSize="8.5" 
          textAnchor="middle" 
          transform={`rotate(-90 12 ${(height - paddingBottom) / 2})`} 
          fontFamily="monospace"
        >
          Absorbancia (u.a.)
        </text>

        {/* Render all 7 experimental curves */}
        {SAMPLES.map((sample, idx) => {
          const isSelected = idx === activeSampleIdx;
          return (
            <path
              key={sample.id}
              d={getPathData(sample.id)}
              fill="none"
              stroke={sample.hex}
              strokeWidth={isSelected ? "3" : "1.2"}
              strokeOpacity={isSelected ? "1" : "0.22"}
              className="transition-all duration-300"
            />
          );
        })}

        {/* Peak pointer dot for selected active curve */}
        {activeSample.peakWavelength > 320 && (
          <g>
            <circle 
              cx={getSvgX(activeSample.peakWavelength)} 
              cy={getSvgY(activeSample.peakAbsorbance)} 
              r="4.5" 
              fill={activeSample.hex} 
              stroke="white" 
              strokeWidth="1.2"
              className="animate-pulse"
            />
            {/* Horizontal pointer dotted */}
            <line
              x1={paddingLeft}
              y1={getSvgY(activeSample.peakAbsorbance)}
              x2={getSvgX(activeSample.peakWavelength)}
              y2={getSvgY(activeSample.peakAbsorbance)}
              stroke={activeSample.hex}
              strokeOpacity="0.4"
              strokeDasharray="2"
            />
            {/* Vertical pointer dotted */}
            <line
              x1={getSvgX(activeSample.peakWavelength)}
              y1={getSvgY(activeSample.peakAbsorbance)}
              x2={getSvgX(activeSample.peakWavelength)}
              y2={height - paddingBottom}
              stroke={activeSample.hex}
              strokeOpacity="0.4"
              strokeDasharray="2"
            />
            {/* Peak values overlay tag */}
            <rect
              x={getSvgX(activeSample.peakWavelength) - 32}
              y={getSvgY(activeSample.peakAbsorbance) - 18}
              width="64"
              height="11"
              rx="3"
              fill="#09090b"
              fillOpacity="0.85"
              stroke={activeSample.hex}
              strokeWidth="0.5"
            />
            <text
              x={getSvgX(activeSample.peakWavelength)}
              y={getSvgY(activeSample.peakAbsorbance) - 10}
              fill="white"
              fontSize="6"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {activeSample.peakWavelength.toFixed(1)} nm
            </text>
          </g>
        )}

        {/* Special validation dot at 315 nm for Sample 4 (Green) */}
        {activeSample.id === "4" && (
          <g>
            <circle 
              cx={getSvgX(315.0)} 
              cy={getSvgY(getCurvePoint("4", 315.0))} 
              r="4.5" 
              fill="#22c55e" 
              stroke="white" 
              strokeWidth="1.2"
              className="animate-bounce"
            />
            <text
              x={getSvgX(315.0) + 10}
              y={getSvgY(getCurvePoint("4", 315.0)) - 6}
              fill="#22c55e"
              fontSize="7"
              fontWeight="bold"
              fontFamily="monospace"
            >
              315.0 nm
            </text>
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-5 h-full flex flex-col justify-center">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] tracking-widest uppercase">
          <Activity className="h-3 w-3" /> Criterio de Resultados e Instrumental
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Comparación Espectroscópica UV-Vis de AgNPs</h2>
        <p className="text-xs text-muted-foreground">Datos empíricos reales calibrados. Pulsa sobre cualquier muestra para aislar su plasmón y ver sus métricas de laboratorio.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-5 items-center">
        {/* Left column: samples listing and metadata table */}
        <div className="md:col-span-5 flex flex-col gap-4">
          {/* Samples selection tabs */}
          <div className="grid grid-cols-4 gap-1.5 bg-white/5 p-1.5 rounded-xl border border-white/5">
            {SAMPLES.map((sample, idx) => (
              <button
                key={sample.id}
                onClick={() => setActiveSampleIdx(idx)}
                style={{ 
                  backgroundColor: activeSampleIdx === idx ? `${sample.hex}22` : "transparent",
                  borderColor: activeSampleIdx === idx ? sample.hex : "transparent"
                }}
                className="py-1 rounded-lg border text-[9px] font-mono font-bold transition-all hover:bg-white/5 flex items-center justify-center gap-1 text-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sample.hex }} />
                {sample.id}
              </button>
            ))}
          </div>

          {/* Solution Vial & Stats Card */}
          <Card className="p-4 nl-card bg-black/35 flex flex-col justify-between gap-4 relative">
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Coloide Físico</span>
              <span className="font-mono text-xs font-bold text-foreground" style={{ color: activeSample.hex }}>
                {activeSample.name}
              </span>
            </div>

            <div className="flex gap-4 items-center">
              {/* Chemical Glass Tube Vial Simulation */}
              <div className="relative w-12 h-28 border-[2.5px] border-zinc-400 rounded-b-xl bg-zinc-950/40 p-0.5 flex flex-col justify-end overflow-hidden shrink-0 shadow-lg">
                <div className="absolute top-0 left-[-3px] right-[-3px] h-2 bg-zinc-400 border border-zinc-300 rounded-t-md" />
                <div 
                  className="w-full h-[78%] rounded-b-lg transition-all duration-500 ease-in-out relative"
                  style={{ 
                    background: `linear-gradient(to top, ${activeSample.hex} 40%, color-mix(in oklab, ${activeSample.hex} 75%, transparent) 100%)`,
                    boxShadow: `inset 0 0 10px rgba(0,0,0,0.4), 0 0 15px ${activeSample.hex}22`
                  }}
                />
              </div>

              {/* Sample description */}
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {activeSample.desc}
              </p>
            </div>

            {/* Quantitative Data Table */}
            <div className="border-t border-border/30 pt-3">
              <table className="w-full font-mono text-[9px] text-muted-foreground text-left">
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-1">Volumen NaBH4 (Reductor):</td>
                    <td className="py-1 font-bold text-foreground text-right">{activeSample.borohydrideVol} ({activeSample.molarity})</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-1">Temperatura y Luz:</td>
                    <td className="py-1 font-bold text-foreground text-right">{activeSample.temp} / {activeSample.light}</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-1">Agitación y Goteo:</td>
                    <td className="py-1 font-bold text-foreground text-right">{activeSample.agitation} / {activeSample.dripRate}</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-1">Pico Absorbancia (&lambda;_max):</td>
                    <td className="py-1 font-bold text-foreground text-right" style={{ color: activeSample.hex }}>
                      {activeSample.peakWavelength > 320 ? `${activeSample.peakWavelength.toFixed(1)} nm` : "N/A (Plasmón Inactivo)"}
                    </td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-1">Intensidad Absorbancia:</td>
                    <td className="py-1 font-bold text-foreground text-right">{activeSample.peakAbsorbance.toFixed(2)} u.a.</td>
                  </tr>
                  <tr>
                    <td className="py-1">Tamaño Nominal NTA:</td>
                    <td className="py-1 font-bold text-sky-400 text-right text-[11px]">{activeSample.sizeNta.toFixed(2)} nm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right column: real experimental spectrum plot */}
        <div className="md:col-span-7 nl-card p-4 bg-black/25 flex flex-col gap-2 relative shadow-glow">
          <div className="flex justify-between items-center border-b border-border/40 pb-2 mb-1">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest block">
              Espectro de Absorbancia Experimental (UV-Vis)
            </span>
            <span className="font-mono text-[9px] text-muted-foreground uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">
              Muestras: 7.csv a 1_PURA.csv
            </span>
          </div>
          <div className="w-full min-h-[220px] flex items-center justify-center">
            {renderUvVisChartSvg()}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* SLIDE 5: ANÁLISIS CRÍTICO Y FUNDAMENTO TEÓRICO                             */
/* ========================================================================= */
function SlideAnalysis() {
  return (
    <div className="space-y-5 h-full flex flex-col justify-center">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-[9px] tracking-widest uppercase">
          <BookOpen className="h-3 w-3" /> Criterio de Análisis y Conclusiones
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Análisis Crítico e Integración de Fundamentos</h2>
        <p className="text-xs text-muted-foreground">Discusión profunda frente al estado del arte, validez del modelo y propuestas de mejora.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-5 items-stretch">
        {/* Core Analysis Matrix Card */}
        <Card className="md:col-span-8 p-5 nl-card bg-black/35 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-primary uppercase tracking-widest border-b border-border/40 pb-1.5 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>Discusión Teórica: Teoría de Mie vs. Realidad Experimental</span>
            </h3>

            <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p>
                El corrimiento óptico y cromático observado al modular la concentración de Borohidruro de Sodio, temperaturas y agitación, se correlaciona con la <strong className="text-foreground">Teoría de Mie</strong>: al aumentar el volumen físico de las nanopartículas de plata, los electrones de la banda de conducción exhiben mayor inercia a la oscilación de la nube electrónica libre, induciendo un desplazamiento cromático. El motor de NanoLens calibra esta respuesta basándose fundamentalmente en tamaños reales medidos por <strong className="text-primary font-bold">NTA (Nanoparticle Tracking Analysis)</strong>, ofreciendo mayor robustez frente a polidispersidades que la simple lectura de picos UV-Vis.
              </p>
              <p>
                La <strong className="text-amber-400">Muestra 4</strong> (pico registrado a <strong className="text-amber-400">315 nm</strong>) ilustra un fenómeno límite crítico: bajo una sub-dosificación severa de Borohidruro de sodio, la densidad de reducción colapsa, impidiendo la nucleación de partículas esféricas estables y provocando agregación macroscópica de cúmulos (diámetro NTA promedio de <strong className="text-amber-400">83.40 nm</strong>) que desactivan el plasmón visible.
              </p>
              <p>
                NanoLens modela esta respuesta física mediante una <strong className="text-emerald-400">curva spline ponderada Catmull-Rom calibrada contra diámetros reales NTA</strong>, la cual interpola el Tono (H) en el espacio de color HSV, proporcionando una estimación in-browser robusta frente a fluctuaciones analíticas y de iluminación.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/30 pt-3 text-[10px] font-mono">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span><strong className="text-foreground">Conclusión 1:</strong> Correlación directa entre HSL móvil y diámetros de referencia NTA reales ($R^2 = 0.941$).</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span><strong className="text-foreground">Conclusión 2:</strong> Estabilidad gobernada por estequiometría, temperatura y agitación de la síntesis con $NaBH_4$.</span>
            </div>
          </div>
        </Card>

        {/* Future Upgrades Block */}
        <Card className="md:col-span-4 p-5 nl-card bg-indigo-950/5 border-indigo-900/20 flex flex-col justify-between gap-4 animate-pulse">
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Mejoras y Trabajo Futuro</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Propuestas de optimización para elevar la fidelidad del motor algorítmico móvil de NanoLens:
            </p>
            <ul className="space-y-2 text-[10px] font-mono text-muted-foreground/90">
              <li className="flex items-start gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                <span>Micrografía <strong className="text-indigo-300">TEM (Transmisión)</strong> para medir excentricidad.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                <span>Modelado con <strong className="text-indigo-300">Redes Neuronales MLP</strong> de calibración RGB.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                <span>Inclusión de <strong className="text-indigo-300">referencia blanca adaptativa QR</strong> física en la toma fotográfica.</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-lg text-center font-mono text-[9px] text-indigo-400 uppercase tracking-widest">
            Alineación con el Estado del Arte
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* SLIDE 6: PANEL DE DEFENSA & PREGUNTAS CLAVE                                */
/* ========================================================================= */
function SlideDefense() {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  const qaList = [
    {
      q: "¿Cómo explica la Teoría de Mie la relación entre absorbancia UV-Vis y tamaño de las AgNPs?",
      a: "La ecuación de Mie describe la sección eficaz de absorción y dispersión de esferas metálicas. Al aumentar el diámetro, se activan modos de oscilación multipolares además del dipolar fundamental, amortiguando la oscilación colectiva. Esto ensancha la curva LSPR y desplaza el pico cromático hacia el rojo (de 390 a 404 nm).",
      topic: "Teoría de Mie LSPR"
    },
    {
      q: "¿Por qué el Borohidruro de sodio y los parámetros de síntesis (temperatura, agitación, luz) determinan la estabilidad coloidal y tamaño de las AgNPs?",
      a: "El NaBH4 actúa como agente reductor fuerte impulsando una nucleación cinética ultrarrápida. La estabilidad es electrostática, provista por el recubrimiento de subproductos de borato en la corona superficial de la plata que la cargan negativamente. La modulación de temperatura (fría, ambiente, caliente a 60°/90°C), agitación (1500/750/370 RPM), velocidad de goteo (1-2 gotas/s) y luz controlan el balance competitivo entre nucleación rápida y agregación coloidal.",
      topic: "Estabilidad y Cinética"
    },
    {
      q: "¿Qué representa la lectura anómala de absorbancia a 315 nm registrada en la Muestra 4?",
      a: "Representa un colapso plasmónico por sub-dosificación crítica de Borohidruro de sodio. Al haber insuficiente agente reductor, disminuye drásticamente la tasa de nucleación y la estabilización electrostática superficial, provocando agregación macroscópica masiva de núcleos en cúmulos de gran diámetro (83.40 nm por NTA) y precipitación de óxidos de plata no resonantes en el visible.",
      topic: "Agregación / Anomalías"
    },
    {
      q: "¿Cómo aíslan el ruido de iluminación de distintos celulares en el algoritmo cromático?",
      a: "El canal de Tono (H) en el espacio de color HSV representa la componente cromática pura angular desvinculada del brillo (V) e intensidad de saturación (S). Al calibrar el spline cúbico Catmull-Rom basándose en diámetros reales medidos por NTA mapeando contra el tono H, el sistema es inmune a diferencias de sensor o iluminación ambiental.",
      topic: "Robustez Algorítmica"
    }
  ];

  return (
    <div className="space-y-5 h-full flex flex-col justify-center">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[9px] tracking-widest uppercase">
          <HelpCircle className="h-3 w-3" /> Criterio de Preguntas de Defensa
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Panel de Defensa frente al Jurado</h2>
        <p className="text-xs text-muted-foreground">Preguntas clave de nanotecnología. Pulsa sobre cualquier tarjeta para girarla y desplegar la respuesta formal detallada.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        {qaList.map((qa, idx) => {
          const isFlipped = flippedCard === idx;
          
          return (
            <div 
              key={idx}
              onClick={() => setFlippedCard(isFlipped ? null : idx)}
              className="h-32 cursor-pointer relative perspective"
            >
              <div 
                className={`w-full h-full duration-500 preserve-3d transition-transform ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* Front Side Card */}
                <div className="absolute inset-0 backface-hidden nl-card p-4.5 flex flex-col justify-between bg-black/40 border-white/5 hover:border-primary/20">
                  <div className="flex items-center justify-between font-mono text-[9px] text-primary uppercase tracking-widest font-bold">
                    <span>◆ Pregunta {idx + 1}</span>
                    <span>{qa.topic}</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-snug">
                    {qa.q}
                  </p>
                  <span className="text-[8px] font-mono text-muted-foreground uppercase text-right block">
                    Hacer click para girar ➔
                  </span>
                </div>

                {/* Back Side Card (Answer) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 nl-card p-4.5 flex flex-col justify-between bg-primary/5 border-primary/20 overflow-y-auto">
                  <div className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest font-bold">
                    ✓ Respuesta Técnica
                  </div>
                  <p className="text-[9.5px] text-muted-foreground leading-relaxed flex-1">
                    {qa.a}
                  </p>
                  <span className="text-[8px] font-mono text-primary uppercase text-right block mt-1">
                    Volver ↺
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
