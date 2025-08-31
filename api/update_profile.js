kexport default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" 
});
  }

  try {
    const { initData, profile } = req.body || {};

    if (!initData || !profile) {
      return res.status(400).json({ ok: false, error: "bad args" });
    }

    // сохраняем профили в глобальной памяти
    if (!globalThis._profiles) {
      globalThis._profiles = {};
    }

    globalThis._profiles[initData] = profile;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("update_profile error:", err);
    return res.status(500).json({ ok: false, error: "server error" });
  }
}

