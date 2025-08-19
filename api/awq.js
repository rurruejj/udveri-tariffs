export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { initData, bags, comment, profile } = req.body || {};

  if (!initData || !bags) {
    return res.status(400).json({ ok: false, error: "bad args" });
  }

  // Достаём данные пользователя из profile (ты передаёшь их при заполнении профиля)
  const name = profile?.first_name || profile?.name || "—";
  const username = profile?.username ? `@${profile.username}` : "—";
  const phone = profile?.phone || "—";

  const addressParts = [];
  if (profile?.street) addressParts.push(profile.street);
  if (profile?.house) addressParts.push(`д. ${profile.house}`);
  if (profile?.flat) addressParts.push(`кв. ${profile.flat}`);
  if (profile?.entrance) addressParts.push(`подъезд ${profile.entrance}`);
  if (profile?.floor) addressParts.push(`этаж ${profile.floor}`);
  const address = addressParts.length ? addressParts.join(", ") : "—";

  // Формируем текст заявки
  const text = `📝 Новая заявка!
👤 Имя: ${name}
🔗 Username: ${username}
📞 Телефон: ${phone}
🏠 Адрес: ${address}

Кол-во сумок: ${bags}
Комментарий: ${comment || "—"}

InitData: ${initData}
`;

  try {
    const resp = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.ADMIN_ID,
          text,
        }),
      }
    );

    const data = await resp.json();
    console.log("Ответ Telegram:", data);

    if (!data.ok) {
      return res.status(500).json({ ok: false, error: data.description });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Ошибка:", err);
    return res.status(500).json({ ok: false, error: "server error" });
  }
}

