const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
// Try to load dotenv if available (optional)
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, that's okay
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Enable CORS for localhost:3000 (React dev server)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// JSON parsing middleware
app.use(express.json({ limit: '10mb' }));

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('[Server] JSON parsing error:', err.message);
    return res.status(200).json({
      reply: "I had trouble understanding that message. Could you try rephrasing it?"
    });
  }
  next(err);
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// B-4 Chat API Route
// Simple rate limiting (in-memory, resets on server restart)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

const getRateLimitKey = (req) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// B-4 System Prompt - Constant for consistent behavior
const B4_SYSTEM_PROMPT = `
You are B-4, the companion guide from Caiden's Courage and the Courage Academy / Camp Courage experience.

VOICE
- Calm, encouraging, warm, practical. Short sentences. No lectures.
- Speak like a supportive coach for kids AND a helpful guide for parents and educators.
- Brand language: courage, calm-ready tools, missions, companion activities, classroom pilots.
- Use simple bullets when helpful.

SAFETY + BOUNDARIES
- You are not a therapist, doctor, or crisis service.
- Do not diagnose or give medical advice.
- If the user expresses self-harm or danger, encourage reaching a trusted adult or local emergency services.
- Keep responses kid-safe and classroom-appropriate.

SEL SUPPORT FLOW
1. Name the moment (brief emotional reflection).
2. Offer a small next step (1–3 steps).
3. Offer a choice.
4. Ask a gentle follow-up question.

KNOWLEDGE USE
- You will receive a KNOWLEDGE PACK with relevant site content.
- Use ONLY the information from the KNOWLEDGE PACK to answer questions about the site, resources, FAQs, Camp Courage, B-4 Tools, and Caiden's Courage.
- If the KNOWLEDGE PACK contains relevant information, use it directly in your answer.
- If the question is not answered in the KNOWLEDGE PACK, say you're not sure and suggest where to look on the site (e.g., "Check the Resources page" or "Visit /camp-courage").
- Do NOT make up information about the site. Only use what's provided in the KNOWLEDGE PACK.
`;

