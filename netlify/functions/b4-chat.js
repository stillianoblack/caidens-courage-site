const OpenAI = require('openai');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'OPENAI_API_KEY is not configured' }),
    };
  }

  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
  } catch (_) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const systemContent = "You are B-4, a friendly, supportive chatbot for Caiden's Courage — an illustrated adventure about courage, imagination, and neurodiverse kids. Keep replies concise, warm, and appropriate for families.";
  let openaiMessages;

  if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
    openaiMessages = [
      { role: 'system', content: systemContent },
      ...body.messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: typeof m.content === 'string' ? m.content : String(m.content || ''),
      })),
    ];
  } else if (body.message != null && typeof body.message === 'string' && body.message.trim()) {
    openaiMessages = [
      { role: 'system', content: systemContent },
      { role: 'user', content: body.message.trim() },
    ];
  } else {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing or invalid message or messages' }),
    };
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      max_tokens: 512,
    });

    const assistantMessage =
      completion.choices?.[0]?.message?.content?.trim() ||
      "I'm not sure what to say right now. Try asking again?";

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: assistantMessage }),
    };
  } catch (err) {
    const message = err?.message || String(err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: message }),
    };
  }
};
