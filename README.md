# fuelsentinel v0.0.1

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3.3-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License: AGPL3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](LICENSE)

Modernisiertes Web-Dashboard für **fuelsentinel** — eine unabhängige Plattform zur kontinuierlichen Beobachtung und vergleichenden Marktanalyse deutscher Kraftstoffpreise (**Diesel**, **Super E5**, **Super E10**) über sechs strukturell unterschiedliche Regionen Deutschlands:
- **Aachen** (West)
- **Annaberg-Buchholz** (Erzgebirge)
- **Ansbach** (Franken)
- **Hamburg** (Metropole Nord)
- **Potsdam** (Ost)
- **Stuttgart** (Metropole Süd)

---

## 🌟 Highlights in Version 0.0.1

- **Vierstufige Zeitauflösung**:
  - **Jährlich** *(Standardansicht)* — Mehrjähriger Makrovergleich (2020–2024).
  - **Monatlich** — Gleitender 12-Monats-Verlauf.
  - **Wöchentlich** — Aggregation nach Kalenderwochen (KW).
  - **Täglich** — Tagesdurchschnittswerte je Region.
- **Interaktiver Kraftstoff-Chart (`FuelChart.tsx`)**:
  - Nahtloses Umschalten zwischen **Diesel**, **Super E5** und **Super E10**.
  - Interaktive Regionen-Filter zum Ein-/Ausblenden und Isolieren einzelner Städte.
  - Vertikaler Hover-Crosshair und Glassmorphism-Tooltip mit nach Preis sortierter Rangliste.
  - Reine, deklarative SVG-Implementierung mit kubischer Bézier-Glättung (100% kompatibel mit React 19 ohne veraltete DOM-Wrapper).
- **KPI-Metrik-Karten (`KpiCards.tsx`)**:
  - Aktuelle Durchschnittspreise für alle drei Kraftstoffsorten auf einen Blick.
  - 24h-Preistrendanzeige in Cent pro Liter.
  - Erkennung der günstigsten und teuersten Region mit Preisdifferenz.
- **Filterbare Preistabelle (`PriceTable.tsx`)**:
  - Dynamische Spaltenköpfe (**Jahr**, **Monat**, **Kalenderwoche (KW)**, **Datum**).
  - Ein-Klick-Filter ("Alle Regionen" oder Stadtauswahl).
  - Formatierte Währungsanzeige in Euro (`€ / L`).
- **Backend-Integration mit InfluxDB (`backend-new.py`)**:
  - Flask-Backend mit InfluxDB v2 Flux-Abfragen und Pandas-Aggregationen auf Port `63943`.
  - Next.js Proxy Route mit automatischer Fallback-Schicht für autarke Offline-Entwicklung.

---

## 🚀 Schnellstart

### 1. Frontend ausführen

```bash
cd new/frontend

# Abhängigkeiten installieren (falls noch nicht geschehen)
npm install

# Entwicklungsserver starten
npm run dev
```

Die Anwendung ist im Browser unter **[http://localhost:3000](http://localhost:3000)** erreichbar.

### 2. Backend starten (optional)

```bash
cd new/backend

# Flask-Server mit InfluxDB-Backend starten (Port 63943)
flask run -p 63943
# oder via uWSGI:
# uwsgi --ini uwsgi.ini
```

> **Hinweis zur Offline-Entwicklung**: Falls InfluxDB oder Flask lokal nicht aktiv sind, schaltet der Next.js Proxy automatisch auf realistische Referenzdaten um, sodass das Dashboard sofort voll funktionsfähig getestet werden kann.

### 3. Produktions-Build erstellen & ausführen

```bash
cd new/frontend
npm run build
npm run start
```

Der Produktionsserver startet standardmäßig auf Port **3002**: **[http://localhost:3002](http://localhost:3002)**.

---

## 📁 Projektstruktur

```
new/
├── backend/
│   ├── backend-new.py       # Flask REST API mit InfluxDB v2 Flux-Client (Port 63943)
│   ├── .flaskenv            # Konfiguriert FLASK_APP=backend-new.py
│   └── uwsgi.ini            # uWSGI Produktionskonfiguration
└── frontend/
    ├── app/
    │   ├── api/[...slug]/   # Smart Proxy Route Handler mit Offline-Mock-Fallback
    │   ├── layout.tsx       # Root Layout (System font stack, dark theme)
    │   └── page.tsx         # Dashboard Page (State-Koordination, Default: Jährlich)
    ├── components/
    │   ├── FuelChart.tsx    # Deklarativer, interaktiver SVG-Zeitserienchart
    │   ├── KpiCards.tsx     # KPI-Metrikkarten für Diesel, E5, E10
    │   ├── PriceTable.tsx   # Filterbare Preistabelle
    │   ├── Navbar.tsx       # Header mit Brand & Live-Statusindikator
    │   └── Footer.tsx       # Footer mit Links zu plantwatch.de & Impressum
    ├── lib/
    │   ├── api.ts           # Typisierte API-Client-Funktionen & Parser
    │   └── mockData.ts      # Mehrjährige, 12-monatige und tägliche Referenzdaten
    └── types/
        └── fuel.ts          # TypeScript Typdefinitionen
```

---

## 📜 Changelog & Versionierung

Dieses Projekt verwendet [Semantic Versioning (SemVer)](https://semver.org/). Detaillierte Versionsänderungen sind im [CHANGELOG.md](CHANGELOG.md) dokumentiert.

---

## 🤝 Danksagung & Kontext

fuelsentinel ist ein Open-Source-Projekt von Simon Dietz zur transparenten Beobachtung von Preisentwicklungen an deutschen Tankstellen.  
Weitere Informationen und verwandte Monitoring-Projekte finden Sie unter [plantwatch.de](https://plantwatch.de).
