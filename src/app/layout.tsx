import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cooking App",
  description: "Every recipe on the internet, in one searchable place.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">🍳 Cooking App</Link>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          Recipe data from Spoonacular. Milestone 1 — search &amp; view.
        </footer>
      </body>
    </html>
  );
}
