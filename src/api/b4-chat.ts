// Client-side API handler for B-4 chat
// Calls the server-side API route at /api/b4-chat

export async function handleB4Chat(messages: Array<{ role: string; content: string }>): Promise<{ reply: string }> {
  try {
    // Use relative path - works in both development and production
    // In development, React dev server proxies to the Express server
    // In production, the Express server serves both the React app and API
    const response = await fetch('/api/b4-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    // Log non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.reply || `HTTP error! status: ${response.status}`;
      console.error('[B-4 Chat] API error:', response.status, errorMessage, errorData);
      
      // Return the actual error message from server
      return {
        reply: errorData.reply || `B-4 couldn't connect (${response.status}). ERROR: ${errorMessage}`
      };
    }

    const data = await response.json();
    
    // Log successful response in development
    if (process.env.NODE_ENV === 'development' && data.debug) {
      console.log('[B-4 Chat] Response debug:', data.debug);
    }
    
    // Return the reply from the server
    if (!data.reply) {
      console.error('[B-4 Chat] No reply in response:', data);
      return {
        reply: "B-4 couldn't connect. Check the API route."
      };
    }
    
    return {
      reply: data.reply
    };
  } catch (error) {
    // Network errors, JSON parse errors, etc.
    console.error('[B-4 Chat] Fetch error:', error);
    
    // Return detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      reply: `B-4 couldn't connect. ERROR: ${errorMessage}`
    };
  }
}
