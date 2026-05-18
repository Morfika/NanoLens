import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { calibrationData } from "@/lib/calibration";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from "recharts";
import { Activity, Database, LineChart } from "lucide-react";

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
    <div className="rounded-xl border border-primary/30 bg-black/80 p-4 text-xs font-mono shadow-glow backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-border/50 pb-2 mb-2">
        <span className="h-4 w-4 rounded-full border border-white/20 shadow-[inset_0_0_5px_rgba(0,0,0,0.5)]" style={{ background: p.hex }} />
        <span className="font-bold text-primary tracking-widest uppercase">Muestra_{p.id}</span>
      </div>
      <div className="space-y-1.5 text-muted-foreground">
        <div className="flex justify-between gap-6"><span>NTA_DIAMETER:</span> <span className="font-bold text-foreground">{p.ntaSize} nm</span></div>
        <div className="flex justify-between gap-6"><span>UV_VIS_PEAK:</span> <span className="font-bold text-foreground">{p.uvVisPeak} nm</span></div>
        <div className="flex justify-between gap-6"><span>HEX_VAL:</span> <code className="text-foreground">{p.hex}</code></div>
        <div className="flex justify-between gap-6"><span>PROTOCOL:</span> <span className="text-foreground">{p.method}</span></div>
      </div>
    </div>
  );
}

function CalibrationChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          type="number" dataKey="uvVisPeak" name="Pico UV-Vis" unit=" nm"
          domain={[380, 480]} stroke="rgba(255,255,255,0.3)"
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "monospace" }}
          label={{ value: "RESONANCIA PLASMÓNICA (nm)", position: "insideBottom", offset: -25, fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em" }}
        />
        <YAxis
          type="number" dataKey="ntaSize" name="Tamaño" unit=" nm"
          domain={[0, 100]} stroke="rgba(255,255,255,0.3)"
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "monospace" }}
          label={{ value: "DIÁMETRO NTA (nm)", angle: -90, position: "insideLeft", offset: 10, fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em" }}
        />
        <ZAxis range={[300, 300]} />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.2)" }} />
        <Scatter data={calibrationData}>
          {calibrationData.map((d) => (
            <Cell key={d.id} fill={d.hex} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} className="transition-all duration-300 hover:opacity-100 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
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
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-16 relative">
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] opacity-20 nl-aurora" />
      
      <header className="mb-10 fade-in-up">
        <h1 className="text-4xl font-semibold text-foreground flex items-center gap-3">
          <LineChart className="h-8 w-8 text-primary" />
          <span>Matriz de Calibración</span>
        </h1>
        <p className="mt-2 text-muted-foreground text-lg max-w-2xl">
          Correlación empírica entre el diámetro hidrodinámico (NTA) y el desplazamiento batocrómico del LSPR.
        </p>
      </header>

      <Card className="p-4 sm:p-8 nl-card relative overflow-hidden fade-in-up-delay-1 border-primary/20">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Activity className="w-32 h-32 text-primary nl-pulse" />
        </div>
        <div className="absolute inset-0 nl-grid-bg opacity-[0.15] pointer-events-none" />
        
        <div className="h-[450px] w-full relative z-10">
          {mounted ? <CalibrationChart /> : (
            <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-widest text-primary animate-pulse">Cargando visualización del modelo...</div>
          )}
        </div>
      </Card>

      <Card className="mt-8 overflow-hidden nl-card border-border/50 fade-in-up-delay-2">
        <div className="border-b border-border/50 bg-secondary/30 p-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-mono uppercase tracking-widest text-foreground">Registro de Muestras (Dataset)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/20 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-4 border-b border-border/50">ID_Muestra</th>
                <th className="px-5 py-4 border-b border-border/50">Coloración</th>
                <th className="px-5 py-4 border-b border-border/50 text-right">Tamaño_NTA (nm)</th>
                <th className="px-5 py-4 border-b border-border/50 text-right">Pico_UV_Vis (nm)</th>
                <th className="px-5 py-4 border-b border-border/50">Vector_HEX</th>
                <th className="px-5 py-4 border-b border-border/50">Protocolo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {calibrationData.map((d) => (
                <tr key={d.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-5 py-3 font-bold text-primary group-hover:text-primary-hover">#{d.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-md border border-white/20 shadow-[inset_0_0_5px_rgba(0,0,0,0.5)]" style={{ background: d.hex }} />
                      <span className="text-foreground/80">{d.colorName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-foreground text-right">{d.ntaSize}.0</td>
                  <td className="px-5 py-3 text-foreground text-right">{d.uvVisPeak}.0</td>
                  <td className="px-5 py-3"><code className="text-muted-foreground group-hover:text-foreground transition-colors">{d.hex}</code></td>
                  <td className="px-5 py-3 text-muted-foreground/60">{d.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-6 text-xs font-mono text-muted-foreground/60 max-w-3xl fade-in-up-delay-3 border-l-2 border-primary/20 pl-4">
        <strong className="text-primary/70 uppercase tracking-widest">Nota metodológica:</strong> Curva construida con {calibrationData.length} muestras de AgNPs sintetizadas y caracterizadas por NTA Zetasizer y espectrofotometría UV-Vis. Los datos mostrados son de la base de calibración empírica.
      </p>
    </div>
  );
}
