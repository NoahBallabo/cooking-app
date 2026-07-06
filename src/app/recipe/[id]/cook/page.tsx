import Link from "next/link";
import { getRecipe } from "@/lib/recipes/spoonacular";
import type { Recipe } from "@/lib/recipes/types";
import CookMode from "./CookMode";

/**
 * Cook Mode (Build-out folder 04) — step-by-step guided cooking.
 * Server component: fetches the normalized recipe, then hands it to the client
 * CookMode component that walks through one step at a time.
 */
export default async function CookPage({
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

  return <CookMode recipe={recipe} recipeId={decoded} />;
}
