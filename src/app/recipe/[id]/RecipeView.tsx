"use client";

import { useState } from "react";
import Link from "next/link";
import type { Recipe, Ingredient } from "@/lib/recipes/types";

/** Format a scaled amount tidily: 0.5 -> "1/2", 1.25 -> "1 1/4", 2 -> "2". */
function formatAmount(amount: number): string {
  if (!amount || amount <= 0) return "";
  const whole = Math.floor(amount);
  const frac = amount - whole;
  const fractions: [number, string][] = [
    [0.125, "1/8"], [0.25, "1/4"], [0.333, "1/3"], [0.5, "1/2"],
    [0.667, "2/3"], [0.75, "3/4"],
  ];
  let fracStr = "";
  let best = 0.05;
  for (const [value, label] of fractions) {
    if (Math.abs(frac - value) < best) {
      best = Math.abs(frac - value);
      fracStr = label;
    }
  }
  if (frac < 0.05) return String(whole);
  if (whole === 0) return fracStr || round2(amount);
  return fracStr ? `${whole} ${fracStr}` : round2(amount);
}
function round2(n: number): string {
  return String(Math.round(n * 100) / 100);
}

function scaledLine(ing: Ingredient, factor: number): string {
  const amount = ing.amount * factor;
  const amountStr = formatAmount(amount);
  return [amountStr, ing.unit, ing.item].filter(Boolean).join(" ").trim() || ing.item;
}

export default function RecipeView({ recipe }: { recipe: Recipe }) {
  const [servings, setServings] = useState(recipe.servings);
  const factor = recipe.servings > 0 ? servings / recipe.servings : 1;

  return (
    <div>
      <Link className="no-print" href="/" style={{ color: "var(--muted)" }}>
        ← Back to search
      </Link>

      <div className="recipe-head" style={{ marginTop: 12 }}>
        {recipe.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.image} alt={recipe.title} />
        )}
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1>{recipe.title}</h1>
          <div className="meta">
            {recipe.rating != null && <span>★ {recipe.rating.toFixed(1)}</span>}
            {recipe.ratingCount != null && <span>{recipe.ratingCount} likes</span>}
            {recipe.totalTimeMinutes != null && <span>⏱ {recipe.totalTimeMinutes} min</span>}
          </div>
          {recipe.tags.length > 0 && (
            <div className="pill-row">
              {recipe.tags.slice(0, 6).map((t) => (
                <span className="pill" key={t}>{t}</span>
              ))}
            </div>
          )}
          <div className="no-print" style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn" onClick={() => window.print()}>Print</button>
            <a className="btn secondary" href={recipe.sourceUrl} target="_blank" rel="noreferrer">
              Original source
            </a>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Ingredients</h2>
        <div className="servings-control no-print">
          <span>Servings:</span>
          <button aria-label="fewer servings" onClick={() => setServings((s) => Math.max(1, s - 1))}>−</button>
          <span className="count">{servings}</span>
          <button aria-label="more servings" onClick={() => setServings((s) => s + 1)}>+</button>
        </div>
        {recipe.ingredients.length > 0 ? (
          <ul className="ingredient-list">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>{scaledLine(ing, factor)}</li>
            ))}
          </ul>
        ) : (
          <p className="notice">No ingredient list available for this recipe.</p>
        )}
      </div>

      {recipe.equipment.length > 0 && (
        <div className="section">
          <h2>Tools</h2>
          <ul className="tool-list">
            {recipe.equipment.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="section">
        <h2>Steps</h2>
        {recipe.steps.length > 0 ? (
          <ol className="step-list">
            {recipe.steps.map((s) => (
              <li key={s.order}>{s.text}</li>
            ))}
          </ol>
        ) : (
          <p className="notice">No step-by-step instructions available for this recipe.</p>
        )}
        {/* Cook Mode (Build-out folder 04) lands in a later milestone. */}
      </div>
    </div>
  );
}
