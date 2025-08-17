// api/awq.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { initData, comment, bags } = req.body;

    if (!initData) {
      return res.status(400).json({ ok: false, error: "initData is required" });
    }

    // Твой Telegram токен и admin_id должны быть в переменных окружения Vercel
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_ID = process.env.ADMIN_ID;

    if (!BOT_TOKEN || !ADMIN_ID) {
      return res.status(500).json({ ok: false, error: "BOT_TOKEN or ADMIN_ID missing" });
    }

    // Формируем сообщение
    const text = `
📝 Новая заявка!
InitData: ${initData}
Комментарий: ${comment || "—"}
Кол-во сумок: ${bags || "—"}
`;

    // Отправляем в Telegram
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const tgResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text,
        parse_mode: "HTML"
      }),
    });

    const tgResult = await tgResponse.json();

    if (!tgResult.ok) {
      return res.status(500).json({ ok: false, error: tgResult.description });
    }

    return res.status(200).json({ ok: true, result: tgResult });

  } catch (err) {
    console.error("Error in /api/awq:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

