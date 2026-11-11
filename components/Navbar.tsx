"use client";

import React from "react";

export function Navbar() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            {/* Fuel pump SVG icon */}
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h10a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7h2a2 2 0 012 2v8a2 2 0 002 2h0"
              />
              <circle cx="9" cy="8" r="2" strokeWidth={2} />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 14h6"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                fuel<span className="text-amber-400">sentinel</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">
                v0.0.1
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Unabhängige Marktbeobachtung deutscher Kraftstoffpreise
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-300">Live Monitor</span>
          </div>

          <a
            href="https://plantwatch.de"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors hidden md:inline-flex items-center gap-1"
          >
            plantwatch.de
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}

