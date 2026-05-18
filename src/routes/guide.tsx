import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sun, Camera, FlaskConical, Eye, AlertTriangle } from "lucide-react";
import { sizeRanges, calibrationData } from "@/lib/calibration";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Guía de uso — NanoLens" },
      { name: "description", content: "Cómo tomar una buena foto, carta de colores de referencia y limitaciones del método." },
    ],
  }),
  component: GuidePage,
});

const steps = [
  { icon: Sun, title: "Iluminación natural", text: "Usa luz natural difusa cerca de una ventana. Evita el flash directo y las luces cálidas amarillentas." },
  { icon: FlaskConical, title: "Muestra homogeneizada", text: "Agita suavemente el vial antes de la foto para asegurar una solución uniforme sin sedimentos." },
  { icon: Camera, title: "Fondo blanco y enfoque", text: "Coloca el vial frente a una hoja blanca. Enfoca y mantén la cámara estable, sin reflejos sobre el vidrio." },
  { icon: Eye, title: "Encuadre limpio", text: "Llena el cuadro con la zona coloreada del líquido. Al recortar, evita las paredes del tubo y burbujas." },
];

function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground">Guía de uso y protocolo</h1>
        <p className="mt-1 text-muted-foreground">Pequeños cuidados al capturar la foto que mejoran enormemente la calidad del análisis.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {steps.map((s) => (
          <Card key={s.title} className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </Card>
        ))}
      </section>

      <h2 className="mt-10 text-xl font-semibold text-foreground">Carta de colores de referencia</h2>
      <p className="mt-1 text-sm text-muted-foreground">Compara visualmente tu muestra con estas franjas calibradas.</p>
      <Card className="mt-3 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {sizeRanges.map((r, i) => {
            const cal = calibrationData[i] ?? calibrationData[calibrationData.length - 1];
            return (
              <div key={r.label} className="flex items-center gap-4 border-b border-border p-4">
                <div className="h-16 w-16 flex-shrink-0 rounded-lg border border-border" style={{ background: cal.hex }} />
                <div>
                  <div className="text-sm font-semibold text-foreground">{r.label}</div>
                  <div className="text-xs text-muted-foreground">{r.description}</div>
                  {r.warning && (
                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-warning">
                      <AlertTriangle className="h-3 w-3" /> {r.warning}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <h2 className="mt-10 text-xl font-semibold text-foreground">Preguntas frecuentes</h2>
      <Card className="mt-3 p-2 sm:p-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="q1">
            <AccordionTrigger>¿Esto reemplaza a un equipo NTA o UV-Vis?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              No. NanoLens es una herramienta de estimación rápida y didáctica. Para reportes científicos definitivos siempre recomendamos caracterización instrumental (NTA, DLS, UV-Vis, TEM).
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>¿Funciona con otras nanopartículas?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              La curva está calibrada específicamente para AgNPs esféricas en agua. Otros materiales (Au, CuO, etc.) tienen LSPR distintas y los rangos no son válidos.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger>¿Por qué dos fotos de la misma muestra dan resultados distintos?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              La cámara, balance de blancos y luz ambiente afectan el color capturado. Toma siempre las fotos en condiciones similares (fondo blanco, luz natural, sin flash) y selecciona zonas comparables.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q4">
            <AccordionTrigger>¿Mis fotos se suben a algún servidor?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              No. Todo el análisis ocurre en tu navegador con la Canvas API. La imagen no sale de tu dispositivo.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      <h2 className="mt-10 text-xl font-semibold text-foreground">Limitaciones honestas del método</h2>
      <Card className="mt-3 p-5 text-sm text-muted-foreground">
        <ul className="list-inside list-disc space-y-2">
          <li>El color percibido depende del balance de blancos de la cámara y de la fuente de luz; pueden introducir sesgo sistemático.</li>
          <li>Sólo aplica a AgNPs esféricas dispersas en agua. No discrimina entre tamaño promedio y distribución amplia.</li>
          <li>La agregación, oxidación o presencia de surfactantes puede desplazar el LSPR y producir falsos positivos de tamaño.</li>
          <li>La estimación entrega un <em>rango</em>, no un valor puntual. Trátalo como hipótesis, no como medición absoluta.</li>
        </ul>
      </Card>
    </div>
  );
}
