# Deploy the Cooking App to the web (no terminal needed)

Goal: a live `https://….vercel.app` link you can open anywhere.
Path: **GitHub** (stores the code) → **Vercel** (hosts it, free). All in the browser.

---

## Step 1 — Make a GitHub account (~2 min)
1. Go to https://github.com/signup
2. Sign up with your email (firestrykerhd05@gmail.com), pick a username + password.
3. Verify your email when GitHub asks.

## Step 2 — Put the code on GitHub (~3 min)
1. Once logged in, go to https://github.com/new
2. Repository name: `cooking-app`. Leave it **Public** (or Private, either works). Don't add a README. Click **Create repository**.
3. On the next page, click the link **"uploading an existing file"**.
4. Open your `Cooking App / Source` folder on your computer. Select **everything inside it**
   (the `src` folder, `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`,
   `.env.local.example`, `README.md`) and **drag it all into the browser** upload area.
   - ⚠️ Do NOT upload `.env.local` (your real key). It's gitignored, so it shouldn't exist yet anyway.
5. Scroll down, click **Commit changes**.

## Step 3 — Make a Vercel account (~1 min)
1. Go to https://vercel.com/signup
2. Click **Continue with GitHub** and authorize it. (This links the two — no separate password.)

## Step 4 — Import & deploy (~2 min)
1. In Vercel, click **Add New… → Project**.
2. Find `cooking-app` in the list and click **Import**.
3. Vercel auto-detects **Next.js** — leave the build settings as-is.
4. Expand **Environment Variables** and add:
   - **Name:** `SPOONACULAR_API_KEY`
   - **Value:** your key (it's in `important info.md`)
5. Click **Deploy**. Wait ~1–2 minutes.
6. You get a live URL like `https://cooking-app-xxxx.vercel.app` — open it and search a recipe. 🎉

---

## After it's live
- **Changing the code:** edit files, upload the changed ones to GitHub again → Vercel auto-redeploys.
- **Custom domain** (e.g. a real name instead of `.vercel.app`) can be added later in Vercel settings.
- The free tier is plenty for now.
