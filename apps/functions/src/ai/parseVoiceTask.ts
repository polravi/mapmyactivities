import { onCall } from 'firebase-functions/v2/https';
import Anthropic from '@anthropic-ai/sdk';
import { VoiceParseRequestSchema, ParsedVoiceTaskSchema } from '@mma/types';
import { requireAuth } from '../middleware/validateAuth';
import { checkRateLimit } from '../middleware/rateLimit';
import { defineSecret } from 'firebase-functions/params';

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

export const parseVoiceTask = onCall(
  { secrets: [anthropicApiKey] },
  async (request) => {
    const userId = requireAuth(request);
    await checkRateLimit(userId, 'voiceParse');

    const input = VoiceParseRequestSchema.parse(request.data);

    const client = new Anthropic({ apiKey: anthropicApiKey.value() });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a task extraction assistant. Parse the following voice transcript into a structured task.

Current date: ${input.currentDate}

Transcript: "${input.transcript}"

Extract:
- title: A concise task title (not the full transcript)
- description: Optional additional details
- dueDate: ISO 8601 datetime if mentioned (interpret "tomorrow", "next Monday", etc. relative to current date), or null
- priority: "low", "medium", or "high" based on urgency words
- goalType: "daily", "weekly", "monthly", or "yearly" if time horizon is mentioned, or null
- tags: Array of relevant tags extracted from context
- confidence: 0.0-1.0 how confident you are in the extraction

Respond ONLY with valid JSON matching this structure.`,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const parsed = JSON.parse(textContent.text);
    return ParsedVoiceTaskSchema.parse(parsed);
  },
);
