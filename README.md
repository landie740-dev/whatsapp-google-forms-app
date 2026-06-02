# WhatsApp Google Forms Church Notifier

A Node.js application that connects Google Forms with WhatsApp to send customized notifications to allocated church workers when form responses are received.

## Features

- 🔗 **Google Forms Integration** - Listen for new form submissions
- 💬 **WhatsApp Notifications** - Send real-time notifications via Twilio
- 👥 **Worker Routing** - Intelligently route requests to available church workers
- 📋 **Category-based Routing** - Route based on prayer requests, counseling, pastoral care, etc.
- 🚨 **Priority Handling** - Escalate urgent requests to multiple workers
- 📊 **Assignment Tracking** - Track worker assignments and completion status
- 🔐 **Secure API** - Built with TypeScript and Express.js

## Prerequisites

Before you begin, ensure you have the following:

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Google Account** with:
   - Google Forms enabled
   - Google Sheets API enabled
   - Google Forms API credentials
4. **Twilio Account** with:
   - WhatsApp Business Profile
   - Twilio Phone Number with WhatsApp enabled
   - Account SID and Auth Token
5. **Church Worker Data** (spreadsheet with worker details)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/landie740-dev/whatsapp-google-forms-app.git
cd whatsapp-google-forms-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials.

### 4. Run in Development

```bash
npm run dev
```

Visit: http://localhost:3000/health

## Setup Instructions

### Google Forms Configuration

#### 1. Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. In the search bar, search for "Google Sheets API"
4. Click "Enable"
5. Go to "Credentials" → "Create Credentials" → "API Key"
6. Copy your API Key

#### 2. Create Your Google Form

