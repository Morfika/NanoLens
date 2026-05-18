import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sun, Camera, FlaskConical, Eye, AlertTriangle, BookOpen, Fingerprint } from "lucide-react";
import { sizeRanges, calibrationData } from "@/lib/calibration";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Manual Operativo — NanoLens" },
      { name: "description", content: "Protocolos de captura, carta de referencia espectral y limitaciones del sistema." },
    ],
  }),
  component: GuidePage,
});

const steps = [
  { icon: Sun, title: "Luz Estándar", text: "Requiere espectro de luz natural difusa. Los fotones de fuentes cálidas alteran la medición algorítmica. Desactivar flash." },
  { icon: FlaskConical, title: "Homogeneidad", text: "Vibración mecánica suave del vial previa a captura. Asegura dispersión coloidal uniforme y evita agregados en el fondo." },
  { icon: Camera, title: "Enfoque Macroscópico", text: "Contraste con fondo blanco puro. Estabilización óptica estricta. Minimizar refracciones y reflejos sobre el cuarzo/vidrio." },
  { icon: Eye, title: "Encuadre Espectral", text: "Maximizar área de muestreo de la solución. Excluir menisco, burbujas e interferencias de la celda en el análisis." },
];

function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16 relative">
      <div className="absolute top-20 -left-20 -z-10 h-[400px] w-[400px] opacity-[0.15] bg-primary/20 rounded-full blur-[100px]" />
      
      <header className="mb-10 fade-in-up border-b border-border/50 pb-6">
        <div className="flex items-center gap-3 mb-2 text-primary font-mono text-xs tracking-widest uppercase">
          <Fingerprint className="h-4 w-4" /> Autorización Nivel 2 Requerida
        </div>
        <h1 className="text-4xl font-semibold text-foreground flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <span>Manual Operativo</span>
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
          Protocolos estrictos de captura para garantizar la precisión del análisis fotométrico computacional.
        </p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 fade-in-up-delay-1">
        {steps.map((s, idx) => (
          <Card key={s.title} className="p-6 nl-card relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
            <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/10 to-transparent blur-xl transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_15px_-5px_var(--primary)]">
                  <s.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground/50 border border-border/50 rounded px-1.5 py-0.5">STEP_0{idx + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground font-mono uppercase tracking-wide">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          </Card>
        ))}
      </section>

      <div className="mt-16 fade-in-up-delay-2">
        <h2 className="text-xl font-bold text-foreground font-mono uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 bg-primary animate-pulse" />
          Matriz de Referencia Óptica
        </h2>
        <p className="mt-1 text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">
          Verificación cruzada manual. Comparativa de firmas espectrales frente a tamaños calibrados.
        </p>
        
        <Card className="mt-5 overflow-hidden nl-card border-border/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/20">
            {sizeRanges.map((r, i) => {
              const cal = calibrationData[i] ?? calibrationData[calibrationData.length - 1];
              return (
                <div key={r.label} className="flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors border-b border-border/20">
                  <div className="relative">
                    <div className="h-16 w-16 flex-shrink-0 rounded-lg border-2 border-white/10 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]" style={{ background: cal.hex }} />
                    <div className="absolute -bottom-2 -right-2 text-[9px] font-mono bg-black/80 text-muted-foreground border border-border/50 px-1 rounded backdrop-blur-sm">{cal.hex}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground font-mono">{r.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{r.description}</div>
                    {r.warning && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-mono text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded">
                        <AlertTriangle className="h-3 w-3" /> {r.warning}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-16 fade-in-up-delay-3">
        <h2 className="text-xl font-bold text-foreground font-mono uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 bg-primary animate-pulse" />
          Terminal de Consultas (FAQ)
        </h2>
        <Card className="mt-5 p-2 sm:p-4 nl-card bg-black/40 backdrop-blur-xl border-primary/20">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1" className="border-border/20">
              <AccordionTrigger className="font-mono text-sm hover:text-primary transition-colors data-[state=open]:text-primary">¿Sustituye este algoritmo el análisis NTA/UV-Vis?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-mono text-xs leading-relaxed bg-primary/5 p-4 rounded-b-lg border-t border-primary/10">
                &gt; NEGATIVO. NanoLens despliega heurísticas de estimación preliminar. Requisito indispensable: validación instrumental cruzada (NTA, DLS, UV-Vis, TEM) para rigor científico en publicaciones.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2" className="border-border/20">
              <AccordionTrigger className="font-mono text-sm hover:text-primary transition-colors data-[state=open]:text-primary">¿Compatibilidad con otros nanomateriales?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-mono text-xs leading-relaxed bg-primary/5 p-4 rounded-b-lg border-t border-primary/10">
                &gt; INCOMPATIBLE. Curva topológica calibrada exclusivamente para AgNPs esféricas en matriz acuosa. LSPR de otros elementos (Au, CuO) generarán falsos positivos.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3" className="border-border/20">
              <AccordionTrigger className="font-mono text-sm hover:text-primary transition-colors data-[state=open]:text-primary">¿Divergencia entre capturas sucesivas?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-mono text-xs leading-relaxed bg-primary/5 p-4 rounded-b-lg border-t border-primary/10">
                &gt; PARÁMETROS ÓPTICOS VARIABLES. Algoritmos de balance de blancos de sensores móviles introducen ruido no lineal. Requiere estandarización estricta del entorno lumínico.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q4" className="border-border/20 border-b-0">
              <AccordionTrigger className="font-mono text-sm hover:text-primary transition-colors data-[state=open]:text-primary">¿Telemetría y privacidad de datos?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-mono text-xs leading-relaxed bg-primary/5 p-4 rounded-b-lg border-t border-primary/10">
                &gt; SISTEMA AISLADO. Procesamiento local mediante Canvas API del navegador. Cero transferencia de paquetes de imagen a servidores externos.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>

      <div className="mt-16 fade-in-up-delay-3 pb-8">
        <h2 className="text-xl font-bold text-destructive font-mono uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Limitaciones del Sistema
        </h2>
        <Card className="mt-5 p-6 nl-card border-destructive/30 bg-destructive/5">
          <ul className="list-none space-y-3 font-mono text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-destructive font-bold mt-0.5">::</span>
              <span>El vector de color capturado está subordinado al ISP de la cámara. Puede introducir sesgo sistemático ineludible.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive font-bold mt-0.5">::</span>
              <span>Modelo exclusivo para AgNPs esféricas. Incapacidad matemática para discernir entre tamaño modal y polidispersidad extrema.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive font-bold mt-0.5">::</span>
              <span>Agregación o alteración del índice de refracción por surfactantes causa desplazamiento del LSPR, invalidando la lectura.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive font-bold mt-0.5">::</span>
              <span>El output es un <em>rango probabilístico</em>, no una medición escalar absoluta.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
