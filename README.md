# AI Phone Core - Retell AI Edition

**Multi-client AI phone assistant system powered by Retell AI.**

One platform, unlimited businesses. Better voices, lower hallucinations, integrated telephony.

---

## 🎯 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Retell Phone   │────▶│  Retell AI      │────▶│  Your Webhook   │
│  (Your Number)  │     │  (Agent)        │     │  (Email/CRM)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**What Retell Handles:**
- ✅ Phone number management
- ✅ AI voice conversation (GPT-4o + ElevenLabs/MiniMax)
- ✅ Call recording & transcription
- ✅ Post-call analysis
- ✅ Voicemail detection

**What You Handle:**
- Webhook server (optional) for email notifications, CRM integration, etc.

---

## 🚀 Quick Start

### 1. Prerequisites
- Retell AI account: https://retellai.com
- Twilio account (for browsing numbers) - optional
- SMTP credentials (Gmail, SendGrid, etc.) for emails

### 2. Clone & Install
```bash
git clone https://github.com/shawnhyd3-crypto/ai-phone-core.git
cd ai-phone-core/retell-automation
npm install
cp .env.example .env
```

### 3. Configure Environment
Edit `.env`:
```bash
# Retell API Key (from dashboard)
RETELL_API_KEY=key_xxxxxxxxxxxxx

# Email (for call notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Recipients
NOTIFY_EMAIL=you@example.com
BCC_EMAIL=client@example.com
```

### 4. Create Agent
```bash
npm run setup
```

This will:
- Create a Retell LLM with your business prompt
- Create an Agent with voice settings
- Output Agent ID for next steps

### 5. Buy Phone Number

**Option A: Use Twilio to find a specific city**
```bash
# Search for numbers in a specific location
curl -u "TWILIO_SID:TWILIO_TOKEN" \
  "https://api.twilio.com/2010-04-01/Accounts/TWILIO_SID/AvailablePhoneNumbers/CA/Local.json?InLocality=Oakville"

# Note the number you want
```

**Option B: Just pick an area code**
Go to Retell Dashboard → Phone Numbers → Buy Number → Select area code

**Then buy through Retell:**
```bash
curl -X POST https://api.retellai.com/create-phone-number \
  -H "Authorization: Bearer $RETELL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+12895551234",
    "inbound_agent_id": "agent_xxxxx",
    "outbound_agent_id": "agent_xxxxx",
    "nickname": "My Business DEV"
  }'
```

### 6. Deploy Webhook Server (Optional)
```bash
# If you want email notifications after calls
cd retell-automation
git init
git remote add origin your-repo-url
git push

# Deploy to Render/Railway/Vercel
# Set webhook URL in Retell Dashboard → Phone Numbers → [Your Number]
```

### 7. Test
Call your number. Check Retell Dashboard for:
- Call recording
- Transcript
- Post-call analysis

---

## 📂 Project Structure

```
ai-phone-core/
├── retell-automation/          # Main automation & webhook server
│   ├── setup.js                # Creates agent + LLM
│   ├── webhook-server.js       # Handles call events → sends emails
│   ├── test-call.js            # Test script
│   ├── .env.example            # Environment template
│   └── package.json
│
├── retell-migration/           # Migration docs & research
│   ├── setup-instructions.md   # Full setup guide
│   ├── RESEARCH-SUMMARY.md     # Retell capabilities
│   ├── agent-config.json       # Agent configuration example
│   └── twilio-integration.js   # (Legacy) Twilio integration code
│
├── clients/                    # Business configuration files
│   ├── rake-clover.json        # Example client config
│   └── crystal-window.json
│
└── src/                        # (Legacy) OpenAI Realtime server code
```

---

## 🎛️ Agent Configuration

Edit `retell-automation/setup.js` to customize:

### Voice Options
```javascript
const VOICE_OPTIONS = {
  recommended: [
    '11labs-Bella',      // Warm, professional
    '11labs-Rachel',     // Friendly, clear
    'minimax-Hailey',    // Natural, engaging
    'cartesia-Lily',     // Youthful, expressive
  ],
  settings: {
    voice_speed: 1.0,           // 0.5-2.0
    voice_temperature: 1.0,     // 0-2 (stability)
    enable_backchannel: true,   // "uh-huh", "yeah"
    interruption_sensitivity: 1.0 // 0-1 (easy to interrupt)
  }
}
```

### System Prompt
Edit the `SARAH_PROMPT` constant in `setup.js` with your:
- Business name & services
- Greeting message
- Required information to collect
- Pricing & hours
- Conversation style

