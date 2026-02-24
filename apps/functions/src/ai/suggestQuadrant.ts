import { onCall } from 'firebase-functions/v2/https';
import Anthropic from '@anthropic-ai/sdk';
import { AISuggestionRequestSchema, AISuggestionSchema } from '@mma/types';
import { requireAuth } from '../middleware/validateAuth';
import { checkRateLimit } from '../middleware/rateLimit';
import { defineSecret } from 'firebase-functions/params';

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

export const suggestQuadrant = onCall(
  { secrets: [anthropicApiKey] },
  async (request) => {
    const userId = requireAuth(request);
    await checkRateLimit(userId, 'aiSuggest');

    const input = AISuggestionRequestSchema.parse(request.data);

    const client = new Anthropic({ apiKey: anthropicApiKey.value() });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `You are a productivity assistant that categorizes tasks into the Eisenhower Matrix.

Analyze this task and suggest which quadrant it belongs to:

Task: "${input.title}"
${input.description ? `Description: "${input.description}"` : ''}
${input.priority ? `Priority: ${input.priority}` : ''}
${input.dueDate ? `Due date: ${input.dueDate}` : ''}
${input.tags?.length ? `Tags: ${input.tags.join(', ')}` : ''}

Quadrants:
- Q1 (Urgent & Important): Crisis, deadlines, pressing problems
- Q2 (Not Urgent & Important): Planning, prevention, personal development
- Q3 (Urgent & Not Important): Interruptions, some meetings, some calls
- Q4 (Not Urgent & Not Important): Time wasters, busy work, trivial tasks

Respond ONLY with valid JSON: {"quadrant": <1-4>, "confidence": <0.0-1.0>, "reasoning": "<brief explanation>"}`,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const parsed = JSON.parse(textContent.text);
    return AISuggestionSchema.parse(parsed);
  },
);
