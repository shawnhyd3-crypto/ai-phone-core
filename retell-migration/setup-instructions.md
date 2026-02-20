# Retell AI Migration Guide - Rake & Clover Landscaping

## Overview
This guide walks you through migrating from OpenAI Realtime API to Retell AI for the Rake & Clover Landscaping phone agent.

---

## Prerequisites

### Accounts Required
1. **Retell AI Account**: Sign up at https://retellai.com
2. **Twilio Account**: For phone number management (you likely already have this)
3. **Server/VPS**: To host the webhook endpoint (or use serverless like Vercel/Netlify)

### API Keys Needed
- Retell AI API Key (from Retell dashboard)
- Twilio Account SID and Auth Token
- SMTP credentials for email notifications

---

## Step-by-Step Setup

### Step 1: Create Retell AI Account

1. Go to https://retellai.com and sign up
2. Complete the onboarding process
3. Navigate to the Dashboard
4. Copy your API Key from Settings → API Keys

### Step 2: Create the Agent

#### Option A: Via Dashboard (Recommended for First Setup)

1. Click "Create Agent" in the Retell dashboard
2. Select "Single Prompt Agent" (good starting point)
3. Configure using settings from `agent-config.json`

**Key Configuration Points:**
- **Voice**: Test `11labs-Bella` or `11labs-Rachel` - both sound natural and professional
- **Response Engine**: Select `Retell LLM` with `gpt-4o`
- **System Prompt**: Copy from `agent-config.json` prompt.system_prompt field
- **Begin Message**: "Hi, thanks for calling Rake and Clover. This is Sarah. What can I help you with?"

#### Option B: Via API

```bash
curl -X POST https://api.retellai.com/create-agent \
  -H "Authorization: Bearer $RETELL_API_KEY" \
  -H "Content-Type: application/json" \
  -d @agent-config.json
```

### Step 3: Set Up Webhook Server

1. Deploy `webhook-server.js` to your server
2. Set environment variables:

```bash
# Required
export RETELL_API_KEY="your_retell_api_key"
export RETELL_WEBHOOK_SECRET="your_webhook_secret"

# Email (SMTP)
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="your_email@gmail.com"
export SMTP_PASS="your_app_password"

# Optional
export PORT="3000"
```

3. Install dependencies:
```bash
npm install express nodemailer dotenv
```

4. Start the server:
```bash
node webhook-server.js
```

5. Test the webhook endpoint:
```bash
curl https://your-domain.com/health
```

### Step 4: Configure Webhook URL in Retell

1. In Retell dashboard, go to your agent settings
2. Under "Webhook", enter your URL:
   ```
   https://your-domain.com/webhooks/retell
   ```
3. Select events: `call_started`, `call_ended`, `call_analyzed`, `transcript_updated`
4. Save changes

### Step 5: Buy or Import Phone Number

#### Option A: Buy Number via Retell (Easiest)

1. In Retell dashboard, go to "Phone Numbers"
2. Click "Buy Number"
3. Search for a Canadian number (area code 289, 365, or 905 for Hamilton region)
4. Purchase the number ($2/month)

#### Option B: Import Twilio Number

1. Go to Retell dashboard → Phone Numbers
2. Click "Import Number"
3. Select "Twilio"
4. Enter your Twilio credentials
5. Authorize Retell to manage the number

### Step 6: Bind Agent to Phone Number

1. In Retell dashboard → Phone Numbers
2. Find your number
3. Set **Inbound Agent**: Select "Sarah - Rake and Clover Landscaping"
4. Set **Outbound Agent**: Same agent (for callbacks)
5. Save configuration

### Step 7: Test the Setup

1. Call your Retell number from your personal phone
2. Verify Sarah answers with correct greeting
3. Go through a test conversation
4. Check that you receive an email with the call summary
5. Review the call recording and transcript in Retell dashboard

---

## Twilio Integration (If Keeping Twilio Number)

If you want to keep using your existing Twilio number instead of buying through Retell:

### Method 1: Import Number to Retell

1. In Retell: Phone Numbers → Import Number → Twilio
2. Enter your Twilio Account SID and Auth Token
3. Select the number to import
4. Retell will configure the webhooks automatically

### Method 2: Manual Twilio Configuration

If you need to keep Twilio in the loop (for call tracking, etc.):

1. In Twilio Console → Phone Numbers → Manage → Active Numbers
2. Click your number
3. Under "Voice & Fax":
   - Configure with Webhooks, TwiML Bins, Functions, etc.
   - Set "A Call Comes In" webhook to Retell's Twilio endpoint
   
4. Retell will provide you with a TwiML URL when you create a custom telephony integration

See `twilio-integration.js` for code example.

---

## Post-Migration Checklist

