export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground sm:flex-row sm:px-8">
        <p>© {new Date().getFullYear()} NanoLens — AgNPs visual lab</p>
        <p>
          Universidad de los Andes · <span className="font-medium text-foreground">Nanotecnología</span>
        </p>
      </div>
    </footer>
  );
}
