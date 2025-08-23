export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { initData, bags, comment, profile } = req.body || {};

    if (!initData || !bags) {
      return res.status(400).json({ ok: false, error: "bad args" });
    }

    // Разбираем initData от Telegram Mini App (user лежит в query-параметре)
    let user = null;
    try {
      const params = new URLSearchParams(initData);
      const userRaw = params.get("user");
      user = userRaw ? JSON.parse(userRaw) : null;
    } catch (e) {
      user = null;
    }

    const uname =
      (user && user.username) ? `@${user.username}` :
      (user && user.id) ? `<a href="tg://user?id=${user.id}">${(user.first_name || "пользователь")}</a>` :
      "—";

    const safe = (v) => (v == null || v === "") ? "—" : String(v);

    const p = profile || {};
    const addrParts = [];
    if (p.street)   addrParts.push(p.street);
    if (p.house)    addrParts.push(`д.${p.house}`);
    if (p.flat)     addrParts.push(`кв.${p.flat}`);
    if (p.entrance) addrParts.push(`подъезд ${p.entrance}`);
    if (p.floor)    addrParts.push(`этаж ${p.floor}`);
    const address = addrParts.length ? addrParts.join(", ") : "—";

    const text =
`🧺 <b>Заявка</b>
👤 Пользователь: ${uname}
📛 Имя: ${safe(p.first_name || (user && user.first_name))}
📞 Телефон: ${safe(p.phone)}
📍 Адрес: ${address}

📦 Кол-во сумок: <b>${parseInt(bags,10) || 1}</b>
💬 Комментарий: ${safe(comment)}
`;

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_ID  = process.env.ADMIN_ID; // <- как просил

    if (!BOT_TOKEN || !ADMIN_ID) {
      return res.status(500).json({ ok: false, error: "server config" });
    }

    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const payload = {
      chat_id: ADMIN_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    };

    const r = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const j = await r.json();
    if (!j.ok) {
      return res.status(502).json({ ok: false, error: "telegram send failed", tg: j });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("awq error:", err);
    return res.status(500).json({ ok: false, error: "server error" });
  }
}