1. Go to [Google Forms](https://forms.google.com)
2. Create a new form with your questions
3. In the "Responses" tab, select "Create spreadsheet"
4. A new Google Sheet will be created
5. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```

#### 3. Set Environment Variables

In your `.env` file:

```bash
GOOGLE_FORMS_API_KEY=your_api_key_here
GOOGLE_FORMS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_API_KEY=your_api_key_here
```

### Twilio WhatsApp Setup

#### 1. Create Twilio Account

1. Sign up at [Twilio.com](https://www.twilio.com/)
2. Verify your phone number
3. Get your **Account SID** and **Auth Token** from the dashboard

#### 2. Set Up WhatsApp

1. In Twilio Console, go to "Messaging" → "Try it out" → "Send an SMS"
2. Look for "WhatsApp Sandbox"
3. Follow the instructions to join the sandbox
4. Get your WhatsApp-enabled phone number
5. Format: `whatsapp:+1234567890` (include country code)

#### 3. Set Environment Variables

In your `.env` file:

```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

### Church Workers Spreadsheet

Create a Google Sheet with these columns:

| Column | Type | Example | Notes |
|--------|------|---------|-------|
| id | string | worker_001 | Unique ID |
| name | string | John Doe | Full name |
| whatsappNumber | string | +234812345678 | With country code |
| email | string | john@church.com | Contact email |
| role | string | Senior Pastor | Job title |
| department | string | pastoral | pastoral/counseling/outreach/admin/prayer |
| specializations | string | counseling,prayer | Comma-separated |
| assignedCategories | string | prayer,counseling | Comma-separated |
| maxAssignments | number | 5 | Max concurrent tasks |
| isAvailable | boolean | true | Current availability |

Example data:
```
id,name,whatsappNumber,email,role,department,specializations,assignedCategories,maxAssignments,isAvailable
worker_001,John Doe,+234812345678,john@church.com,Senior Pastor,pastoral,prayer counseling,prayer counseling,5,true
worker_002,Jane Smith,+234812345679,jane@church.com,Counselor,counseling,counseling,counseling,3,true
worker_003,Mike Johnson,+234812345680,mike@church.com,Outreach Lead,outreach,outreach,outreach,4,true
```

Add the spreadsheet ID to `.env`:

```bash
WORKERS_SPREADSHEET_ID=your_workers_spreadsheet_id
```

## API Endpoints

### Forms

#### POST `/api/forms/webhook`
Receive form responses

```json
{
  "formId": "form_123",
  "formTitle": "Prayer Request Form",
  "respondentEmail": "user@example.com",
  "responses": {
    "Name": "John",
    "Prayer Request": "Please pray for my family",
    "Urgency": "High"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications sent successfully",
  "responseId": "response_123",
  "messageIds": ["msg_1", "msg_2"],
  "workersNotified": 2
}
```

#### GET `/api/forms/responses/:spreadsheetId`
Get all responses from a form

### Webhooks

#### POST `/api/webhooks/worker-response`
Handle worker response

```json
{
  "workerPhone": "+234812345678",
  "message": "I will handle this",
  "assignmentId": "assign_123"
}
```

#### PUT `/api/webhooks/worker/:workerId/availability`
Update worker availability

```json
{
  "isAvailable": true
}
```

#### GET `/api/webhooks/worker/:workerId/assignments`
Get worker's current assignments

### Health

#### GET `/health`
Check server health

## Application Flow

1. **Form Submission** → User submits Google Form
2. **Webhook Trigger** → App receives webhook notification
3. **Categorization** → App categorizes and determines priority
4. **Routing** → Intelligent routing to available workers
5. **Notification** → WhatsApp messages sent to workers
6. **Tracking** → Assignments created for tracking
7. **Completion** → Workers mark tasks as complete

## Message Examples

### Prayer Request
```
🙏 *New Prayer Request*

📿 *Prayer Request*

*Details:*
• Name: Sarah Johnson
• Prayer Request: Please pray for my family's health
• Urgency: Medium

*Contact:* sarah@email.com

Please respond ASAP or mark as handled. Reply to confirm.
```

### Urgent Request
```
🚨 *URGENT - New Prayer Request*

💬 *Counseling Request*

*Details:*
• Name: Tom Wilson
• Issue: Family crisis
• Need: Urgent counseling

*Contact:* tom@email.com

Please respond ASAP or mark as handled. Reply to confirm.
```

## Production Deployment

### Heroku

```bash
# Create app
heroku create your-app-name

# Set environment variables
heroku config:set GOOGLE_FORMS_API_KEY=your_key
heroku config:set TWILIO_ACCOUNT_SID=your_sid
# ... set all other variables

# Deploy
git push heroku main
```

### Docker

```bash
# Build image
docker build -t church-notifier .

# Run container
docker run -p 3000:3000 --env-file .env church-notifier
```

### AWS/VPS

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/index.js
pm2 startup
pm2 save
```

## Troubleshooting

### Issue: "Missing required environment variable"

**Solution**: Check all required variables are set:
- ✅ GOOGLE_FORMS_API_KEY
- ✅ GOOGLE_FORMS_SPREADSHEET_ID
- ✅ GOOGLE_SHEETS_API_KEY
- ✅ TWILIO_ACCOUNT_SID
- ✅ TWILIO_AUTH_TOKEN
- ✅ TWILIO_WHATSAPP_NUMBER

### Issue: "No available workers found"

**Solution**:
- Verify workers are registered
- Check worker availability status
- Ensure workers are assigned to form category
- Check for typos in category names

### Issue: WhatsApp messages not sending

**Solution**:
- Verify Twilio credentials are correct
- Check phone numbers include country code
- Ensure WhatsApp is enabled on Twilio phone number
- Check Twilio account has credit/balance
- Verify recipient is in WhatsApp sandbox (if using sandbox)

### Issue: Form responses not received

**Solution**:
- Verify webhook URL is correct and accessible
- Check Google Sheet is properly connected
- Ensure Google Sheets API is enabled
- Verify API keys have correct permissions
- Check firewall allows incoming webhooks

## Development

### Build TypeScript
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

## Project Structure

```
src/
├── index.ts                    # Main application file
├── config/
│   └── env.ts                 # Environment configuration
├── models/
│   ├── FormResponse.ts         # Form response data models
│   └── ChurchWorker.ts         # Worker data models
├── services/
│   ├── googleForms.ts          # Google Forms integration
│   ├── whatsapp.ts             # Twilio WhatsApp service
│   └── workerRouter.ts         # Worker routing logic
├── routes/
│   ├── forms.ts                # Form endpoints
│   └── webhooks.ts             # Webhook endpoints
└── utils/
    └── logger.ts               # Logging utility
```

## Security Best Practices

- ✅ Never commit `.env` file
- ✅ Use HTTPS in production
- ✅ Add rate limiting
- ✅ Implement authentication
- ✅ Validate all inputs
- ✅ Don't log sensitive data
- ✅ Use environment variables for secrets

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Admin dashboard
- [ ] Multi-language support
- [ ] SMS fallback notifications
- [ ] Message scheduling
- [ ] Analytics and reporting
- [ ] Multi-organization support
- [ ] Custom message templates
- [ ] Worker performance metrics
- [ ] Automated escalation rules

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Open an issue on GitHub
3. Contact: support@church.com

---

**Made with ❤️ for churches and faith communities**
