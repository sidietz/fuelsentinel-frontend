import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "fuelsentinel - Kraftstoffpreise im Überblick",
  description: "Unabhängige Beobachtung und Analyse deutscher Kraftstoffpreise (Diesel, Super E5, Super E10) über verschiedene Regionen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
