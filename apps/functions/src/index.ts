import * as admin from 'firebase-admin';

admin.initializeApp();

export { syncPull } from './sync/pull';
export { syncPush } from './sync/push';
export { suggestQuadrant } from './ai/suggestQuadrant';
export { parseVoiceTask } from './ai/parseVoiceTask';
export { onUserCreate } from './auth/onUserCreate';
export { dailyDigest } from './scheduled/dailyDigest';
export { processRecurrence } from './scheduled/processRecurrence';
