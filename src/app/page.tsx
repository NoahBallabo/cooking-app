"use client";

import { useState } from "react";
import Link from "next/link";
import type { RecipeCard } from "@/lib/recipes/types";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RecipeCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed.");
      setResults(data.results as RecipeCard[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="hero">
        <h1>What do you want to cook?</h1>
        <p>Search a dish and get top-rated recipes with full ingredients, tools, and time.</p>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="e.g. pancakes, chicken curry, margarita…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search for a dish"
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <p className="notice error">{error}</p>}

      {!error && searched && !loading && results && results.length === 0 && (
        <p className="notice">No recipes found for “{query}”. Try another dish.</p>
      )}

      {results && results.length > 0 && (
        <div className="grid">
          {results.map((r) => (
            <Link key={r.id} href={`/recipe/${encodeURIComponent(r.id)}`} className="card">
              {r.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.image} alt={r.title} />
              ) : (
                <div style={{ height: 150, background: "#eee" }} />
              )}
              <div className="card-body">
                <h3>{r.title}</h3>
                <div className="meta">
                  {r.rating != null && <span>★ {r.rating.toFixed(1)}</span>}
                  {r.totalTimeMinutes != null && <span>{r.totalTimeMinutes} min</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
