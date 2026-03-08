/**
 * @file tools/doc-code-sync/src/worker/worker-entry.ts
 * @description Worker Entry 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { parentPort, workerData } from 'worker_threads';
import { DocCodeWorker } from './worker';
import { WorkerMessage, WorkerResponse, WorkerConfig } from './types';

const config: WorkerConfig = workerData?.config || {};
const worker = new DocCodeWorker(config);

parentPort?.on('message', async (message: WorkerMessage) => {
  try {
    const response = await worker.handleMessage(message);
    parentPort?.postMessage(response);
  } catch (error) {
    const errorResponse: WorkerResponse = {
      id: message.id,
      type: 'error',
      error: {
        code: 'WORKER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
        stack: error instanceof Error ? error.stack : undefined,
      },
      timestamp: Date.now(),
    };
    parentPort?.postMessage(errorResponse);
  }
});

parentPort?.on('error', (error) => {
  console.error('Worker error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception in worker:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection in worker:', reason, 'at:', promise);
  process.exit(1);
});
