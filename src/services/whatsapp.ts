import twilio from 'twilio';
import { config } from '../config/env';
import logger from '../utils/logger';

export interface WhatsAppMessage {
  to: string;
  body: string;
  mediaUrl?: string;
}

export class WhatsAppService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    this.client = twilio(
      config.twilio.accountSid,
      config.twilio.authToken
    );
    this.fromNumber = config.twilio.whatsappNumber;
  }

  /**
   * Send a WhatsApp message
   */
  async sendMessage(message: WhatsAppMessage): Promise<string> {
    try {
      const response = await this.client.messages.create({
        from: this.fromNumber,
        to: `whatsapp:${message.to}`,
        body: message.body,
        mediaUrl: message.mediaUrl,
      });

      logger.info(`WhatsApp message sent: ${response.sid}`);
      return response.sid;
    } catch (error) {
      logger.error('Error sending WhatsApp message', error);
      throw error;
    }
  }

  /**
   * Send customized notification to church worker
   */
  async sendWorkerNotification(
    workerPhone: string,
    formResponse: any
  ): Promise<string> {
    const message = this.buildNotificationMessage(formResponse);
    return this.sendMessage({
      to: workerPhone,
      body: message,
    });
  }

  /**
   * Build customized message based on form response
   */
  private buildNotificationMessage(formResponse: any): string {
    const { category, priority, responses, respondentEmail } = formResponse;

    let message = `🙏 *New Prayer Request*\n\n`;

    // Add priority indicator
    if (priority === 'high') {
      message = `🚨 *URGENT - New Prayer Request*\n\n`;
    } else if (priority === 'medium') {
      message = `⚠️ *Important Prayer Request*\n\n`;
    }

    // Add category context
    switch (category) {
      case 'prayer':
        message += `📿 *Prayer Request*\n`;
        break;
      case 'counseling':
        message += `💬 *Counseling Request*\n`;
        break;
      case 'pastoral_care':
        message += `🤝 *Pastoral Care Needed*\n`;
        break;
      case 'outreach':
        message += `🌍 *Outreach Opportunity*\n`;
        break;
      default:
        message += `📬 *New Request*\n`;
    }

    message += `\n*Details:*\n`;

    // Add response details
    Object.entries(responses).forEach(([key, value]) => {
      if (key !== 'Timestamp' && key !== 'Email Address') {
        message += `• ${key}: ${value}\n`;
      }
    });

    // Add contact info if available
    if (respondentEmail) {
      message += `\n*Contact:* ${respondentEmail}`;
    }

    message += `\n\nPlease respond ASAP or mark as handled. Reply to confirm.`;

    return message;
  }

  /**
   * Send bulk messages to multiple workers
   */
  async sendBulkNotifications(
    workerPhones: string[],
    formResponse: any
  ): Promise<string[]> {
    try {
      const messageIds: string[] = [];

      for (const phone of workerPhones) {
        const messageId = await this.sendWorkerNotification(phone, formResponse);
        messageIds.push(messageId);
      }

      logger.info(`Sent bulk notifications to ${workerPhones.length} workers`);
      return messageIds;
    } catch (error) {
      logger.error('Error sending bulk notifications', error);
      throw error;
    }
  }

  /**
   * Send confirmation receipt
   */
  async sendConfirmationReceipt(
    workerPhone: string,
    requestId: string
  ): Promise<string> {
    const message = `✅ Thank you for responding to request ${requestId}. Your response has been recorded.`;
    return this.sendMessage({
      to: workerPhone,
      body: message,
    });
  }
}

export default new WhatsAppService();
