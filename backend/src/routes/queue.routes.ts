import { Router } from 'express';
import { QueueController } from '@/controllers/queue.controller';
import { AuthMiddleware } from '@/middleware/auth.middleware';
import { Roles } from '@/defaults/role';


const router = Router();
const queueController = new QueueController();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.isAuthenticated);
// router.use(authMiddleware.hasRole([Roles.ADMIN, Roles.HR]));

router.get('/:queueName/stats', queueController.getQueueStats);
router.get('/:queueName/jobs/:jobId/status', queueController.getJobStatus);
router.put('/:queueName/jobs/:jobId/progress', queueController.updateJobProgress);

// Queue management
router.post('/:queueName/pause', queueController.pauseQueue);
router.post('/:queueName/resume', queueController.resumeQueue);
router.delete('/:queueName/clean', queueController.cleanOldJobs);
router.post('/:queueName/retry-failed', queueController.retryFailedJobs);

export default router; 