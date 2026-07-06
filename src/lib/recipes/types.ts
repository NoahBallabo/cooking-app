/**
 * THE ONE NORMALIZED RECIPE FORMAT (Build-out folder 01 — Recipe Data Layer).
 *
 * Every source (Spoonacular API, scraped sites, community submissions) must map
 * into these types. The rest of the app only ever sees `Recipe` — it never knows
 * or cares which source a recipe came from.
 */

export type RecipeSource = "spoonacular" | "scraped" | "community";

export interface Ingredient {
  /** Quantity for the recipe's BASE servings (see Recipe.servings). May be 0 if unknown. */
  amount: number;
  /** e.g. "cup", "g", "tbsp". Empty string if the ingredient has no unit ("2 eggs"). */
  unit: string;
  /** The ingredient itself, e.g. "all-purpose flour". */
  item: string;
  /** Original human-readable line, e.g. "1 1/2 cups all-purpose flour". Optional. */
  original?: string;
}

export interface Step {
  /** 1-based order. */
  order: number;
  text: string;
}

export interface Recipe {
  /** Stable id, namespaced by source, e.g. "spoonacular:715538". */
  id: string;
  source: RecipeSource;
  title: string;
  /** Link back to the original recipe (required for Spoonacular attribution). */
  sourceUrl: string;
  image: string | null;
  /** 0–5 stars, or null if the source has no rating. */
  rating: number | null;
  /** How many ratings/likes back the rating, or null. */
  ratingCount: number | null;
  /** The serving count the ingredient amounts are written for. */
  servings: number;
  totalTimeMinutes: number | null;
  ingredients: Ingredient[];
  /** Tools/equipment needed. May be empty if the source didn't provide any. */
  equipment: string[];
  steps: Step[];
  /** Diet/dish tags, e.g. ["vegetarian", "breakfast"]. */
  tags: string[];
}

/** Lightweight version for search-result cards (no ingredients/steps needed). */
export interface RecipeCard {
  id: string;
  source: RecipeSource;
  title: string;
  image: string | null;
  rating: number | null;
  ratingCount: number | null;
  totalTimeMinutes: number | null;
}
