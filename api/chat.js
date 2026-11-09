
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Chiave Gemini non configurata" });
    }

    const { message = "", prompt = "" } = req.body || {};
    const text = message || prompt;

    if (!text.trim()) {
      return res.status(400).json({ error: "Messaggio vuoto" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: "Errore Gemini" });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Non ho ricevuto una risposta.";

    return res.status(200).json({ reply, response: reply, text: reply });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
