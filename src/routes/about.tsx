import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { GraduationCap, FlaskConical, BookMarked } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Sobre el proyecto — NanoLens" },
      { name: "description", content: "Equipo, contexto académico, metodología de síntesis y referencias bibliográficas." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground">Sobre el proyecto</h1>
        <p className="mt-1 text-muted-foreground">Una herramienta hecha por estudiantes, para estudiantes de nanotecnología.</p>
      </header>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary"><GraduationCap className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Equipo y contexto</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              NanoLens fue desarrollada en el marco del curso <strong>Principios de Nanotecnología</strong> de la <strong>Universidad de los Andes</strong>. El objetivo del proyecto es democratizar la caracterización preliminar de AgNPs en entornos académicos donde no siempre se dispone de equipos especializados de manera inmediata.
            </p>
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary"><FlaskConical className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Metodología de síntesis</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Las muestras de calibración se sintetizaron por reducción química de AgNO₃ con citrato de sodio (método de Turkevich modificado), variando concentración de reductor y tiempo de reacción para obtener distribuciones de tamaño en el rango 10–90 nm. Cada lote fue caracterizado con:
            </p>
            <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
              <li>Espectrofotometría <strong>UV-Vis</strong> para identificar el pico de LSPR.</li>
              <li><strong>NTA Zetasizer</strong> para distribución hidrodinámica de tamaño.</li>
              <li>Fotografía estandarizada con fondo blanco e iluminación natural difusa.</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary"><BookMarked className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Referencias bibliográficas</h2>
            <ol className="mt-2 list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>Paramelle, D. et al. (2014). <em>A rapid method to estimate the concentration of citrate capped silver nanoparticles from UV-visible light spectra.</em> Analyst, 139, 4855.</li>
              <li>Tomaszewska, E. et al. (2013). <em>Detection limits of DLS and UV-Vis spectroscopy in characterization of polydisperse nanoparticles colloids.</em> Journal of Nanomaterials.</li>
              <li>Pyrz, W. D. & Buttrey, D. J. (2008). <em>Particle size determination using TEM: a discussion of image acquisition and analysis for the novice microscopist.</em> Langmuir, 24, 11350.</li>
              <li>Mie, G. (1908). <em>Beiträge zur Optik trüber Medien, speziell kolloidaler Metallösungen.</em> Annalen der Physik.</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
