// Cloudflare Pages Function: GET /api/config
// Serves the public Firebase web config from environment variables so no
// keys are committed to the repo. (Firebase web keys are public by design —
// they ship to every browser — but they don't belong in git history.)
// Set these in the Pages project settings (Production env):
//   FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_DATABASE_URL,
//   FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET,
//   FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID
export async function onRequestGet(context) {
  const e = context.env;
  const cfg = {
    apiKey: e.FIREBASE_API_KEY || "",
    authDomain: e.FIREBASE_AUTH_DOMAIN || "",
    databaseURL: e.FIREBASE_DATABASE_URL || "",
    projectId: e.FIREBASE_PROJECT_ID || "",
    storageBucket: e.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: e.FIREBASE_MESSAGING_SENDER_ID || "",
    appId: e.FIREBASE_APP_ID || "",
  };
  if (!cfg.apiKey) {
    return Response.json({ error: "not_configured" }, { status: 500 });
  }
  return Response.json(cfg, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
