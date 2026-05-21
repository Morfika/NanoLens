import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScatterChart, Scatter, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Database, LineChart as LineChartIcon } from "lucide-react";
import { SPLINE_RAW as RAW, catmullRom, hsvToHex } from "@/lib/splineUtils";

export const Route = createFileRoute("/calibration")({
  head: () => ({
    meta: [
      { title: "Curva de calibración — NanoLens" },
      { name: "description", content: "Visualización interactiva de la curva de calibración spline cúbica Catmull-Rom HSV vs Diámetro." },
    ],
  }),
  component: CalibrationPage,
});

function CustomChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  
  // Buscar si en la selección hover existe el punto experimental que posee ID y Swatch Hex
  const rawItem = payload.find((item: any) => item.payload?.id);
  const p = rawItem ? rawItem.payload : payload[0].payload;
  
  // Obtener el valor Y específico del canal que se está examinando en el hover
  const value = payload[0].value;
  
  if (p.id) {
    return (
      <div className="rounded-xl border border-primary/30 bg-black/90 p-4 text-xs font-mono shadow-glow backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-border/50 pb-2 mb-2">
          <span className="h-4 w-4 rounded-full border border-white/20 shadow-[inset_0_0_5px_rgba(0,0,0,0.5)]" style={{ background: p.hex }} />
          <span className="font-bold text-primary tracking-widest uppercase">Muestra #{p.id}</span>
        </div>
        <div className="space-y-1.5 text-muted-foreground">
          <div className="flex justify-between gap-6"><span>Diámetro NTA:</span> <span className="font-bold text-foreground">{p.x.toFixed(2)} nm</span></div>
          <div className="flex justify-between gap-6"><span>Valor HSV:</span> <span className="font-bold text-foreground">{typeof value === 'number' ? value.toFixed(1) : value}</span></div>
          <div className="flex justify-between gap-6"><span>Vector HEX:</span> <code className="text-foreground">{p.hex}</code></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-xl border border-border bg-black/90 p-3 text-xs font-mono backdrop-blur-xl">
      <div className="text-primary font-bold mb-1 border-b border-border/50 pb-1 mb-1">Punto Interpolado</div>
      <div className="space-y-1 text-muted-foreground">
        <div className="flex justify-between gap-6"><span>Diámetro:</span> <span className="font-bold text-foreground">{p.x.toFixed(1)} nm</span></div>
        <div className="flex justify-between gap-6"><span>Valor HSV:</span> <span className="font-bold text-foreground">{typeof value === 'number' ? value.toFixed(1) : value}</span></div>
      </div>
    </div>
  );
}

function CustomSizeTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-xl border border-primary/30 bg-black/90 p-4 text-xs font-mono shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-border/50 pb-2 mb-2">
        <span className="h-4 w-4 rounded-full border border-white/20" style={{ background: data.hex }} />
        <span className="font-bold text-primary tracking-widest uppercase">{data.name}</span>
      </div>
      <div className="space-y-1.5 text-muted-foreground">
        <div className="flex justify-between gap-6"><span>Diámetro NTA:</span> <span className="font-bold text-foreground">{data.size.toFixed(2)} nm</span></div>
        <div className="flex justify-between gap-6"><span>Color Real (HEX):</span> <code className="text-foreground">{data.hex}</code></div>
      </div>
    </div>
  );
}

const renderCircle = (props: any) => {
  const { cx, cy } = props;
  if (!cx || !cy) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5.5}
      fill="#06b6d4"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth={1.2}
      className="transition-all hover:scale-125 duration-200"
    />
  );
};

const renderTriangle = (props: any) => {
  const { cx, cy } = props;
  if (!cx || !cy) return null;
  return (
    <polygon
      points={`${cx},${cy - 5.5} ${cx - 5.5},${cy + 5.5} ${cx + 5.5},${cy + 5.5}`}
      fill="#3b82f6"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth={1.2}
      className="transition-all hover:scale-125 duration-200"
    />
  );
};

