import type { User } from '@mma/types';
import { ApiClient } from './client';

export class UserApi {
  constructor(private client: ApiClient) {}

  async getProfile(): Promise<User> {
    return this.client.call<void, User>('getProfile', undefined as never);
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    return this.client.call<Partial<User>, User>('updateProfile', updates);
  }
}
