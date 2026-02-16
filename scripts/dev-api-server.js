/**
 * Local development API server
 * Mimics Vercel serverless functions for local testing
 */

import http from 'http';
import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only handle /api/chat POST
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { messages, systemPrompt, maxTokens } = JSON.parse(body);

        if (!process.env.ANTHROPIC_API_KEY) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }));
          return;
        }

        const tokenLimit = Math.min(Math.max(parseInt(maxTokens) || 1024, 256), 8192);
        console.log('[dev-api] Calling Anthropic... (max_tokens:', tokenLimit + ')');

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: tokenLimit,
          system: systemPrompt || 'You are a helpful AI assistant for building managers.',
          messages: messages,
        });

        const textContent = response.content.find(block => block.type === 'text');
        const text = textContent ? textContent.text : '';

        console.log('[dev-api] Response received');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: text }));
      } catch (err) {
        console.error('[dev-api] Error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`[dev-api] API server running at http://localhost:${PORT}`);
  console.log('[dev-api] API key configured:', !!process.env.ANTHROPIC_API_KEY);
});
