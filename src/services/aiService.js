/**
 * AI Service - Calls our secure backend API
 * The API key is NEVER exposed to the browser
 */

const AI_API_URL = '/api/chat';

/**
 * Send a message to the AI assistant
 * @param {Array} messages - Array of {role: 'user'|'assistant', content: string}
 * @param {string} systemPrompt - Optional custom system prompt
 * @param {Object} options - Optional settings { maxTokens }
 * @returns {Promise<{success: boolean, message: string, error?: string}>}
 */
export async function sendMessage(messages, systemPrompt = null, options = {}) {
  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemPrompt,
        maxTokens: options.maxTokens || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: '',
        error: data.error || 'Failed to get AI response',
      };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (err) {
    console.error('[aiService] Error:', err);
    return {
      success: false,
      message: '',
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Building Manager system prompt
 */
export const BM_SYSTEM_PROMPT = `You are an AI assistant for building managers using the Community app. You help with:

- Drafting announcements and communications to residents
- Answering questions about building management best practices
- Helping organize events and community activities
- Providing suggestions for handling resident concerns
- Assisting with package management and notifications

Be concise, professional, and friendly. When drafting content for residents, match a warm but professional tone.

If asked about specific resident data, packages, or building information you don't have access to, explain that you can help draft communications or provide general guidance, but the manager will need to fill in specific details from their dashboard.`;
