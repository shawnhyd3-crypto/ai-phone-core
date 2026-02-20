# Retell AI Integration - Rake & Clover Landscaping

Complete migration package from OpenAI Realtime API to Retell AI.

## 📁 Files Included

| File | Description |
|------|-------------|
| `agent-config.json` | Complete Sarah agent configuration for Retell |
| `webhook-server.js` | Express server to receive Retell webhooks |
| `twilio-integration.js` | Twilio integration module |
| `conversation-flow.md` | Detailed conversation script and flow |
| `setup-instructions.md` | Step-by-step migration guide |
| `migration-checklist.md` | Checklist for migration tracking |
| `package.json` | Node.js dependencies |
| `.env.example` | Environment variables template |
| `test-webhook.js` | Test script for webhooks |

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Set up Retell agent:**
   - Create account at https://retellai.com
   - Create agent using `agent-config.json`
   - Copy agent ID to `.env`

4. **Deploy webhook server:**
   ```bash
   npm start
   ```

5. **Configure phone number:**
   - Buy or import number in Retell
   - Bind agent to number
   - Test with a call

## 📚 Documentation

- **Setup Instructions**: See `setup-instructions.md` for complete walkthrough
- **Conversation Flow**: See `conversation-flow.md` for Sarah's script
- **Migration Checklist**: See `migration-checklist.md` to track progress

## 🔧 Configuration

### Environment Variables

```env
# Required
RETELL_API_KEY=your_retell_api_key
RETELL_WEBHOOK_SECRET=your_webhook_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Twilio (if using Twilio integration)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+12895551234

# Server
PORT=3000
WEBHOOK_BASE_URL=https://your-domain.com
```

## 📞 Features

- ✅ Warm, professional voice AI
- ✅ Complete lead capture (name, phone, address, service)
- ✅ Spelling confirmation for ambiguous names
- ✅ Address confirmation with street name spelling
- ✅ Service-specific questions
- ✅ Callback expectation setting
- ✅ Voicemail detection
- ✅ Email notifications with transcripts
- ✅ Call recording links
- ✅ Post-call analysis

## 🛡️ Guardrails

- Topic restrictions (landscaping only)
- Name spelling confirmation
- Phone number repeat-back
- Address confirmation
- No off-topic conversations
- No hallucinated pricing

## 📊 Webhook Events Handled

- `call_started` - Call begins
- `call_ended` - Call completes
- `call_analyzed` - Analysis complete (triggers email)
- `transcript_updated` - Real-time transcript updates

## 🔍 Testing

```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/webhooks/retell \
  -H "Content-Type: application/json" \
  -d '{"event": "call_started", "call": {"call_id": "test"}}'

# Health check
curl http://localhost:3000/health
```

## 📈 Monitoring

- Health endpoint: `GET /health`
- Call logs: `GET /api/calls`
- Specific call: `GET /api/calls/:callId`

## 🆘 Support

- Retell Docs: https://docs.retellai.com
- Retell Support: support@retellai.com

---

Built for Rake & Clover Landscaping | Hamilton, Ontario
