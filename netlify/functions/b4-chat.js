const OpenAI = require('openai');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function jsonResponse(statusCode, data) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(data) };
}

exports.handler = async (event, context) => {
  console.log('[b4-chat] invoked', event.httpMethod);

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: corsHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
      return jsonResponse(405, { error: 'Method not allowed' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('[b4-chat] Missing OPENAI_API_KEY');
      return jsonResponse(500, { error: 'Missing OPENAI_API_KEY' });
    }

    let body;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
    } catch (_) {
      return jsonResponse(400, { error: 'Invalid JSON body' });
    }

    const message = body.message != null && typeof body.message === 'string' ? body.message.trim() : '';
    if (!message && (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0)) {
      return jsonResponse(400, { error: 'Missing or invalid message' });
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
    } else {
      openaiMessages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: message },
      ];
    }

    console.log('[b4-chat] calling OpenAI');
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      max_tokens: 512,
    });

    const assistantMessage =
      completion.choices?.[0]?.message?.content?.trim() ||
      "I'm not sure what to say right now. Try asking again?";

    console.log('[b4-chat] success');
    return jsonResponse(200, { reply: assistantMessage });
  } catch (err) {
    const msg = err?.message || String(err);
    console.error('[b4-chat] error', msg);
    return jsonResponse(500, { error: msg });
  }
};
