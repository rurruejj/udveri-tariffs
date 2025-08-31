import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" 
});
  }

  try {
    const { initData, profile } = req.body || {};
    if (!initData || !profile) {
      return res.status(400).json({ ok: false, error: "bad args" });
    }

    // Парсим initData чтобы получить user_id
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

    // Путь к файлу хранения
    const dbPath = path.join(process.cwd(), "api", "profiles.json");

    // Читаем текущие данные
    let profiles = {};
    if (fs.existsSync(dbPath)) {
      profiles = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    }

    // Сохраняем профиль по user.id
    profiles[user.id] = profile;
    fs.writeFileSync(dbPath, JSON.stringify(profiles, null, 2));

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("update_profile error:", err);
    return res.status(500).json({ ok: false, error: "server error" });
  }
}

