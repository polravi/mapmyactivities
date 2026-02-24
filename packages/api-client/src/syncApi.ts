import type {
  SyncPullRequest,
  SyncPullResponse,
  SyncPushRequest,
} from '@mma/types';
import { ApiClient } from './client';

export class SyncApi {
  constructor(private client: ApiClient) {}

  async pull(request: SyncPullRequest): Promise<SyncPullResponse> {
    return this.client.call<SyncPullRequest, SyncPullResponse>(
      'syncPull',
      request,
    );
  }

  async push(request: SyncPushRequest): Promise<void> {
    await this.client.call<SyncPushRequest, void>('syncPush', request);
  }
}
