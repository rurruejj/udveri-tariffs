export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" 
});
  }

  try {
    const { initData } = req.body || {};

    if (!initData) {
      return res.status(400).json({ ok: false, error: "bad args" });
    }

    const profile = (globalThis._profiles && 
globalThis._profiles[initData]) || {};
    return res.status(200).json({ ok: true, profile });
  } catch (err) {
    console.error("get_profile error:", err);
    return res.status(500).json({ ok: false, error: "server error" });
  }
}

