import Link from "next/link";
import { getRecipe } from "@/lib/recipes/spoonacular";
import type { Recipe } from "@/lib/recipes/types";
import RecipeView from "./RecipeView";

/**
 * Recipe detail (Build-out folder 03 — Recipe View & Scaling).
 * Server component: fetches the normalized recipe, then hands it to the client
 * RecipeView for the interactive servings adjuster / print.
 */
export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decoded = decodeURIComponent(id); // e.g. "spoonacular:715538"
  const [source, nativeId] = decoded.split(":");

  if (source !== "spoonacular" || !nativeId) {
    return (
      <div>
        <p className="notice error">Unsupported recipe id.</p>
        <Link className="btn secondary" href="/">← Back to search</Link>
      </div>
    );
  }

  let recipe: Recipe;
  try {
    recipe = await getRecipe(Number(nativeId));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load this recipe.";
    return (
      <div>
        <p className="notice error">{message}</p>
        <Link className="btn secondary" href="/">← Back to search</Link>
      </div>
    );
  }

  return <RecipeView recipe={recipe} />;
}
