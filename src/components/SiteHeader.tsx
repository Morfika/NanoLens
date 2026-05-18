import { Link } from "@tanstack/react-router";
import { Atom, Menu, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/", label: "Inicio" },
  { to: "/analyzer", label: "Analizador" },
  { to: "/calibration", label: "Curva" },
  { to: "/guide", label: "Guía" },
  { to: "/about", label: "Sobre" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 text-primary shadow-[0_0_24px_-6px_var(--primary)]">
            <Atom className="h-5 w-5 nl-spin-slow" />
          </span>
          <span className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold tracking-tight text-foreground">NanoLens</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">v2.0</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              activeProps={{ className: "rounded-lg px-3 py-2 text-sm font-semibold text-primary bg-primary/10 shadow-[inset_0_0_0_1px_var(--primary)]" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          aria-label="Abrir menú"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-white/5 md:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-white/5"
                activeProps={{ className: "rounded-md px-3 py-2.5 text-sm font-semibold text-primary bg-primary/10" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
