import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Queue from 'bull';
import { QueueName } from '@/services/queue.service';

export function setupBullBoard(app: any) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const queues = Object.values(QueueName).map(
    (queueName) => new BullAdapter(new Queue(queueName))
  );

  const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues,
    serverAdapter,
    options: {
      uiConfig: {
        boardTitle: "RGT PORTAL",
        boardLogo: {
          path: "../logo.png",
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