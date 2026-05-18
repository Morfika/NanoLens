import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { GraduationCap, FlaskConical, BookMarked, Code, TerminalSquare } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Dossier del Proyecto — NanoLens" },
      { name: "description", content: "Equipo, contexto académico, metodología de síntesis y referencias bibliográficas." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16 relative">
      <div className="absolute top-1/4 right-0 -z-10 h-[500px] w-[500px] opacity-10 bg-primary/30 rounded-full blur-[120px]" />
      
      <header className="mb-12 fade-in-up text-center sm:text-left border-b border-border/50 pb-8">
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-[10px] tracking-[0.2em] uppercase">
          <TerminalSquare className="h-3 w-3" /> Archivo Desclasificado
        </div>
        <h1 className="text-4xl font-semibold text-foreground flex items-center justify-center sm:justify-start gap-3 font-display">
          <Code className="h-8 w-8 text-primary" />
          <span>Dossier del Proyecto</span>
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Arquitectura computacional diseñada por investigadores, para investigadores de ciencias a nanoescala.
        </p>
      </header>

      <div className="space-y-6">
        <Card className="p-8 nl-card fade-in-up-delay-1 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
          <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-black border border-primary/20 text-primary shadow-glow">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground font-mono uppercase tracking-widest mb-3">Contexto Operativo</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                NanoLens V2.0 fue desplegada en el marco del curso <strong className="text-primary/90 font-mono text-xs">Principios de Nanotecnología</strong> de la <strong className="text-foreground">Universidad de los Andes</strong>. El objetivo primario de la arquitectura es democratizar la caracterización fotométrica preliminar de AgNPs en entornos académicos donde el acceso a clusters de espectroscopía instrumental es intermitente o limitado.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 nl-card fade-in-up-delay-2 relative overflow-hidden group">
          <div className="absolute left-0 bottom-0 w-32 h-32 bg-primary/5 rounded-tr-full pointer-events-none transition-transform group-hover:scale-110" />
          <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-black border border-primary/20 text-primary shadow-glow">
              <FlaskConical className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground font-mono uppercase tracking-widest mb-3">Protocolo de Síntesis</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                El dataset de calibración se generó mediante reducción química de AgNO₃ con citrato de sodio (protocolo de Turkevich iterativo), modulando la concentración del agente reductor para aislar distribuciones paramétricas en el rango 10–90 nm. Variables de caracterización in-vitro:
              </p>
              <ul className="space-y-2 text-sm font-mono text-muted-foreground/80">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>Espectrofotometría <strong className="text-primary/90">UV-Vis</strong> para aislar resonancia plasmónica superficial (LSPR).</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>Telemetría <strong className="text-primary/90">NTA Zetasizer</strong> para mapeo hidrodinámico.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>Captura óptica estandarizada bajo parámetros difusos neutros.</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-8 nl-card fade-in-up-delay-3 bg-black/40 backdrop-blur-xl border-primary/10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-background/50 border border-border/50 text-muted-foreground">
              <BookMarked className="h-7 w-7" />
            </div>
            <div className="w-full">
              <h2 className="text-xl font-bold text-foreground font-mono uppercase tracking-widest mb-4">Bibliografía Core</h2>
              <div className="space-y-3 font-mono text-xs">
                {[
                  "Paramelle, D. et al. (2014). A rapid method to estimate the concentration of citrate capped silver nanoparticles from UV-visible light spectra. Analyst, 139, 4855.",
                  "Tomaszewska, E. et al. (2013). Detection limits of DLS and UV-Vis spectroscopy in characterization of polydisperse nanoparticles colloids. Journal of Nanomaterials.",
                  "Pyrz, W. D. & Buttrey, D. J. (2008). Particle size determination using TEM: a discussion of image acquisition and analysis for the novice microscopist. Langmuir, 24, 11350.",
                  "Mie, G. (1908). Beiträge zur Optik trüber Medien, speziell kolloidaler Metallösungen. Annalen der Physik."
                ].map((ref, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-primary/30 transition-colors">
                    <span className="text-primary font-bold mt-0.5">[{idx + 1}]</span>
                    <span className="text-muted-foreground/70 leading-relaxed">{ref}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
