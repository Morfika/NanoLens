import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { calibrationData } from "@/lib/calibration";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from "recharts";

export const Route = createFileRoute("/calibration")({
  head: () => ({
    meta: [
      { title: "Curva de calibración — NanoLens" },
      { name: "description", content: "Visualización interactiva de la curva de calibración construida con NTA y UV-Vis." },
    ],
  }),
  component: CalibrationPage,
});

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover p-3 text-sm shadow-card">
      <div className="flex items-center gap-2">
        <span className="h-4 w-4 rounded-full border border-border" style={{ background: p.hex }} />
        <span className="font-semibold">Muestra {p.id}</span>
      </div>
      <div className="mt-1 text-muted-foreground">
        Tamaño NTA: <span className="font-medium text-foreground">{p.ntaSize} nm</span><br />
        Pico UV-Vis: <span className="font-medium text-foreground">{p.uvVisPeak} nm</span><br />
        Color: <code className="text-foreground">{p.hex}</code><br />
        Método: <span className="text-foreground">{p.method}</span>
      </div>
    </div>
  );
}

function CalibrationChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          type="number" dataKey="uvVisPeak" name="Pico UV-Vis" unit=" nm"
          domain={[380, 480]} stroke="var(--color-muted-foreground)"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          label={{ value: "Pico de absorbancia (nm)", position: "insideBottom", offset: -15, fill: "var(--color-muted-foreground)" }}
        />
        <YAxis
          type="number" dataKey="ntaSize" name="Tamaño" unit=" nm"
          domain={[0, 100]} stroke="var(--color-muted-foreground)"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          label={{ value: "Tamaño NTA (nm)", angle: -90, position: "insideLeft", offset: 10, fill: "var(--color-muted-foreground)" }}
        />
        <ZAxis range={[220, 220]} />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={calibrationData}>
          {calibrationData.map((d) => (
            <Cell key={d.id} fill={d.hex} stroke="#1f2937" strokeWidth={1.5} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function CalibrationPage() {
  // Recharts ResponsiveContainer is not SSR-safe — only render after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Curva de calibración</h1>
        <p className="mt-2 text-muted-foreground">Tamaño medido por NTA frente a longitud de onda del pico de absorbancia (UV-Vis).</p>
      </header>

      <Card className="p-4 sm:p-8">
        <div className="h-[420px] w-full">
          {mounted ? <CalibrationChart /> : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Cargando gráfico…</div>
          )}
        </div>
      </Card>

      <Card className="mt-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Muestra</th>
                <th className="px-5 py-3">Color</th>
                <th className="px-5 py-3">Tamaño NTA (nm)</th>
                <th className="px-5 py-3">Pico UV-Vis (nm)</th>
                <th className="px-5 py-3">HEX</th>
                <th className="px-5 py-3">Método</th>
              </tr>
            </thead>
            <tbody>
              {calibrationData.map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="px-5 py-3 font-semibold text-foreground">{d.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full border border-border" style={{ background: d.hex }} />
                      <span className="text-foreground">{d.colorName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-foreground">{d.ntaSize}</td>
                  <td className="px-5 py-3 text-foreground">{d.uvVisPeak}</td>
                  <td className="px-5 py-3"><code className="text-foreground">{d.hex}</code></td>
                  <td className="px-5 py-3 text-muted-foreground">{d.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground">
        <strong>Nota metodológica:</strong> Curva construida con {calibrationData.length} muestras de AgNPs sintetizadas y caracterizadas por NTA Zetasizer y espectrofotometría UV-Vis. Los datos mostrados son de ejemplo y serán reemplazados con resultados experimentales del equipo.
      </p>
    </div>
  );
}
