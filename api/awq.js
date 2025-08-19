// api/awq.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { initData, bags, comment, first_name, street, house, flat, entrance, floor, phone } = req.body;

    if (!initData) {
      return res.status(400).json({ ok: false, error: "initData required" });
    }

    // Разбираем initData (Telegram WebApp данные)
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get("user");
    let user = {};
    if (userParam) {
      try {
        user = JSON.parse(decodeURIComponent(userParam));
      } catch (e) {
        console.error("Ошибка парсинга user:", e);
      }
    }

    // Формируем текст заявки
    const text =
`📝 Новая заявка!
👤 Имя: ${first_name || user.first_name || "—"}
🔗 Username: @${user.username || "—"}
📞 Телефон: ${phone || "—"}
📍 Адрес: ${[street, house ? "д. " + house : "", flat ? "кв. " + flat : "", entrance ? "подъезд " + entrance : "", floor ? "этаж " + floor : ""].filter(Boolean).join(", ") || "—"}

🛍 Кол-во сумок: ${bags || "—"}
💬 Комментарий: ${comment || "—"}`;

    // Отправляем админу
    const BOT_TOKEN = process.env.BOT_TOKEN || "ТОКЕН_ТВОЕГО_БОТА";
    const ADMIN_ID = process.env.ADMIN_ID || "ТВОЙ_CHAT_ID";

    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text,
        parse_mode: "HTML"
      })
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error("awq error:", e);
    return res.status(500).json({ ok: false, error: "server error" });
  }
}

