
exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Metodo non consentito" })
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Chiave Gemini non configurata");
    }

    const data = JSON.parse(event.body || "{}");
    const message = data.message || data.prompt || "";

    if (!message.trim()) {
      throw new Error("Messaggio vuoto");
    }

    const result = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: message }]
          }]
        })
      }
    );

    const answer = await result.json();

    if (!result.ok) {
      throw new Error("Errore nella risposta Gemini");
    }

    const reply =
      answer.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Non ho ricevuto una risposta.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply, response: reply, text: reply })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
