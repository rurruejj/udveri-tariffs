export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { initData, bags, comment } = req.body;

    if (!initData || !bags) {
      return res.status(400).json({ ok: false, error: "bad args" });
    }

    // Разбираем initData
    const params = new URLSearchParams(initData);
    const userRaw = params.get("user");
    const user = userRaw ? JSON.parse(userRaw) : null;

    // Готовим текст заявки
    const text = `
📝 Новая заявка!
👤 Пользователь: @${user?.username || "—"}
📛 Имя: ${user?.first_name || ""} ${user?.last_name || ""}
🆔 ID: ${user?.id || "—"}

📦 Кол-во сумок: ${bags}
💬 Комментарий: ${comment || "—"}
    `;

    // Отправляем в Telegram
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      console.error("Ошибка отправки в Telegram:", tgData);
      return res.status(500).json({ ok: false, error: "telegram error", details: tgData });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Ошибка:", err);
    return res.status(500).json({ ok: false, error: "server error" });
  }
}

