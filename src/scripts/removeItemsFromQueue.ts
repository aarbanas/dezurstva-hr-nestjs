import { bootstrapApp } from './bootstrapApp';
import {
  EmailQueueData,
  EmailQueueService,
} from '../redis/email/email-queue.service';

(async () => {
  const app = await bootstrapApp();
  const emailQueueService = await app.resolve(EmailQueueService);

  const itemsToBeDeleted = await emailQueueService.getItemsFromQueue(131, -1);
  if (!itemsToBeDeleted) {
    console.log('No items found in the queue.');
    return;
  }

  for (const item of itemsToBeDeleted) {
    const emailData: EmailQueueData = JSON.parse(item);

    await emailQueueService.deleteItemFromQueue(emailData);
    console.log('deleted item');
  }

  console.log('done deleting items from queue');
})();