### Post-Call Analysis
Customize what data to extract:
```javascript
post_call_analysis_data: [
  {
    type: 'string',
    name: 'customer_name',
    description: 'The name of the customer'
  },
  {
    type: 'enum',
    name: 'service_requested',
    choices: ['lawn_mowing', 'snow_removal', 'cleanup']
  }
]
```

---

## 🔧 Common Tasks

### Update Agent Prompt
1. Edit `setup.js` → `SARAH_PROMPT`
2. Re-run: `npm run setup` (will update existing agent)
3. Test: Call your number

### Change Voice
```bash
# Via API
curl -X PATCH https://api.retellai.com/update-agent/agent_xxxxx \
  -H "Authorization: Bearer $RETELL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"voice_id": "11labs-Rachel"}'
```

Or: Retell Dashboard → Agents → [Agent] → Edit → Voice

### View Call Logs
Dashboard → Phone Numbers → [Number] → Calls

Or via API:
```bash
curl -H "Authorization: Bearer $RETELL_API_KEY" \
  https://api.retellai.com/v2/list-calls
```

### Test Webhook Locally
```bash
cd retell-automation
npm run webhook  # Starts on port 3000

# In another terminal
curl -X POST http://localhost:3000/webhook/call-ended \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

---

## 💰 Pricing

| Item | Retell AI | Twilio + OpenAI (old) |
|------|-----------|----------------------|
| Phone Number | $2/month | $1.15/month + setup |
| Per-Minute | $0.05-0.10 | $0.06 + $0.0085 |
| Recording | Included | DIY |
| Transcription | Included | DIY |
| Post-Call Analysis | Included | DIY |
| **5-min call** | **~$0.25-0.50** | **~$0.40 + complexity** |

**Retell is cheaper AND simpler.**

---

## 🔄 Migration from Twilio + OpenAI

If you have existing Twilio + OpenAI Realtime setup:

### Option 1: Import Number to Retell
Dashboard → Phone Numbers → Import Number → Twilio
- Enter Twilio SID + Auth Token
- Select number to import
- Retell takes over webhooks

### Option 2: Keep Both Running
- Buy new Retell number for testing
- Keep old Twilio number live
- Migrate when confident

### Option 3: Fresh Start
- Buy new number in Retell
- Update client/marketing materials
- Port old number later (if needed)

---

## 🧪 Testing

### Manual Testing
1. Call the number
2. Go through full conversation
3. Check Retell Dashboard:
   - Recording quality
   - Transcript accuracy
   - Post-call analysis results
4. Verify email received (if webhook configured)

### Automated Testing (WIP)
```bash
npm run test-call
```

---

## 🚨 Troubleshooting

### Agent doesn't answer
- Check Retell Dashboard → Phone Numbers → Verify agent is bound
- Check agent status (active/inactive)
- Verify phone number purchased successfully

### Voice sounds robotic
- Try different voice: Dashboard → Agent → Voice Settings
- Adjust voice_temperature (0.8-1.0)
- Adjust voice_speed (0.9-1.0)

### Email notifications not working
- Check webhook URL in Retell Dashboard
- Verify SMTP credentials in `.env`
- Check webhook server logs
- Test with: `npm run webhook` locally

### Agent going off-topic
- Lower LLM temperature in `setup.js` (try 0.1-0.3)
- Strengthen system prompt with "DO NOT" instructions
- Add guardrails in Retell Dashboard

---

## 📚 Resources

- **Retell Docs:** https://docs.retellai.com
- **API Reference:** https://docs.retellai.com/api-references
- **Dashboard:** https://dashboard.retellai.com
- **Support:** support@retellai.com

---

## 🤝 Credits

- **System Architecture:** Hyde Tech Solutions
- **Conversation Design:** Based on Rake & Clover production system (Jonathan Hynes)
- **Platform:** Retell AI

---

## 📝 License

MIT

---

## 🔥 Current Status

**Production:**
- ✅ Rake & Clover DEV: (289) 815-0431 - Oakville, ON
- ✅ Agent: Sarah (agent_af0d2e3876b2cbfc55fa668178)
- 🔄 Webhook: Configuring email notifications
- 🔄 Optimization: Sarah (sub-agent) researching best settings

**Next Steps:**
1. Configure webhook for email notifications
2. Optimize agent based on Sarah's research
3. Purchase Crystal Window number
4. Migrate Rake & Clover LIVE number

---

Last Updated: 2026-02-20