// B-4 Chat API Route
app.post('/api/b4-chat', async (req, res) => {
  // Wrap entire handler in try/catch to prevent ANY 500 errors
  try {
    console.log('[b4-chat] Request received at', new Date().toISOString());
    
    // A) Request parsing + payload compatibility
    const body = req.body || {};
    
    // Log incoming body for debugging
    console.log('[b4-chat] body keys:', Object.keys(body));
    
    // Normalize to extract userText from either format
    // Support both .at(-1) (newer Node) and fallback for older versions
    let userText = '';
    if (typeof body.message === 'string') {
      userText = body.message.trim();
    } else if (Array.isArray(body.messages) && body.messages.length > 0) {
      const lastMsg = body.messages[body.messages.length - 1];
      userText = String(lastMsg?.content || '').trim();
    }

    // G) Server-side debug log
    console.log('[b4-chat] userText:', userText);

    // If userText is empty, return friendly error (status 200, not 400, to avoid client errors)
    if (!userText) {
      return res.status(200).json({ 
        reply: "I didn't receive a question. Please try again.",
        error: "missing_input"
      });
    }

    // Rate limiting (optional, but keep it)
    const rateLimitKey = getRateLimitKey(req);
    const now = Date.now();
    const userRequests = rateLimitMap.get(rateLimitKey) || [];
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= RATE_LIMIT_MAX) {
      return res.status(200).json({
        reply: "I'm getting a lot of messages right now. Please wait a moment and try again!"
      });
    }

    recentRequests.push(now);
    rateLimitMap.set(rateLimitKey, recentRequests);

    // Input length guardrails
    if (userText.length > 500) {
      return res.status(200).json({
        reply: "That's a long message! Can you break it into smaller questions? I'm here to help."
      });
    }

    // C) Load the JSON knowledge base SAFELY
    let knowledgeBase = null;
    let knowledgeEntries = [];
    
    try {
      // Try new simpler knowledge base first, fallback to old one
      const kbPath = path.join(__dirname, 'src', 'data', 'b4_kb.json');
      const fallbackPath = path.join(__dirname, 'content', 'b4-knowledge.json');
      
      let knowledgeData;
      try {
        knowledgeData = fs.readFileSync(kbPath, 'utf8');
        console.log('[b4-chat] Knowledge base loaded from:', kbPath);
      } catch (e) {
        try {
          knowledgeData = fs.readFileSync(fallbackPath, 'utf8');
          console.log('[b4-chat] Knowledge base loaded from:', fallbackPath);
        } catch (e2) {
          // Both files missing - return friendly reply, not 500
          console.error('[b4-chat] Knowledge base files not found');
          return res.status(200).json({
            reply: "I'm having trouble accessing my knowledge base right now. Please try again in a moment, or visit the Resources page for more information."
          });
        }
      }
      
      // Parse JSON safely
      try {
        knowledgeBase = JSON.parse(knowledgeData);
      } catch (parseError) {
        console.error('[b4-chat] JSON parse error:', parseError.message);
        return res.status(200).json({
          reply: "I'm having trouble reading my knowledge base. Please try again in a moment."
        });
      }
      
      // Normalize entries array
      if (Array.isArray(knowledgeBase)) {
        knowledgeEntries = knowledgeBase;
      } else if (knowledgeBase.sections) {
        // Handle old format
        knowledgeEntries = knowledgeBase.sections.flatMap(s => 
          (s.snippets || []).map(snip => ({
            id: snip.id,
            title: snip.q || snip.text || '',
            answer: snip.a || snip.text || '',
            keywords: (s.tags || []).concat([snip.q, snip.text].filter(Boolean))
          }))
        );
      }
      
      console.log('[b4-chat] Knowledge base loaded:', knowledgeEntries.length, 'entries');
    } catch (error) {
      // Any other error loading knowledge base - return friendly reply, not 500
      console.error('[b4-chat] Could not load knowledge base:', error.message);
      return res.status(200).json({
        reply: "I'm having trouble accessing my knowledge base right now. Please try again in a moment, or visit the Resources page for more information."
      });
    }

    // D) Implement simple keyword-based retrieval (stable, reliable)
    const q = userText.toLowerCase();
    let matchedEntry = null;
    
    // Simple, explicit matching (more reliable than scoring)
    if (q.includes('educator') || q.includes('teacher access') || q.includes('request access') || q.includes('educator access')) {
      matchedEntry = knowledgeEntries.find(e => e.id === 'educator_access');
    } else if (q.includes('camp courage') || q.includes('courage camp') || q.includes('what is camp')) {
      matchedEntry = knowledgeEntries.find(e => e.id === 'camp_courage');
    } else if ((q.includes('free') || q.includes('cost') || q.includes('price')) && (q.includes('resource') || q.includes('download'))) {
      matchedEntry = knowledgeEntries.find(e => e.id === 'resources_free');
    } else if (q.includes('print') || q.includes('printable') || (q.includes('ages') && (q.includes('7') || q.includes('12')))) {
      matchedEntry = knowledgeEntries.find(e => e.id === 'printables' || e.id === 'ages');
    } else if (q.includes('classroom') || q.includes('use in class') || q.includes('how do i use')) {
      matchedEntry = knowledgeEntries.find(e => e.id === 'classroom_use');
    } else if (q.includes('b-4') || q.includes('b4') || q.includes('reset tool')) {
      matchedEntry = knowledgeEntries.find(e => e.id === 'b4_tools');
    } else if (q.includes('what is courage') || q.includes('courage mean')) {
      matchedEntry = knowledgeEntries.find(e => e.id === 'what_is_courage');
    }
    
    // Fallback: try keyword matching if no explicit match
    if (!matchedEntry) {
      for (const entry of knowledgeEntries) {
        const keywords = entry.keywords || [];
        for (const keyword of keywords) {
          if (q.includes(keyword.toLowerCase())) {
            matchedEntry = entry;
            break;
          }
        }
        if (matchedEntry) break;
      }
    }

    // Build response
    let reply;
    
    if (matchedEntry && matchedEntry.answer) {
      reply = matchedEntry.answer;
      console.log('[b4-chat] matched:', matchedEntry.id);
    } else {
      // Helpful fallback with suggestions
      reply = "I'm not sure how to answer that. Try asking about:\n• Camp Courage\n• Free resources\n• Classroom use\n• Educator access\n• Printables for ages 7-12\n\nOr visit the Resources page for more information.";
      console.log('[b4-chat] No match found, using fallback');
    }

    // G) Confirm response shape - ALWAYS { reply: string }
    const response = { reply };

    // Add optional debug fields in development
    if (process.env.NODE_ENV !== 'production') {
      response.matchedId = matchedEntry?.id || null;
      response.debug = {
        userText,
        matchedId: matchedEntry?.id || null
      };
    }

    console.log('[b4-chat] Response:', reply.substring(0, 100) + (reply.length > 100 ? '...' : ''));
    
    // Always return status 200 with JSON response
    return res.status(200).json(response);
    
  } catch (error) {
    // E) Prevent 500s forever - wrap entire handler in try/catch
    console.error('[B-4 Chat] Unexpected error:', error.message);
    console.error('[B-4 Chat] Error stack:', error.stack);
    
    // Always return status 200 with friendly message (never 500)
    return res.status(200).json({
      reply: "B-4 had a hiccup. Please try again in a moment."
    });
  }
});

// Global error handler (catches any unhandled errors)
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err.message);
  console.error('[Server] Stack:', err.stack);
  
  // Don't send error response if headers already sent
  if (res.headersSent) {
    return next(err);
  }
  
  // Return friendly error message instead of 500
  res.status(200).json({
    reply: "B-4 had a hiccup. Please try again in a moment."
  });
});

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Verify knowledge base can be loaded on startup
try {
  const kbPath = path.join(__dirname, 'src', 'data', 'b4_kb.json');
  const fallbackPath = path.join(__dirname, 'content', 'b4-knowledge.json');
  
  let kbTest;
  try {
    kbTest = fs.readFileSync(kbPath, 'utf8');
    console.log('[Server] Knowledge base found at:', kbPath);
  } catch (e) {
    kbTest = fs.readFileSync(fallbackPath, 'utf8');
    console.log('[Server] Knowledge base found at:', fallbackPath);
  }
  
  const kbData = JSON.parse(kbTest);
  const entryCount = Array.isArray(kbData) ? kbData.length : 'object';
  console.log('[Server] Knowledge base loaded successfully:', entryCount, 'entries');
} catch (error) {
  console.error('[Server] WARNING: Could not load knowledge base on startup:', error.message);
  console.error('[Server] The chat API may not work correctly.');
}

app.listen(PORT, () => {
  console.log(`B-4 API listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`B-4 Chat API: http://localhost:${PORT}/api/b4-chat`);
});