const renderSquare = (props: any) => {
  const { cx, cy } = props;
  if (!cx || !cy) return null;
  return (
    <rect
      x={cx - 5}
      y={cy - 5}
      width={10}
      height={10}
      fill="#a855f7"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth={1.2}
      className="transition-all hover:scale-125 duration-200"
    />
  );
};

function renderDot(props: any, color: string, shape: "circle" | "triangle" | "square") {
  const { cx, cy } = props;
  if (!cx || !cy) return null;
  
  if (shape === "circle") {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5.5}
        fill={color}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.2}
      />
    );
  }
  
  if (shape === "triangle") {
    return (
      <polygon
        points={`${cx},${cy - 5.5} ${cx - 5.5},${cy + 5.5} ${cx + 5.5},${cy + 5.5}`}
        fill={color}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.2}
      />
    );
  }
  
  if (shape === "square") {
    return (
      <rect
        x={cx - 5}
        y={cy - 5}
        width={10}
        height={10}
        fill={color}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.2}
      />
    );
  }
  
  return null;
}

function CalibrationPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"H" | "S" | "V" | "all">("H");
  const [sliderVal, setSliderVal] = useState<number>(50);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ptH: [number, number][] = useMemo(() => RAW.map(d => [d.nm, d.H]), []);
  const ptS: [number, number][] = useMemo(() => RAW.map(d => [d.nm, d.S]), []);
  const ptV: [number, number][] = useMemo(() => RAW.map(d => [d.nm, d.V]), []);

  // Generar puntos spline interpolados
  const splineDataH = useMemo(() => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      const nm = 20.70 + (i * (83.40 - 20.70)) / 99;
      points.push({ x: nm, y: catmullRom(ptH, nm), type: "spline" });
    }
    return points;
  }, [ptH]);

  const splineDataS = useMemo(() => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      const nm = 20.70 + (i * (83.40 - 20.70)) / 99;
      points.push({ x: nm, y: catmullRom(ptS, nm), type: "spline" });
    }
    return points;
  }, [ptS]);

  const splineDataV = useMemo(() => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      const nm = 20.70 + (i * (83.40 - 20.70)) / 99;
      points.push({ x: nm, y: catmullRom(ptV, nm), type: "spline" });
    }
    return points;
  }, [ptV]);

  // Datos de puntos experimentales (los 7 puntos reales)
  const rawDataH = useMemo(() => RAW.map(d => ({ x: d.nm, y: d.H, id: d.id, hex: d.hex, type: "raw" })), []);
  const rawDataS = useMemo(() => RAW.map(d => ({ x: d.nm, y: d.S, id: d.id, hex: d.hex, type: "raw" })), []);
  const rawDataV = useMemo(() => RAW.map(d => ({ x: d.nm, y: d.V, id: d.id, hex: d.hex, type: "raw" })), []);

  // Catmull-Rom Spline Interpolated values for the slider
  const interpolatedValues = useMemo(() => {
    const H = catmullRom(ptH, sliderVal);
    const S = catmullRom(ptS, sliderVal);
    const V = catmullRom(ptV, sliderVal);
    
    // Clamp to logical HSV bounds
    const Hc = Math.max(0, Math.min(360, H));
    const Sc = Math.max(0, Math.min(100, S));
    const Vc = Math.max(0, Math.min(100, V));
    const hex = hsvToHex(Hc, Sc, Vc);
    
    return { H: Hc, S: Sc, V: Vc, hex };
  }, [sliderVal, ptH, ptS, ptV]);

  const sizeVsSampleData = useMemo(() => {
    return RAW.map(d => ({
      name: `Muestra #${d.id}`,
      size: d.nm,
      hex: d.hex
    }));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8 sm:py-16 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] opacity-20 nl-aurora" />
      
      <header className="mb-10 fade-in-up">
        <div className="text-[10px] font-mono tracking-[0.2em] text-primary uppercase mb-2">Análisis óptico · HSV</div>
        <h1 className="text-4xl font-semibold text-foreground flex items-center gap-3">
          <LineChartIcon className="h-8 w-8 text-primary" />
          <span>Color de Nanopartículas vs. Diámetro</span>
        </h1>
        <p className="mt-2 text-muted-foreground text-lg max-w-2xl">
          Interpolación spline cúbica (Catmull-Rom) sobre 7 muestras. Desplaza el control para estimar parámetros HSV a diámetros intermedios.
        </p>
      </header>

      {/* Main Spline Curves Card */}
      <Card className="p-4 sm:p-8 nl-card relative overflow-hidden fade-in-up-delay-1 border-primary/20">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Activity className="w-32 h-32 text-primary nl-pulse" />
        </div>
        <div className="absolute inset-0 nl-grid-bg opacity-[0.15] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-foreground flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span>Curvas de Parámetros HSV</span>
            </h3>
            
            {/* Tabs Selector */}
            <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-xl border border-border/50 backdrop-blur-md">
              <Button
                size="sm"
                variant={activeTab === "H" ? "default" : "ghost"}
                onClick={() => setActiveTab("H")}
                className={`h-8 px-3 text-xs rounded-lg transition-all ${
                  activeTab === "H" 
                    ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Hue H°
              </Button>
              <Button
                size="sm"
                variant={activeTab === "S" ? "default" : "ghost"}
                onClick={() => setActiveTab("S")}
                className={`h-8 px-3 text-xs rounded-lg transition-all ${
                  activeTab === "S" 
                    ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Saturación S%
              </Button>
              <Button
                size="sm"
                variant={activeTab === "V" ? "default" : "ghost"}
                onClick={() => setActiveTab("V")}
                className={`h-8 px-3 text-xs rounded-lg transition-all ${
                  activeTab === "V" 
                    ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Valor V%
              </Button>
              <Button
                size="sm"
                variant={activeTab === "all" ? "default" : "ghost"}
                onClick={() => setActiveTab("all")}
                className={`h-8 px-3 text-xs rounded-lg transition-all ${
                  activeTab === "all" 
                    ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Todas
              </Button>
            </div>
          </div>

          {/* Adaptive Legends */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-mono text-muted-foreground/80 pb-3 border-b border-border/30">
            {(activeTab === "all" || activeTab === "H") && (
              <div className="flex items-center gap-2">
                <div className="h-[2px] w-5 rounded-full" style={{ background: "#06b6d4" }} />
                <div className="h-2.5 w-2.5 rounded-full border border-white/20" style={{ background: "#06b6d4" }} />
                <span>Matiz Hue H° (Celeste Neón · Círculo)</span>
              </div>
            )}
            {(activeTab === "all" || activeTab === "S") && (
              <div className="flex items-center gap-2">
                <div className="h-[2px] w-5 rounded-full" style={{ background: "#3b82f6" }} />
                <div className="h-2.5 w-2.5" style={{ background: "#3b82f6", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
                <span>Saturación S% (Azul Real · Triángulo)</span>
              </div>
            )}
            {(activeTab === "all" || activeTab === "V") && (
              <div className="flex items-center gap-2">
                <div className="h-[2px] w-5 rounded-full" style={{ background: "#a855f7" }} />
                <div className="h-2.5 w-2.5 border border-white/20" style={{ background: "#a855f7" }} />
                <span>Brillo Valor V% (Índigo Púrpura · Cuadrado)</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-white/40 border border-white/20" />
              <span>Mediciones Experim.</span>
            </div>
          </div>

          {/* Responsive Recharts Area */}
          <div className="h-85 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: -25 }} data={
                  activeTab === "H" ? rawDataH :
                  activeTab === "S" ? rawDataS :
                  activeTab === "V" ? rawDataV :
                  [...rawDataH.map((d, i) => ({ ...d, type: "H", y: d.y })),
                   ...rawDataS.map((d, i) => ({ ...d, type: "S", y: d.y + 0.1 })),
                   ...rawDataV.map((d, i) => ({ ...d, type: "V", y: d.y + 0.2 }))]
                }>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Diámetro"
                    unit=" nm"
                    domain={[18, 86]}
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "monospace" }}
                    label={{
                      value: "DIÁMETRO DE NANOPARTÍCULA (nm)",
                      position: "insideBottom",
                      offset: -10,
                      fill: "rgba(255,255,255,0.4)",
                      fontSize: 9,
                      fontFamily: "monospace",
                      letterSpacing: "0.08em"
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Valor"
                    domain={[0, 100]}
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "monospace" }}
                  />
                  <Tooltip content={<CustomChartTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.1)" }} />
                  
                  {/* Hue Points */}
                  {(activeTab === "H" || activeTab === "all") && (
                    <Scatter
                      name="Hue"
                      data={rawDataH}
                      fill="none"
                      shape={(props) => renderDot(props, "#06b6d4", "circle")}
                    />
                  )}

                  {/* Saturation Points */}
                  {(activeTab === "S" || activeTab === "all") && (
                    <Scatter
                      name="Saturación"
                      data={rawDataS}
                      fill="none"
                      shape={(props) => renderDot(props, "#3b82f6", "triangle")}
                    />
                  )}

                  {/* Value Points */}
                  {(activeTab === "V" || activeTab === "all") && (
                    <Scatter
                      name="Valor"
                      data={rawDataV}
                      fill="none"
                      shape={(props) => renderDot(props, "#a855f7", "square")}
                    />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-widest text-primary animate-pulse">
                Cargando curvas de calibración...
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Slider / Real-Time Spline Interpolator Card */}
      <Card className="mt-8 p-6 sm:p-8 nl-card relative overflow-hidden border-primary/20 fade-in-up-delay-2">
        <div className="absolute inset-0 nl-grid-bg opacity-[0.10] pointer-events-none" />
        
        <h3 className="text-sm font-mono uppercase tracking-widest text-foreground mb-6 flex items-center gap-2 relative z-10">
          <Activity className="h-4 w-4 text-primary" />
          <span>Análisis de Punto Intermedio</span>
        </h3>

        <div className="flex flex-col gap-6 relative z-10">
          {/* Interactive slider bar */}
          <div className="flex flex-wrap items-center gap-6 bg-black/40 p-4 rounded-xl border border-border/30 backdrop-blur-sm">
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground min-w-[80px] select-none">Diámetro</label>
            <input
              type="range"
              min="20.7"
              max="83.4"
              step="0.1"
              value={sliderVal}
              onChange={(e) => setSliderVal(parseFloat(e.target.value))}
              className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-primary bg-secondary/50 focus:outline-none"
            />
            <span className="text-xl font-bold font-display text-primary select-none w-28 text-right font-mono">
              {sliderVal.toFixed(1)} <span className="text-xs font-sans font-normal text-muted-foreground/80">nm</span>
            </span>
          </div>

          {/* Interpolated HSV Outputs grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-secondary/20 p-4 rounded-xl border border-border/20 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80 mb-1 flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ background: "#06b6d4" }} />
                Hue H° (Matiz)
              </div>
              <div className="text-2xl font-bold text-foreground font-display">{interpolatedValues.H.toFixed(1)}°</div>
            </div>
            <div className="bg-secondary/20 p-4 rounded-xl border border-border/20 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80 mb-1 flex items-center gap-1.5">
                <div className="w-2.5 h-2.5" style={{ background: "#3b82f6", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
                Saturación S%
              </div>
              <div className="text-2xl font-bold text-foreground font-display">{interpolatedValues.S.toFixed(1)}%</div>
            </div>
            <div className="bg-secondary/20 p-4 rounded-xl border border-border/20 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80 mb-1 flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 border border-white/10" style={{ background: "#a855f7" }} />
                Valor V% (Brillo)
              </div>
              <div className="text-2xl font-bold text-foreground font-display">{interpolatedValues.V.toFixed(1)}%</div>
            </div>
          </div>

          {/* Reconstructed Color Output Bar */}
          <div className="flex flex-wrap items-center gap-5 p-4 bg-secondary/30 rounded-xl border border-border/30 backdrop-blur-sm">
            <div 
              className="w-16 h-16 rounded-xl border border-white/20 shadow-glow transition-all duration-300 relative overflow-hidden"
              style={{ background: interpolatedValues.hex }}
            >
              <div className="absolute inset-0 shadow-[inset_0_0_12px_rgba(0,0,0,0.5)]" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-foreground tracking-wider uppercase font-mono">{interpolatedValues.hex}</div>
              <div className="text-xs text-muted-foreground/85">Color HSV reconstruido (estimación por Catmull-Rom Spline)</div>
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground/50 border-t border-border/20 pt-4 leading-relaxed font-mono">
            <strong>Nota metodológica:</strong> Interpolación mediante spline cúbica de Catmull-Rom sobre los 7 puntos medidos (M5 a M7, ordenados por diámetro creciente). Los valores fuera del rango medido (20.7–83.4 nm) requieren extrapolación y conllevan mayor incertidumbre experimental.
          </div>
        </div>
      </Card>

      {/* Experimental data table card */}
      <Card className="mt-8 overflow-hidden nl-card border-border/50 fade-in-up-delay-3">
        <div className="border-b border-border/50 bg-secondary/30 p-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-mono uppercase tracking-widest text-foreground">Registro de Muestras Experimentales (Dataset)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/20 text-[10px] uppercase tracking-wider text-muted-foreground/85">
              <tr>
                <th className="px-5 py-4 border-b border-border/50">Muestra</th>
                <th className="px-5 py-4 border-b border-border/50 text-right">nm</th>
                <th className="px-5 py-4 border-b border-border/50 text-right">Hue H°</th>
                <th className="px-5 py-4 border-b border-border/50 text-right">Sat S%</th>
                <th className="px-5 py-4 border-b border-border/50 text-right">Val V%</th>
                <th className="px-5 py-4 border-b border-border/50">Coloración (HEX)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {RAW.map((d) => (
                <tr 
                  key={d.id} 
                  onClick={() => setSliderVal(d.nm)}
                  className="hover:bg-primary/5 transition-colors cursor-pointer group"
                  title="Haz clic para cargar este diámetro en el interpolador interactivo"
                >
                  <td className="px-5 py-3 font-bold text-primary group-hover:text-primary-hover">#{d.id}</td>
                  <td className="px-5 py-3 text-right text-foreground">{d.nm.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-foreground">{d.H}°</td>
                  <td className="px-5 py-3 text-right text-foreground">{d.S}%</td>
                  <td className="px-5 py-3 text-right text-foreground">{d.V}%</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-md border border-white/20 shadow-[inset_0_0_5px_rgba(0,0,0,0.5)]" style={{ background: d.hex }} />
                      <code className="text-muted-foreground group-hover:text-foreground transition-colors">{d.hex}</code>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Distribución de Tamaños por Muestra */}
      <Card className="mt-8 p-6 sm:p-8 nl-card relative overflow-hidden border-border/50 fade-in-up-delay-3">
        <div className="absolute inset-0 nl-grid-bg opacity-[0.10] pointer-events-none" />
        <h3 className="text-sm font-mono uppercase tracking-widest text-foreground mb-6 flex items-center gap-2 relative z-10">
          <LineChartIcon className="h-4 w-4 text-primary" />
          <span>Distribución de Tamaños por Muestra</span>
        </h3>
        <div className="h-80 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sizeVsSampleData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "monospace" }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "monospace" }}
                unit=" nm"
              />
              <Tooltip content={<CustomSizeTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="size" radius={[6, 6, 0, 0]} maxBarSize={50}>
                {sizeVsSampleData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.hex} 
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={1}
                    className="transition-all duration-300 hover:opacity-85 hover:scale-[1.02]"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
