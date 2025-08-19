// api/awq.js
import fetch from "node-fetch";

const BOT_TOKEN = process.env.BOT_TOKEN || "8278093306:AAFbhmogmEOS-wVYGSDbIW45jD5jcxSX3ZE";
const ADMIN_ID = process.env.ADMIN_ID || "1851886180";

// для простоты: извлекаем user.id из initData
function extractUserId(initData) {
  try {
    const params = new URLSearchParams(initData);
    const userJson = params.get("user");
    if (!userJson) return null;
    const user = JSON.parse(userJson);
    return user.id;
  } catch (e) {
    console.error("extractUserId error", e);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }

  const { initData, bags, comment, street, house, flat, entrance, floor, city, phone } = req.body || {};

  if (!initData) {
    return res.status(400).json({ ok: false, error: "no initData" });
  }

  const userId = extractUserId(initData);

  if (!userId) {
    return res.status(400).json({ ok: false, error: "cannot extract userId" });
  }

  const addrParts = [];
  if (street) addrParts.push(street);
  if (house) addrParts.push(`д.${house}`);
  if (flat) addrParts.push(`кв.${flat}`);
  if (entrance) addrParts.push(`подъезд ${entrance}`);
  if (floor) addrParts.push(`этаж ${floor}`);
  if (city) addrParts.push(city);
  const addr = addrParts.length ? addrParts.join(", ") : "—";

  const adminText =
    "📝 <b>Новая заявка!</b>\n" +
    `От пользователя: <a href="tg://user?id=${userId}">ссылка</a>\n` +
    `Кол-во сумок: <b>${bags || 1}</b>\n` +
    `Комментарий: ${comment || "—"}\n` +
    `Адрес: ${addr}\n` +
    `Телефон: ${phone || "—"}`;

  try {
    const tgResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text: adminText,
        parse_mode: "HTML"
      })
    });
    const tgData = await tgResp.json();
    if (!tgData.ok) {
      console.error("TG API error:", tgData);
      return res.status(500).json({ ok: false, error: "tg sendMessage failed" });
    }
  } catch (e) {
    console.error("TG send error:", e);
    return res.status(500).json({ ok: false, error: "tg send error" });
  }

  return res.json({ ok: true });
}

