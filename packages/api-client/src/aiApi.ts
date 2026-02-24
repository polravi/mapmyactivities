import type {
  AISuggestionRequest,
  AISuggestion,
  VoiceParseRequest,
  ParsedVoiceTask,
} from '@mma/types';
import { ApiClient } from './client';

export class AiApi {
  constructor(private client: ApiClient) {}

  async suggestQuadrant(request: AISuggestionRequest): Promise<AISuggestion> {
    return this.client.call<AISuggestionRequest, AISuggestion>(
      'suggestQuadrant',
      request,
    );
  }

  async parseVoiceTask(request: VoiceParseRequest): Promise<ParsedVoiceTask> {
    return this.client.call<VoiceParseRequest, ParsedVoiceTask>(
      'parseVoiceTask',
      request,
    );
  }
}
