import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[chat] ANTHROPIC_API_KEY not configured');
    return res.status(500).json({ error: 'AI service not configured' });
  }

  const { messages, systemPrompt, maxTokens } = req.body;

  // Validate required fields
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Allow callers to request more tokens (capped at 8192), default 1024
  const tokenLimit = Math.min(Math.max(parseInt(maxTokens) || 1024, 256), 8192);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: tokenLimit,
      system: systemPrompt || 'You are a helpful AI assistant for building managers. Help them with tasks like drafting announcements, answering resident questions, and managing building operations. Be concise and professional.',
      messages: messages,
    });

    // Extract the text response
    const textContent = response.content.find(block => block.type === 'text');
    const text = textContent ? textContent.text : '';

    return res.status(200).json({
      success: true,
      message: text,
      usage: response.usage
    });
  } catch (err) {
    console.error('[chat] Anthropic error:', err);

    // Handle specific error types
    if (err.status === 401) {
      return res.status(500).json({ error: 'Invalid API key' });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    return res.status(500).json({ error: err.message || 'Failed to get AI response' });
  }
}
