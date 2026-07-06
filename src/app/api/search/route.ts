import { NextResponse } from "next/server";
import { searchRecipes } from "@/lib/recipes/spoonacular";

/**
 * GET /api/search?q=pancakes
 * Returns normalized RecipeCard[]. The frontend never talks to Spoonacular
 * directly — only to this route — so the API key stays server-side.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json({ error: "Missing query parameter ?q=" }, { status: 400 });
  }

  try {
    const results = await searchRecipes(q);
    return NextResponse.json({ query: q, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
