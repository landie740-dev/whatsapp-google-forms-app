import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Google Configuration
  googleForms: {
    apiKey: process.env.GOOGLE_FORMS_API_KEY || '',
    spreadsheetId: process.env.GOOGLE_FORMS_SPREADSHEET_ID || '',
    sheetsApiKey: process.env.GOOGLE_SHEETS_API_KEY || '',
  },

  // Twilio Configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
  },

  // Workers Configuration
  workers: {
    spreadsheetId: process.env.WORKERS_SPREADSHEET_ID || '',
  },
};

// Validate required config
const requiredConfig = [
  'googleForms.apiKey',
  'googleForms.spreadsheetId',
  'twilio.accountSid',
  'twilio.authToken',
  'twilio.whatsappNumber',
];

function validateConfig() {
  for (const key of requiredConfig) {
    const [section, field] = key.split('.');
    const value = config[section as keyof typeof config]?.[field as any];
    if (!value) {
      throw new Error(`Missing required environment variable for ${key}`);
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}