### Immediate Testing (Day 1)
- [ ] Call the number and verify Sarah answers
- [ ] Test greeting message sounds natural
- [ ] Test name collection (including spelling confirmation)
- [ ] Test phone number collection with repeat-back
- [ ] Test address collection with confirmation
- [ ] Test service identification
- [ ] Complete a full test call and verify email received
- [ ] Check that `capture_lead` function was called

### First Week Monitoring
- [ ] Monitor call success rate in Retell dashboard
- [ ] Review call recordings for quality
- [ ] Check email notifications are working
- [ ] Verify callback expectation is clear to callers
- [ ] Test voicemail handling
- [ ] Check for any off-topic conversations

### Fine-Tuning (Week 2-4)
- [ ] Adjust system prompt based on real call patterns
- [ ] Add fine-tuning examples for edge cases
- [ ] Optimize voice speed/temperature if needed
- [ ] Review post-call analysis accuracy
- [ ] Adjust interruption sensitivity

---

## Environment Variables Reference

Create a `.env` file in your webhook server directory:

```env
# Retell AI
RETELL_API_KEY=retell_key_xxxxxxxxxxxxxx
RETELL_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx

# Email (Gmail SMTP example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Optional
PORT=3000
NODE_ENV=production
```

---

## Troubleshooting

### Issue: Webhook not receiving events
**Solution**: 
- Check webhook URL is publicly accessible
- Verify SSL certificate is valid
- Check server logs for errors
- Ensure webhook is set at account level or agent level (not both)

### Issue: Email notifications not sending
**Solution**:
- Verify SMTP credentials
- Check spam/junk folders
- For Gmail: Use App Password, not regular password
- Check server logs for email errors

### Issue: Agent not answering calls
**Solution**:
- Verify phone number has inbound agent assigned
- Check call logs in Retell dashboard
- Test with Retell's built-in test call feature first
- Verify number is active (not suspended)

### Issue: Voice sounds robotic
**Solution**:
- Try different voice IDs (Bella, Rachel, Jessica)
- Adjust voice_temperature (0.8-1.0 for more natural)
- Adjust voice_speed (0.9-0.95 for slightly slower)
- Enable dynamic voice speed

### Issue: Agent hallucinating/off-topic
**Solution**:
- Lower LLM temperature (0.3 or lower)
- Strengthen system prompt boundaries
- Add more explicit "DO NOT" instructions
- Consider switching to Conversation Flow agent for more control

### Issue: Not collecting all lead information
**Solution**:
- Review system prompt to emphasize required fields
- Add examples in prompt showing proper data collection
- Enable function calling confirmation
- Check function schema is correct

---

## Cost Estimates

### Retell AI Pricing (as of 2024)
- **Phone Number**: $2/month
- **Inbound Calls**: $0.05-0.10/minute (depends on model)
- **Outbound Calls**: $0.05-0.10/minute
- **Post-Call Analysis**: Included

### Typical Monthly Costs (Estimated)
- 50 calls × 3 minutes avg = 150 minutes
- Cost: ~$15-25/month (including number rental)

### Cost Optimization
- Use `gpt-4o-mini` for simpler conversations (cheaper)
- Use `gpt-4o` only for complex interactions
- Set max_call_duration_ms to prevent long calls
- Enable voicemail detection to avoid voicemail costs

---

## Advanced: Conversation Flow Agent

If you need more control than single prompt provides, consider upgrading to Conversation Flow Agent:

### When to Upgrade
- Agent exceeds 1000 words in prompt
- Need more than 5 functions
- Complex branching logic needed
- Want more predictable behavior

### Migration Steps
1. Export current agent configuration
2. Create new "Conversation Flow" agent
3. Design nodes for each conversation phase
4. Set up transitions between nodes
5. Test thoroughly before switching phone number

---

## Support & Resources

### Retell AI Resources
- Documentation: https://docs.retellai.com
- Support: support@retellai.com
- Dashboard: https://dashboard.retellai.com

### Emergency Contacts
If issues arise during migration:
1. Check Retell status page
2. Contact Retell support
3. Have Twilio fallback ready (direct to voicemail or forward to Jonathan)

---

## Migration Timeline

| Day | Task |
|-----|------|
| 1 | Create Retell account, set up agent |
| 2 | Deploy webhook server, configure webhooks |
| 3 | Buy/import number, bind to agent |
| 4-5 | Extensive testing |
| 6 | Soft launch (forward some calls) |
| 7 | Full migration |
| 8-14 | Monitor and fine-tune |

---

## Rollback Plan

If issues arise:

1. **Immediate**: Update Twilio number to forward directly to Jonathan's cell
2. **Short-term**: Switch back to OpenAI Realtime API
3. **Investigation**: Review Retell logs and recordings
4. **Re-attempt**: Fix issues and retry migration

Keep your OpenAI setup active until you're confident Retell is working properly.
