import { Request, Response, RequestHandler } from 'express';
import { QueueService, QueueName } from '@/services/queue.service';

export class QueueController {
  private queueService: QueueService;

  constructor() {
    this.queueService = QueueService.getInstance();
  }

  // Get queue statistics
  getQueueStats: RequestHandler = async (req, res) => {
    try {
      const { queueName } = req.params;
      const stats = await this.queueService.getQueueStats(queueName as QueueName);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get queue statistics' });
    }
  }

  // Get job status
  getJobStatus: RequestHandler = async (req, res) => {
    try {
      const { queueName, jobId } = req.params;
      const status = await this.queueService.getJobStatus(queueName as QueueName, jobId);
      if (!status) {
        res.status(404).json({ error: 'Job not found' });
      } else {
        res.json(status);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to get job status' });
    }
  }

  // Update job progress
  updateJobProgress: RequestHandler = async (req, res) => {
    try {
      const { queueName, jobId } = req.params;
      const { progress } = req.body;
      await this.queueService.updateJobProgress(queueName as QueueName, jobId, progress);
      res.json({ message: 'Job progress updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update job progress' });
    }
  }

  // Pause queue
  pauseQueue: RequestHandler = async (req, res) => {
    try {
      const { queueName } = req.params;
      await this.queueService.pauseQueue(queueName as QueueName);
      res.json({ message: 'Queue paused successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to pause queue' });
    }
  }

  // Resume queue
  resumeQueue: RequestHandler = async (req, res) => {
    try {
      const { queueName } = req.params;
      await this.queueService.resumeQueue(queueName as QueueName);
      res.json({ message: 'Queue resumed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to resume queue' });
    }
  }

  // Clean old jobs
  cleanOldJobs: RequestHandler = async (req, res) => {
    try {
      const { queueName } = req.params;
      const { days } = req.query;
      await this.queueService.cleanOldJobs(
        queueName as QueueName,
        days ? parseInt(days as string) : 7
      );
      res.json({ message: 'Old jobs cleaned successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clean old jobs' });
    }
  }

  // Retry failed jobs
  retryFailedJobs: RequestHandler = async (req, res) => {
    try {
      const { queueName } = req.params;
      await this.queueService.retryFailedJobs(queueName as QueueName);
      res.json({ message: 'Failed jobs retried successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retry failed jobs' });
    }
  }
} 