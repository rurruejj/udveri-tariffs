import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { initData, bags, comment, profile } = req.body;

    if (!initData || !bags) {
      return res.status(400).json({ ok: false, error: "bad args" });
    }

    // 🔹 Извлекаем профиль
    const username = profile?.username || "—";
    const firstName = profile?.first_name || "";
    const lastName = profile?.last_name || "";
    const phone = profile?.phone || "—";

    // 🔹 Текст заявки
    const text = `📝 Новая заявка!
👤 Пользователь: ${firstName} ${lastName} (@${username})
📞 Телефон: ${phone}
🛍 Кол-во сумок: ${bags}
💬 Комментарий: ${comment || "—"}
⚙️ InitData: ${initData}`;

    // 🔹 Отправляем в бота
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML"
      })
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Ошибка в awq.js:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}

