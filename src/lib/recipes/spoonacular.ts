/**
 * Spoonacular adapter (Build-out folder 01 — source 1 of 3).
 *
 * Talks to the Spoonacular API and maps its responses into our ONE normalized
 * Recipe format. Nothing outside this file should know Spoonacular's field names.
 *
 * Runs SERVER-SIDE ONLY (API routes / server components) so the key is never
 * exposed to the browser.
 *
 * Legal note: Spoonacular data may be cached for at most 1 hour and never stored
 * permanently (see CLAUDE.md). We do not persist it anywhere.
 */

import type { Recipe, RecipeCard, Ingredient, Step } from "./types";

const BASE = "https://api.spoonacular.com";

function apiKey(): string {
  const key = process.env.SPOONACULAR_API_KEY;
  if (!key) {
    throw new Error(
      "SPOONACULAR_API_KEY is not set. Copy .env.local.example to .env.local and add your key."
    );
  }
  return key;
}

async function spoonacularGet(
  path: string,
  params: Record<string, string | number | boolean>
): Promise<unknown> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  url.searchParams.set("apiKey", apiKey());

  // Cache at most 1 hour to respect Spoonacular's terms.
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (res.status === 402) {
    throw new Error("Spoonacular daily quota reached. Try again tomorrow or upgrade the plan.");
  }
  if (res.status === 401) {
    throw new Error("Spoonacular rejected the API key (401). Check SPOONACULAR_API_KEY in .env.local.");
  }
  if (!res.ok) {
    throw new Error(`Spoonacular request failed (${res.status}) for ${path}`);
  }
  return res.json();
}

/* ------------------------------------------------------------------ *
 * Mapping helpers: Spoonacular shape -> our normalized shape.
 * ------------------------------------------------------------------ */

// Spoonacular has no star rating. It exposes `spoonacularScore` (0–100) and
// `aggregateLikes`. We surface score as 0–5 stars and likes as the count so the
// UI has something honest to show. Documented here so it isn't mistaken for a
// real user star rating.
function scoreToStars(score: unknown): number | null {
  if (typeof score !== "number") return null;
  return Math.round((score / 100) * 5 * 10) / 10; // one decimal, 0–5
}

function mapIngredients(extended: unknown): Ingredient[] {
  if (!Array.isArray(extended)) return [];
  return extended.map((raw): Ingredient => {
    const i = raw as Record<string, unknown>;
    const measures = i.measures as Record<string, unknown> | undefined;
    const us = measures?.us as Record<string, unknown> | undefined;
    return {
      amount: typeof us?.amount === "number" ? us.amount : num(i.amount),
      unit: typeof us?.unitShort === "string" ? us.unitShort : str(i.unit),
      item: str(i.nameClean ?? i.name),
      original: typeof i.original === "string" ? i.original : undefined,
    };
  });
}

function mapStepsAndEquipment(analyzedInstructions: unknown): {
  steps: Step[];
  equipment: string[];
} {
  const steps: Step[] = [];
  const equipmentSet = new Set<string>();

  if (Array.isArray(analyzedInstructions)) {
    for (const block of analyzedInstructions) {
      const blockSteps = (block as Record<string, unknown>).steps;
      if (!Array.isArray(blockSteps)) continue;
      for (const s of blockSteps) {
        const step = s as Record<string, unknown>;
        steps.push({ order: steps.length + 1, text: str(step.step) });
        if (Array.isArray(step.equipment)) {
          for (const e of step.equipment) {
            const name = str((e as Record<string, unknown>).name);
            if (name) equipmentSet.add(name);
          }
        }
      }
    }
  }
  return { steps, equipment: [...equipmentSet] };
}

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}
function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** Map a full Spoonacular recipe-information object to our Recipe. */
export function mapRecipe(raw: unknown): Recipe {
  const r = raw as Record<string, unknown>;
  const { steps, equipment } = mapStepsAndEquipment(r.analyzedInstructions);
  const tags = [
    ...(Array.isArray(r.diets) ? (r.diets as string[]) : []),
    ...(Array.isArray(r.dishTypes) ? (r.dishTypes as string[]) : []),
  ];
  return {
    id: `spoonacular:${num(r.id)}`,
    source: "spoonacular",
    title: str(r.title),
    sourceUrl: str(r.sourceUrl) || str(r.spoonacularSourceUrl),
    image: typeof r.image === "string" ? r.image : null,
    rating: scoreToStars(r.spoonacularScore),
    ratingCount: typeof r.aggregateLikes === "number" ? r.aggregateLikes : null,
    servings: num(r.servings) || 1,
    totalTimeMinutes: typeof r.readyInMinutes === "number" ? r.readyInMinutes : null,
    ingredients: mapIngredients(r.extendedIngredients),
    equipment,
    steps,
    tags,
  };
}

function mapCard(raw: unknown): RecipeCard {
  const r = raw as Record<string, unknown>;
  return {
    id: `spoonacular:${num(r.id)}`,
    source: "spoonacular",
    title: str(r.title),
    image: typeof r.image === "string" ? r.image : null,
    rating: scoreToStars(r.spoonacularScore),
    ratingCount: typeof r.aggregateLikes === "number" ? r.aggregateLikes : null,
    totalTimeMinutes: typeof r.readyInMinutes === "number" ? r.readyInMinutes : null,
  };
}

/* ------------------------------------------------------------------ *
 * Public API used by the app's route handlers.
 * ------------------------------------------------------------------ */

/** Search top recipes for a query. Sorted by popularity ("top-rated"). */
export async function searchRecipes(query: string, number = 12): Promise<RecipeCard[]> {
  const data = (await spoonacularGet("/recipes/complexSearch", {
    query,
    number,
    sort: "popularity",
    addRecipeInformation: true,
  })) as Record<string, unknown>;

  const results = Array.isArray(data.results) ? data.results : [];
  return results.map(mapCard);
}

/** Full recipe by numeric Spoonacular id. */
export async function getRecipe(spoonacularId: number): Promise<Recipe> {
  const data = await spoonacularGet(`/recipes/${spoonacularId}/information`, {
    includeNutrition: false,
  });
  return mapRecipe(data);
}
