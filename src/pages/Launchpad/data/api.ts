import { createLocalLaunchpadApi } from './localApi';
import type { LaunchpadApi } from './types';

/** Replace this factory with an HTTP adapter when the server is ready. */
export const createLaunchpadApi = (userId: string): LaunchpadApi => createLocalLaunchpadApi(userId);
