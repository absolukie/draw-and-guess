# Draw & Guess

A pass-and-play drawing guessing game for two players — one phone, take turns
drawing while the other guesses out loud. No account, no server, works offline.

## How to play

1. Open `index.html` (or the GitHub Pages link).
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
