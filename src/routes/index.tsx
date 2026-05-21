import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, Activity, ChevronDown, ScanLine, ShieldCheck, Zap, FlaskConical, Atom } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SPLINE_RAW as RAW } from "@/lib/splineUtils";
import { NanoParticleField } from "@/components/NanoParticleField";
import { motion, useScroll, useTransform, useSpring, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NanoLens — Caracteriza AgNPs con una foto" },
      { name: "description", content: "Estima el tamaño de tus nanopartículas de plata a partir del color de la muestra. Rápido, en el navegador, basado en una curva real de NTA y UV-Vis." },
    ],
  }),
  component: HomePage,
});

const HEADLINE = ["Caracteriza", "nanopartículas", "de", "plata", "con", "solo", "una", "foto."];

function Counter({ to, suffix = "", duration = 1.8 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  useEffect(() => {
    const controls = animate(mv, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = (to % 1 === 0 ? Math.round(v) : v.toFixed(1)).toString() + suffix;
      },
    });
    return controls.stop;
  }, [to, suffix, duration, mv]);
  return <span ref={ref}>0{suffix}</span>;
}

function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yShift = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Magnetic CTA
  const mx = useSpring(0, { stiffness: 200, damping: 18 });
  const my = useSpring(0, { stiffness: 200, damping: 18 });
  const onCtaMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width / 2) * 0.25);
    my.set((e.clientY - r.top - r.height / 2) * 0.25);
  };
  const onCtaLeave = () => { mx.set(0); my.set(0); };

  const [bootDone, setBootDone] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBootDone(true), 2200); return () => clearTimeout(t); }, []);

  return (
    <div className="relative overflow-x-hidden">
      {/* GLOBAL PARTICLE FIELD — covers hero */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[120vh] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="nl-aurora" />
        </div>
        <NanoParticleField className="absolute inset-0 h-full w-full" density={90} />
        <div className="absolute inset-0 nl-grid-bg opacity-40" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* HERO */}
      <section ref={heroRef} className="relative">
        <motion.div style={{ y: yShift, opacity: opacityHero }} className="mx-auto max-w-6xl px-6 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
          {/* BOOT BAR */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              LSPR engine · online
            </span>
            <TypewriterLine text="// inicializando espectro óptico Ag · 380nm → 480nm" delay={400} />
          </motion.div>

          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* LEFT */}
            <div className="lg:col-span-7">
              <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[5.2rem]">
                {HEADLINE.map((w, i) => {
                  const isAccent = w === "nanopartículas" || w === "plata";
                  return (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 40, filter: "blur(14px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-block pr-3"
                    >
                      {isAccent ? (
                        <span className="bg-gradient-to-r from-[oklch(0.85_0.15_220)] via-primary to-[oklch(0.70_0.20_290)] bg-clip-text text-transparent">
                          {w}
                        </span>
                      ) : (
                        w
                      )}
                    </motion.span>
                  );
                })}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              >
                Sube una imagen de tu muestra en solución y NanoLens estimará el rango de tamaño de tus AgNPs basándose en su color característico —{" "}
                <span className="font-mono text-primary">sin servidores, todo en tu navegador.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.7 }}
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                <motion.div onMouseMove={onCtaMove} onMouseLeave={onCtaLeave} style={{ x: mx, y: my }}>
                  <Button asChild size="lg" className="group relative gap-2 overflow-hidden rounded-xl bg-primary px-7 py-6 text-base font-semibold text-primary-foreground shadow-[0_0_55px_-8px_var(--primary)] transition-all hover:-translate-y-0.5 hover:bg-primary-hover">
                    <Link to="/analyzer">
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      <Camera className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:rotate-6" />
                      Analizar muestra
                    </Link>
                  </Button>
                </motion.div>
                <Button asChild size="lg" variant="outline" className="gap-2 rounded-xl border-white/15 bg-white/5 px-7 py-6 text-base font-medium text-foreground backdrop-blur-md hover:bg-white/10 hover:text-foreground">
                  <Link to="/calibration">
                    <Activity className="h-5 w-5" />
                    Ver curva
                  </Link>
                </Button>
              </motion.div>

              {/* LIVE METRICS */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.8 }}
                className="mt-12 grid grid-cols-3 gap-4 border-t border-border pt-6"
              >
                {[
                  { v: RAW.length, suf: "", label: "Pts calibración", icon: FlaskConical },
                  { v: 0.8, suf: "s", label: "Tiempo análisis", icon: Zap },
                  { v: 100, suf: "%", label: "En tu navegador", icon: ShieldCheck },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.7 + i * 0.1 }}
                    className="flex flex-col gap-1"
                  >
                    <s.icon className="h-4 w-4 text-primary" />
                    <div className="font-mono text-2xl font-semibold text-foreground tabular-nums">
                      {bootDone && <Counter to={s.v} suffix={s.suf} />}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — ORBITING AGNP SPHERE */}
            <div className="lg:col-span-5">
              <OrbitingSphere />
            </div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4 }}
          className="absolute inset-x-0 bottom-6 flex justify-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="flex flex-col items-center gap-2">
            scroll
            <ChevronDown className="h-3 w-3" />
          </motion.div>
        </motion.div>
      </section>

      {/* WAVELENGTH MARQUEE */}
      <section className="relative border-y border-border bg-background/40 py-6 backdrop-blur-xl">
        <div className="flex overflow-hidden">
          <div className="nl-marquee flex shrink-0 gap-12 pr-12 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {[...Array(2)].flatMap((_, k) =>
              RAW.map((c) => (
                <span key={`${k}-${c.id}`} className="inline-flex items-center gap-3 whitespace-nowrap">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.hex, boxShadow: `0 0 12px ${c.hex}` }} />
                  Muestra #{c.id} · {c.nm.toFixed(2)} nm · HSV({Math.round(c.H)}°, {Math.round(c.S)}%, {Math.round(c.V)}%)
                  <span className="text-primary">◆</span>
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
          <RevealOnScroll>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" /> Pipeline
              </span>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Cómo funciona</h2>
              <p className="mt-3 text-muted-foreground">Tres pasos. Sin instalar nada. Sin enviar tu muestra a la nube.</p>
            </div>
          </RevealOnScroll>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { icon: Camera, color: "oklch(0.72 0.18 235)", title: "1. Sube tu foto", text: "Arrastra una imagen o tómala con tu cámara. Recorta la zona de la solución.", code: "INPUT/IMAGE" },
              { icon: Activity, color: "oklch(0.75 0.16 200)", title: "2. Analizamos el color", text: "Extraemos color dominante, lo convertimos a HSV y lo comparamos con la curva.", code: "PROCESS/HSV" },
              { icon: ScanLine, color: "oklch(0.70 0.20 290)", title: "3. Obtienes el rango", text: "Tamaño estimado en nm, longitud de onda y nivel de confianza del resultado.", code: "OUTPUT/NM" },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8 }}
                className="nl-card nl-sweep group relative overflow-hidden p-7"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-60" style={{ background: s.color }} />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10" style={{ background: `color-mix(in oklab, ${s.color} 18%, transparent)`, color: s.color }}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{s.code}</div>
                  <h3 className="mt-1 text-xl font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SCIENTIFIC BASIS */}
      <section className="relative border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:px-8 sm:py-24">
          <Collapsible>
            <CollapsibleTrigger className="nl-card group flex w-full items-center justify-between p-6 text-left">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">LSPR · Localized Surface Plasmon Resonance</div>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">¿Por qué el color indica el tamaño?</h2>
              </div>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border bg-white/5 transition-colors group-hover:border-primary/40 group-hover:text-primary">
                <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="nl-card mt-3 p-6 text-sm leading-relaxed text-foreground/90">
              <p>
                Las nanopartículas metálicas como las de plata exhiben <strong className="text-primary">LSPR</strong>: los electrones de conducción oscilan colectivamente al interactuar con la luz visible. La longitud de onda a la que ocurre esta resonancia depende del tamaño, la forma, el medio dieléctrico y el grado de agregación.
              </p>
              <p className="mt-3">
                Para AgNPs esféricas en agua, partículas pequeñas (~10–20 nm) absorben cerca de 390–405 nm y se ven amarillas. A medida que el diámetro crece, el pico de absorbancia se desplaza hacia el rojo, pasando por naranja (~430–450 nm) hasta tonos rojizos/cafés (~470 nm o más) cuando hay agregación.
              </p>
              <p className="mt-3 text-muted-foreground">
                NanoLens aprovecha esta correlación: a partir del color visible, estimamos la longitud de onda dominante e inferimos el tamaño según una curva calibrada con NTA y UV-Vis.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>
    </div>
  );
}

