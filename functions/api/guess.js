// Cloudflare Pages Function: POST /api/guess
// Proxies a canvas snapshot to Gemini and returns the AI's one-word guess.
// Needs a GEMINI_KEY environment variable set in the Pages project settings.
// Optional: GEMINI_MODEL to override the model (default gemini-2.5-flash).
export async function onRequestPost(context) {
  try {
    const key = context.env.GEMINI_KEY;
    if (!key) return Response.json({ error: "missing_key" }, { status: 500 });
    const { image, words } = await context.request.json();
    if (!image || !words || !words.length) {
      return Response.json({ error: "bad_request" }, { status: 400 });
    }
    const img = String(image);
    const b64 = img.includes(",") ? img.split(",")[1] : img;
    const model = context.env.GEMINI_MODEL || "gemini-3.8-flash";
    const list = words.slice(0, 200).join(", ");
    const prompt =
      "You are playing a drawing guessing game. The image is a quick doodle drawn on a white canvas. " +
      "It depicts exactly one of these words: " + list + ". " +
      "Reply with ONLY the single word from the list (exactly as written, the part before any parenthesis) " +
      "that the drawing most likely shows. No other text, no quotes, no punctuation.";
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(key),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: b64 } }] }],
          generationConfig: { maxOutputTokens: 50, temperature: 0.3, thinkingConfig: { thinkingBudget: 0 } }
        })
      }
    );
    if (!r.ok) return Response.json({ error: "ai_error", status: r.status }, { status: 502 });
    const j = await r.json();
    const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
    const guess = parts.map(p => p.text || "").join("").trim().split("\n")[0].replace(/["'“”‘’.!?]/g, "").trim();
    return Response.json({ guess });
  } catch (e) {
    return Response.json({ error: "proxy_error" }, { status: 500 });
  }
}
