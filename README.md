# Cooking App — Source

Milestone 1: **search a dish → top-rated recipes → recipe view with ingredients, tools, time, a servings adjuster, and print.** Data comes from the Spoonacular API, mapped into one normalized recipe format (`src/lib/recipes/`).

## Run it (first time, ~2 minutes)

You need [Node.js](https://nodejs.org) 18.18+ installed. Then, in this `Source/` folder:

```bash
# 1. install dependencies
npm install

# 2. add your Spoonacular key
#    copy the example env file, then paste your key into it
cp .env.local.example .env.local
#    (Windows PowerShell: copy .env.local.example .env.local)
#    then open .env.local and set SPOONACULAR_API_KEY=...

# 3. start the dev server
npm run dev
```

Open http://localhost:3000 and search for a dish (e.g. "pancakes").

Your key is already saved in the project's `important info.md`. `.env.local` is gitignored so the key never gets committed.

## What's here

```
src/
  lib/recipes/
    types.ts          the ONE normalized recipe format (all sources map to this)
    spoonacular.ts    Spoonacular adapter (source 1 of 3) — server-side only
  app/
    api/search/route.ts        GET /api/search?q=  -> normalized results
    page.tsx                   search UI
    recipe/[id]/page.tsx       recipe detail (fetch)
    recipe/[id]/RecipeView.tsx servings adjuster + print (client)
```

## Notes
- **Spoonacular has no star ratings.** We show its 0–100 quality score as 0–5 stars and its "likes" as the count. Documented in `spoonacular.ts`.
- **Legal:** Spoonacular data is cached at most 1 hour (`revalidate: 3600`) and never stored permanently, per their terms.
- **Next milestones:** Cook Mode (folder 04), then scraping + community sources (folder 01), then accounts (05), etc. See `../Build-out/`.