/* --- Orbiting AgNP sphere --- */
function OrbitingSphere() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, rotateY: -30 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 1.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto aspect-square w-full max-w-[440px]"
    >
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 via-transparent to-[oklch(0.65_0.20_290)]/40 blur-3xl" />

      {/* Orbit rings */}
      {[0, 18, -22].map((tilt, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-white/10"
          style={{ transform: `rotateX(70deg) rotateZ(${tilt}deg)`, transformStyle: "preserve-3d" }}
        >
          <div className={`absolute inset-0 ${i % 2 === 0 ? "nl-orbit" : "nl-orbit-rev"}`}>
            {i === 0 ? (
              RAW.slice(0, 3).map((c, j) => (
                <div
                  key={c.id}
                  className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background: c.hex,
                    boxShadow: `0 0 24px 4px ${c.hex}`,
                    transform: `translateX(-50%) translateY(-50%) rotate(${j * 120}deg) translateY(0)`,
                  }}
                />
              ))
            ) : i === 1 ? (
              RAW.slice(3, 5).map((c, j) => (
                <div
                  key={c.id}
                  className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background: c.hex,
                    boxShadow: `0 0 24px 4px ${c.hex}`,
                    transform: `translateX(-50%) translateY(-50%) rotate(${j * 180}deg) translateY(0)`,
                  }}
                />
              ))
            ) : (
              RAW.slice(5, 7).map((c, j) => (
                <div
                  key={c.id}
                  className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background: c.hex,
                    boxShadow: `0 0 24px 4px ${c.hex}`,
                    transform: `translateX(-50%) translateY(-50%) rotate(${j * 180}deg) translateY(0)`,
                  }}
                />
              ))
            )}
          </div>
        </div>
      ))}

      {/* Core */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], rotate: [0, 360] }}
        transition={{ scale: { duration: 3.2, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 40, repeat: Infinity, ease: "linear" } }}
        className="absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 30%, oklch(0.95 0.05 230), oklch(0.55 0.20 235 50%, oklch(0.25 0.10 260) 100%)",
          boxShadow: "0 0 80px -10px oklch(0.72 0.18 235), inset 0 0 60px oklch(0.30 0.10 260 / 0.6)",
        }}
      >
        <Atom className="h-16 w-16 text-white/80 mix-blend-overlay nl-spin-slow" />
      </motion.div>

      {/* Floating data badges */}
      {RAW.map((c, i) => {
        const angle = (i / RAW.length) * Math.PI * 2;
        const radius = 48; // %
        const left = 50 + Math.cos(angle) * radius;
        const top = 50 + Math.sin(angle) * radius;
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 + i * 0.12, type: "spring", stiffness: 180, damping: 14 }}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-background/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-foreground backdrop-blur-md nl-float"
            style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${i * 0.5}s` }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: c.hex, boxShadow: `0 0 10px ${c.hex}` }} />
            {c.nm.toFixed(1)}nm
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* --- Typewriter --- */
function TypewriterLine({ text, delay = 0 }: { text: string; delay?: number }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0;
    let mounted = true;
    const start = setTimeout(() => {
      const id = setInterval(() => {
        if (!mounted) return;
        i++;
        setOut(text.slice(0, i));
        if (i >= text.length) clearInterval(id);
      }, 28);
    }, delay);
    return () => { mounted = false; clearTimeout(start); };
  }, [text, delay]);
  return <span className="text-muted-foreground/80">{out}<span className="ml-0.5 inline-block h-3 w-1.5 -translate-y-0.5 animate-pulse bg-primary align-middle" /></span>;
}

/* --- Reveal --- */
function RevealOnScroll({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
