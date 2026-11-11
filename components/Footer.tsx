import React from "react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/80 py-10 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-300">
            fuelsentinel <span className="font-normal text-slate-500">— Unabhängiger Kraftstoff-Monitor</span>
          </p>
          <p className="mt-1 text-slate-500">
            Erfassung und Auswertung regionaler Preisunterschiede in Deutschland.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-slate-400">
          <span>
            Von den Machern von{" "}
            <a
              href="https://plantwatch.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/40 transition-colors"
            >
              plantwatch.de
            </a>
          </span>

          <a
            href="https://plantwatch.de/plantwatch/impressum"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Impressum
          </a>

          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-500">
            Next.js 16 • Tailwind CSS
          </span>
        </div>
      </div>
    </footer>
  );
}

