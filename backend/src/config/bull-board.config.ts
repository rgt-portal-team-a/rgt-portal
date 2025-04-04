import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Queue from 'bull';
import { QueueName } from '@/services/queue.service';

export function setupBullBoard(app: any) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const redisConfig = {
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD || "",
      username: process.env.REDIS_USERNAME || "",
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    },
  };

  const queues = Object.values(QueueName).map(
    (queueName) => new BullAdapter(new Queue(queueName, redisConfig))
  );

  const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues,
    serverAdapter,
    options: {
      uiConfig: {
        boardTitle: "RGT PORTAL",
        boardLogo: {
          path: "src/logo.png",
          width: 100,
          height: 100,
        },
      },
    },
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  return {
    addQueue,
    removeQueue,
    setQueues,
    replaceQueues,
  };
} 