// Cloudflare Pages Function: POST /api/draw
// Asks Gemini for a simple cartoon of a word as JSON strokes, so the
// "AI draws, you guess" mode can animate the AI sketching on the canvas.
// Needs a GEMINI_KEY environment variable set in the Pages project settings.
// Optional: GEMINI_MODEL to override the model (default gemini-3.8-flash).
export async function onRequestPost(context) {
  try {
    const key = context.env.GEMINI_KEY;
    if (!key) return Response.json({ error: "missing_key" }, { status: 500 });
    const { word } = await context.request.json();
    if (!word || typeof word !== "string") {
      return Response.json({ error: "bad_request" }, { status: 400 });
    }
    const model = context.env.GEMINI_MODEL || "gemini-3.8-flash";
    const safe = word.slice(0, 60).replace(/["\\]/g, "");
    const prompt =
      `Draw a simple recognizable cartoon of "${safe}" on a 400x300 canvas ` +
      `(x goes 0-400 left to right, y goes 0-300 top to bottom). ` +
      `Reply with ONLY a JSON array of strokes. Each stroke is an array of ` +
      `[x,y] integer points. Use 6 to 14 simple strokes capturing the most ` +
      `recognizable features (outline first, then details). No other text, just the JSON array.`;
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" + model +
      ":generateContent?key=" + encodeURIComponent(key);
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
      },
    });
    // The model is occasionally overloaded; retry once after a short pause.
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (r.ok) {
        const j = await r.json().catch(() => ({}));
        const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
        const txt = parts.map((p) => p.text || "").join("").trim();
        const strokes = sanitize(txt);
        if (strokes && strokes.length) return Response.json({ strokes });
        return Response.json({ error: "bad_drawing" }, { status: 502 });
      }
      if (attempt === 0) await new Promise((res) => setTimeout(res, 2500));
    }
    return Response.json({ error: "ai_error" }, { status: 502 });
  } catch (e) {
    return Response.json({ error: "proxy_error" }, { status: 500 });
  }
}

// Parse and validate the model's stroke JSON. Returns null if unusable.
function sanitize(txt) {
  let arr;
  try {
    // tolerate the model wrapping the array in prose
    const m = txt.match(/\[[\s\S]*\]/);
    arr = JSON.parse(m ? m[0] : txt);
  } catch (e) {
    return null;
  }
  if (!Array.isArray(arr) || !arr.length) return null;
  const out = [];
  for (const s of arr.slice(0, 30)) {
    if (!Array.isArray(s) || s.length < 2) continue;
    const pts = [];
    for (const p of s.slice(0, 60)) {
      if (!Array.isArray(p) || p.length < 2) continue;
      const x = Math.round(Number(p[0])), y = Math.round(Number(p[1]));
      if (!isFinite(x) || !isFinite(y)) continue;
      pts.push([Math.min(400, Math.max(0, x)), Math.min(300, Math.max(0, y))]);
    }
    if (pts.length >= 2) out.push(pts);
  }
  return out.length >= 3 ? out : null;
}
