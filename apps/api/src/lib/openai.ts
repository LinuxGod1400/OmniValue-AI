/**
 * OpenAI client wrapper.
 * Returns null when OPENAI_API_KEY is not set so callers can degrade gracefully.
 */

import OpenAI from 'openai';

let _client: OpenAI | null = null;

export function getOpenAIClient(apiKey: string | undefined): OpenAI | null {
  if (!apiKey) return null;
  if (!_client) _client = new OpenAI({ apiKey });
  return _client;
}

export interface ItemAnalysis {
  name: string;
  category: string;
  description: string;
  estimatedValue: number | null;
  currency: string;
  condition: string;
  tags: string[];
}

export async function analyzeItemImage(
  client: OpenAI,
  imageUrl: string,
  model: string,
): Promise<ItemAnalysis> {
  const response = await client.chat.completions.create({
    model,
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this item image and return a JSON object with these fields:
- name: string (item name)
- category: string (e.g. Electronics, Clothing, Collectible, Furniture)
- description: string (1-2 sentence description)
- estimatedValue: number | null (USD market value, null if unknown)
- currency: "USD"
- condition: string (Excellent | Good | Fair | Poor)
- tags: string[] (3-5 relevant tags)

Respond with ONLY valid JSON, no markdown.`,
          },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message.content ?? '{}';
  return JSON.parse(content) as ItemAnalysis;
}
