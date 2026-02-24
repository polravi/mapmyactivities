import { ApiClient, AiApi } from '@mma/api-client';
import type { ParsedVoiceTask } from '@mma/types';

class VoicePipeline {
  private aiApi: AiApi;

  constructor() {
    const client = new ApiClient();
    this.aiApi = new AiApi(client);
  }

  async parseTranscript(transcript: string): Promise<ParsedVoiceTask> {
    return this.aiApi.parseVoiceTask({
      transcript,
      currentDate: new Date().toISOString(),
    });
  }
}

export const voicePipeline = new VoicePipeline();
