import { Router, Request, Response } from 'express';
import googleFormsService from '../services/googleForms';
import whatsappService from '../services/whatsapp';
import workerRouterService from '../services/workerRouter';
import logger from '../utils/logger';

const router = Router();

/**
 * Receive webhook from Google Forms
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    logger.info('Received form webhook', req.body);

    // Process the form response
    const formResponse = googleFormsService.processWebhookResponse(req.body);

    // Route to appropriate workers
    const assignedWorkers = workerRouterService.routeResponse(formResponse);

    if (assignedWorkers.length === 0) {
      logger.warn('No workers available for this response');
      return res
        .status(202)
        .json({
          success: false,
          message: 'No available workers',
          responseId: formResponse.id,
        });
    }

    // Send notifications to assigned workers
    const workerPhones = assignedWorkers.map((w) => w.whatsappNumber);
    const messageIds = await whatsappService.sendBulkNotifications(
      workerPhones,
      formResponse
    );

    // Create assignments
    for (const worker of assignedWorkers) {
      workerRouterService.createAssignment(worker.id, formResponse.id);
    }

    res.status(200).json({
      success: true,
      message: 'Notifications sent successfully',
      responseId: formResponse.id,
      messageIds,
      workersNotified: assignedWorkers.length,
    });
  } catch (error) {
    logger.error('Error processing webhook', error);
    res.status(500).json({
      success: false,
      message: 'Error processing form response',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get form responses
 */
router.get('/responses/:spreadsheetId', async (req: Request, res: Response) => {
  try {
    const { spreadsheetId } = req.params;
    const responses = await googleFormsService.getFormResponses(spreadsheetId);

    res.json({
      success: true,
      count: responses.length,
      responses,
    });
  } catch (error) {
    logger.error('Error fetching responses', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching responses',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
