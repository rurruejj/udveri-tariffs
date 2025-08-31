import fs from "fs";
import path from "path";

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

    let user = null;
    try {
      const params = new URLSearchParams(initData);
      const userRaw = params.get("user");
      user = userRaw ? JSON.parse(userRaw) : null;
    } catch (e) {
      user = null;
    }

    if (!user || !user.id) {
      return res.status(400).json({ ok: false, error: "no user" });
    }

    const dbPath = path.join(process.cwd(), "api", "profiles.json");

    let profiles = {};
    if (fs.existsSync(dbPath)) {
      profiles = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    }

    const profile = profiles[user.id] || null;

    return res.status(200).json({ ok: true, profile });
  } catch (err) {
    console.error("get_profile error:", err);
    return res.status(500).json({ ok: false, error: "server error" });
  }
}

