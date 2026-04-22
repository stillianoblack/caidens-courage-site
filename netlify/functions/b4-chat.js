/**
 * B-4 Chat Netlify Function
 *
 * Accepts POST with { message, history? }
 * Returns { reply: string }
 * Uses OPENAI_API_KEY from environment (server-side only).
 */

const SYSTEM_PROMPT = `You are B-4, a friendly SEL (social-emotional learning) assistant for Caiden's Courage. You help parents, educators, and kids with:
- Camp Courage and Courage Academy resources
- Calm-down routines and emotion regulation
- Printables, coloring pages, and classroom tools
- Questions about the comic and characters

Keep responses warm, concise, and helpful.`;

function jsonResponse(body, status = 200) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

async function callOpenAI(message, history = []) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return jsonResponse(
      { error: "B-4 needs a server key configured." },
      500
    );
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-10).map((m) => ({
      role: m.role,
      content: String(m.content || ""),
    })),
    { role: "user", content: String(message || "").slice(0, 2000) },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[b4-chat] OpenAI error:", res.status, err);
    return jsonResponse(
      { error: "B-4 couldn't get a response. Please try again." },
      502
    );
  }

  const data = await res.json();
  const reply =
    data?.choices?.[0]?.message?.content?.trim() ||
    "I'm not sure how to respond. Can you try asking in a different way?";
  return jsonResponse({ reply });
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const message = body.message;
  if (!message || typeof message !== "string") {
    return jsonResponse({ error: "Missing or invalid message" }, 400);
  }

  const history = Array.isArray(body.history) ? body.history : [];
  return callOpenAI(message, history);
};
