# Draw & Guess

A drawing guessing game with three modes:

- 📱 **Same phone** — pass-and-play, take turns drawing while the other guesses out loud.
- 🌐 **Online** — room codes, each player on their own phone, live drawing sync via Firebase.
- 🤖 **Vs AI** — you draw, the AI guesses. Stump it to score!

## Vs AI mode (needs a free Gemini key)

The game snapshots your canvas every 10 seconds and asks Gemini which word from
the selected packs is being drawn. A tiny Cloudflare Pages Function
(`functions/api/guess.js`) proxies the request so the API key never touches the
phone — the browser only talks to `/api/guess` on the same site.

Setup (one time):

1. Get a free key at https://aistudio.google.com → **Get API key**.
2. Cloudflare dashboard → Pages → `draw-and-guess-103` → Settings →
   Environment variables → Production → add `GEMINI_KEY` = your key.
3. Redeploy (Deployments → ⋯ → Retry deployment) so the new variable takes effect.

Optional: set `GEMINI_MODEL` to override the model (default `gemini-2.5-flash`).

## How to play (same phone)

1. Open `index.html` (or the Cloudflare Pages link).
2. Enter player names, pick rounds / time per drawing / word packs.
3. Hand the phone to the drawer, tap to reveal the secret word (guesser looks away!).
4. Draw on the canvas before the timer runs out.
5. Tap **They got it!** when the guesser shouts the right answer, or **Skip**.
6. Alternate drawers each round — most points wins. 🏆

## Words

120 words across 4 packs: 🍕 Food & Drink, 🐶 Animals, 🏠 Everyday, 🏃 Actions.

## Run it

No build step — it's static HTML/CSS/JS. Serve it locally:

```bash
cd draw-and-guess && python3 -m http.server 8000
# open http://localhost:8000
```

Or enable GitHub Pages on the repo (Settings → Pages → Deploy from branch → main).
