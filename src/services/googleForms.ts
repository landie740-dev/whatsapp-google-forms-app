import axios from 'axios';
import { config } from '../config/env';
import { FormResponse, Form } from '../models/FormResponse';
import logger from '../utils/logger';

export class GoogleFormsService {
  private apiKey: string;
  private sheetsApiKey: string;

  constructor() {
    this.apiKey = config.googleForms.apiKey;
    this.sheetsApiKey = config.googleForms.sheetsApiKey;
  }

  /**
   * Get all responses from a Google Form (via Google Sheets)
   */
  async getFormResponses(spreadsheetId: string): Promise<FormResponse[]> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Form%20Responses%201!A:Z`;
      const response = await axios.get(url, {
        params: { key: this.sheetsApiKey },
      });

      const rows = response.data.values || [];
      const headers = rows[0] || [];
      const responses: FormResponse[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const formResponse: FormResponse = {
          id: `response_${Date.now()}_${i}`,
          timestamp: new Date(row[0]),
          formId: spreadsheetId,
          formTitle: 'Google Form Response',
          respondentEmail: row[1] || undefined,
          responses: this.mapRowToResponses(headers, row),
          category: this.categorizeResponse(row),
          priority: this.calculatePriority(row),
        };
        responses.push(formResponse);
      }

      logger.info(`Retrieved ${responses.length} form responses`);
      return responses;
    } catch (error) {
      logger.error('Error fetching form responses', error);
      throw error;
    }
  }

  /**
   * Listen for new form responses via webhook
   */
  processWebhookResponse(data: Record<string, any>): FormResponse {
    const formResponse: FormResponse = {
      id: `response_${Date.now()}`,
      timestamp: new Date(),
      formId: data.formId || '',
      formTitle: data.formTitle || '',
      respondentEmail: data.respondentEmail,
      responses: data.responses,
      category: this.categorizeResponse(data),
      priority: this.calculatePriority(data),
    };

    logger.info(`Processed webhook response: ${formResponse.id}`);
    return formResponse;
  }

  /**
   * Map row data to response object
   */
  private mapRowToResponses(
    headers: string[],
    row: string[]
  ): Record<string, string> {
    const responses: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (header && row[index]) {
        responses[header] = row[index];
      }
    });
    return responses;
  }

  /**
   * Categorize response based on content
   */
  private categorizeResponse(data: Record<string, any>): string {
    const responseText = JSON.stringify(data).toLowerCase();

    if (
      responseText.includes('prayer') ||
      responseText.includes('intercession')
    ) {
      return 'prayer';
    } else if (
      responseText.includes('counsel') ||
      responseText.includes('advice')
    ) {
      return 'counseling';
    } else if (
      responseText.includes('visit') ||
      responseText.includes('hospital')
    ) {
      return 'pastoral_care';
    } else if (responseText.includes('volunteer')) {
      return 'outreach';
    }

    return 'general';
  }

  /**
   * Calculate priority based on keywords
   */
  private calculatePriority(
    data: Record<string, any>
  ): 'low' | 'medium' | 'high' {
    const responseText = JSON.stringify(data).toLowerCase();

    if (
      responseText.includes('urgent') ||
      responseText.includes('emergency') ||
      responseText.includes('critical')
    ) {
      return 'high';
    } else if (
      responseText.includes('important') ||
      responseText.includes('soon')
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Get form metadata
   */
  async getFormMetadata(spreadsheetId: string): Promise<Form | null> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
      const response = await axios.get(url, {
        params: { key: this.sheetsApiKey },
      });

      const spreadsheet = response.data;
      return {
        id: spreadsheet.spreadsheetId,
        title: spreadsheet.properties.title,
        description: 'Google Form',
        fields: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      logger.error('Error fetching form metadata', error);
      return null;
    }
  }
}

export default new GoogleFormsService();
