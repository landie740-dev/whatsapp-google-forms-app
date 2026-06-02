import { Router, Request, Response } from 'express';
import whatsappService from '../services/whatsapp';
import workerRouterService from '../services/workerRouter';
import logger from '../utils/logger';

const router = Router();

/**
 * Handle worker response via WhatsApp
 */
router.post('/worker-response', async (req: Request, res: Response) => {
  try {
    const { workerPhone, message, assignmentId } = req.body;

    logger.info(`Worker response received: ${workerPhone}`, { assignmentId });

    // Parse worker message
    if (message.toLowerCase().includes('completed')) {
      if (assignmentId) {
        workerRouterService.completeAssignment(assignmentId, message);
        await whatsappService.sendConfirmationReceipt(
          workerPhone,
          assignmentId
        );
      }
    }

    res.json({
      success: true,
      message: 'Response recorded',
    });
  } catch (error) {
    logger.error('Error processing worker response', error);
    res.status(500).json({
      success: false,
      message: 'Error processing response',
    });
  }
});

/**
 * Worker availability update
 */
router.put('/worker/:workerId/availability', (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;
    const { isAvailable } = req.body;

    const success = workerRouterService.updateWorkerAvailability(
      workerId,
      isAvailable
    );

    res.json({
      success,
      message: success ? 'Availability updated' : 'Worker not found',
    });
  } catch (error) {
    logger.error('Error updating availability', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability',
    });
  }
});

/**
 * Get worker assignments
 */
router.get('/worker/:workerId/assignments', (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;
    const assignments = workerRouterService.getWorkerAssignments(workerId);

    res.json({
      success: true,
      workerId,
      assignments,
      count: assignments.length,
    });
  } catch (error) {
    logger.error('Error fetching assignments', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
    });
  }
});

export default router;
