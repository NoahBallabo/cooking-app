"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Recipe } from "@/lib/recipes/types";

/**
 * Cook Mode (Build-out folder 04). One step at a time, Next/Back, a progress
 * bar, a finish screen, and a collapsible ingredients reference. Tries to keep
 * the screen awake while cooking (Wake Lock API, where supported).
 */
export default function CookMode({
  recipe,
  recipeId,
}: {
  recipe: Recipe;
  recipeId: string;
}) {
  const steps = recipe.steps;
  const total = steps.length;
  const [index, setIndex] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const backHref = `/recipe/${encodeURIComponent(recipeId)}`;

  // Keep the screen awake while cooking (best-effort; ignored if unsupported).
  // Loosely typed so it never depends on a specific TS DOM lib version.
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);
  useEffect(() => {
    let released = false;
    async function requestWakeLock() {
      try {
        const nav = navigator as unknown as {
          wakeLock?: { request: (type: string) => Promise<{ release: () => Promise<void> }> };
        };
        if (nav.wakeLock) {
          wakeLockRef.current = await nav.wakeLock.request("screen");
        }
      } catch {
        /* no-op: not critical */
      }
    }
    requestWakeLock();
    const onVisibility = () => {
      if (document.visibilityState === "visible" && !released) requestWakeLock();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisibility);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, []);

  if (total === 0) {
    return (
      <div className="cook">
        <p className="notice">This recipe doesn&apos;t have step-by-step instructions.</p>
        <Link className="btn secondary" href={backHref}>← Back to recipe</Link>
      </div>
    );
  }

  const finished = index >= total;
  const step = finished ? null : steps[index];
  const progress = Math.round((Math.min(index, total) / total) * 100);

  return (
    <div className="cook">
      <div className="cook-top no-print">
        <Link href={backHref} className="cook-exit">✕ Exit</Link>
        <span className="cook-title">{recipe.title}</span>
      </div>

      <div className="cook-progress-track">
        <div className="cook-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {finished ? (
        <div className="cook-stage cook-done">
          <div className="cook-check">✓</div>
          <h2>All done!</h2>
          <p>You&apos;ve finished every step of {recipe.title}. Enjoy your meal.</p>
          <div className="cook-actions">
            <button className="btn secondary" onClick={() => setIndex(0)}>Start over</button>
            <Link className="btn" href={backHref}>Back to recipe</Link>
          </div>
        </div>
      ) : (
        <div className="cook-stage">
          <div className="cook-step-count">Step {index + 1} of {total}</div>
          <p className="cook-step-text">{step!.text}</p>
          <div className="cook-actions">
            <button
              className="btn secondary"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
            >
              ← Back
            </button>
            <button className="btn" onClick={() => setIndex((i) => i + 1)}>
              {index === total - 1 ? "Finish ✓" : "Next →"}
            </button>
          </div>
        </div>
      )}

      {recipe.ingredients.length > 0 && (
        <div className="cook-ingredients no-print">
          <button className="cook-ing-toggle" onClick={() => setShowIngredients((s) => !s)}>
            {showIngredients ? "Hide" : "Show"} ingredients ({recipe.ingredients.length})
          </button>
          {showIngredients && (
            <ul className="ingredient-list">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>
                  {[ing.amount ? trim(ing.amount) : "", ing.unit, ing.item]
                    .filter(Boolean)
                    .join(" ")}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function trim(n: number): string {
  return String(Math.round(n * 100) / 100);
}
