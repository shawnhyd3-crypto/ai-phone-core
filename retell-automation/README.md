# Retell AI Automation for Sarah

Complete automation suite for deploying Sarah, the AI receptionist for Rake & Clover Landscaping on Retell AI.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Run setup:**
   ```bash
   npm run setup
   ```

## Files

- `setup.js` - Main automation script (creates LLM, Agent, Phone)
- `webhook-server.js` - Webhook handler for call events
- `test-call.js` - Script to test the deployed agent
- `.env` - Environment variables (not in git)

## Environment Variables

Required in `.env`:
- `RETELL_API_KEY` - Your Retell API key
- `EMAIL_USER` - SMTP username for webhook emails
- `EMAIL_PASS` - SMTP password
- `EMAIL_HOST` - SMTP host (default: smtp.gmail.com)

Optional:
- `WEBHOOK_PORT` - Port for webhook server (default: 3000)
- `NGROK_AUTH_TOKEN` - For automatic tunneling

## What the Setup Does

1. Creates a Retell LLM with Sarah's complete system prompt
2. Creates an Agent using the LLM and Bella voice
3. Purchases a 289 area code phone number
4. Outputs all IDs and webhook URL for configuration

## Post-Setup

After running `npm run setup`:

1. Start the webhook server:
   ```bash
   npm run webhook
   ```

2. Configure your webhook URL in Retell dashboard (or use ngrok for local testing)

3. Test with:
   ```bash
   npm run test
   ```

## Troubleshooting

**"RETELL_API_KEY not set"**
- Create `.env` file and add your API key

**Phone number unavailable**
- 289 area code numbers may be limited; script will suggest alternatives

**Webhook not receiving calls**
- Ensure webhook server is running
- Check firewall settings
- Verify webhook URL is configured in Retell dashboard

## Support

For issues with the Retell API, see: https://docs.retellai.com/
