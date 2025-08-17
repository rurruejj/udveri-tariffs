export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { query_id, result, admin_payload } = req.body || {};
    if (!query_id || !result) {
      return res.status(400).json({ ok: false, error: "bad args" });
    }

    const token = process.env.BOT_TOKEN;
    const adminId = process.env.ADMIN_ID;

    const api = (method, body) =>
      fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

    const r1 = await api("answerWebAppQuery", {
      web_app_query_id: query_id,
      result
    });
    const j1 = await r1.json();
    if (!j1.ok) throw new Error("answerWebAppQuery failed: " + JSON.stringify(j1));

    if (adminId) {
      const text =
        `🧺 <b>Заявка</b>\n` +
        `Пакеты: <b>${admin_payload?.bags ?? "—"}</b>\n` +
        `Комментарий: ${admin_payload?.comment?.trim() || "—"}`;
      await api("sendMessage", { chat_id: adminId, text, parse_mode: "HTML" });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
}

