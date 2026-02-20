# AI Phone Core

Multi-client AI phone assistant system. One codebase serves unlimited businesses.

## Architecture

**Hybrid Approach:** Jon's proven conversation structure + dynamic multi-client support

- **Single codebase** serves multiple clients via JSON configuration
- **Proven prompts** based on production-tested Rake & Clover system
- **Dynamic generation** adapts to business hours, calendar modes, and client data

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Twilio Phone   │────▶│  Render Service │────▶│  OpenAI Realtime│
│  (per client)   │     │  (shared code)  │     │  (AI voice)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Client Config  │
                        │  (JSON file)    │
                        └─────────────────┘
```

## Quick Start

```bash
# Clone and setup
git clone https://github.com/shawnhyd3-crypto/ai-phone-core.git
cd ai-phone-core
npm install

# Environment variables
cp .env.example .env
# Edit .env with your credentials

# Test config loading
node test-config.js rake-clover

# Run locally
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLIENT_ID` | Yes | Client to load: `rake-clover`, `crystal-window`, `hyde-tech-demo` |
| `OPENAI_API_KEY` | Yes | OpenAI API key with realtime access |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio auth token |
| `SENDGRID_API_KEY` | Yes | SendGrid API key for email summaries |
| `FROM_EMAIL` | No | From address for emails (default: noreply@hydetech.ca) |
| `PORT` | No | Server port (default: 3000) |

## Adding a New Client

1. **Create client config** in `clients/[business-name].json`:

```json
{
  "business": {
    "name": "Your Business Name",
    "owner": "Owner Full Name",
    "email": "owner@business.com",
    "phone": "+1-555-555-5555",
    "website": "https://yourbusiness.com",
    "location": "City, State"
  },
  "assistant": {
    "name": "Sarah",
    "personality": "Friendly, professional, helpful",
    "voice": "marin"
  },
  "greetings": {
    "variations": [
      "Thanks for calling Your Business! This is Sarah. How can I help?",
      "Hi! You've reached Your Business. This is Sarah. How can I help today?",
      "Hey there! Sarah from Your Business. What can I do for you today?"
    ]
  },
  "services": [
    {
      "name": "Service Name",
      "description": "What this service includes",
      "pricing": "Starting at $X"
    }
  ],
  "pricing": {
    "currency": "CAD",
    "minimum": "$150 plus HST",
    "quote": "Free estimates available"
  },
  "hours": {
    "monday": "8:00 AM - 6:00 PM",
    "tuesday": "8:00 AM - 6:00 PM",
    "wednesday": "8:00 AM - 6:00 PM",
    "thursday": "8:00 AM - 6:00 PM",
    "friday": "8:00 AM - 6:00 PM",
    "saturday": "8:00 AM - 4:00 PM",
    "sunday": "Closed"
  },
  "serviceArea": [
    "City 1",
    "City 2",
    "City 3"
  ],
  "calendar": {
    "mode": "lead_capture"
  },
  "email": {
    "enabled": true,
    "to": "owner@business.com",
    "summarySubject": "New Call Summary",
    "voicemailSubject": "New Voicemail"
  },
  "callHandling": {
    "maxDuration": 600,
    "voicemailAfter": 300,
    "silenceThreshold": 10
  }
}
```

2. **Test the config**:
```bash
node test-config.js your-business-name
```

3. **Deploy new Render service**:
   - Point to `ai-phone-core` repo
   - Set `CLIENT_ID=your-business-name`
   - Add Twilio phone number webhook → `https://your-service.onrender.com/incoming-call`

## Features

### Conversation Quality (Jon's Proven Structure)
- **Randomized greetings** — Natural variation each call
- **Business hours awareness** — Knows if open/closed
- **Structured conversation flow** — Proven from 100+ real calls
- **Speaking style rules** — Short sentences, contractions, natural pauses
- **Smart acknowledgments** — "Perfect!", "Got it.", "Great."
- **Explicit closing** — Clean handoffs, proper goodbyes

### Calendar Modes

| Mode | Behavior |
|------|----------|
| `lead_capture` | Take detailed message, promise callback (default) |
| `google` | Check availability, book appointments, send invites |
| `jobber` | Capture quote details, pass to owner (no direct booking) |

### Call Handling
- **Dual-channel recording** — Separate caller/AI tracks
- **Whisper transcription** — Timestamped transcripts
- **GPT summaries** — Automated call summaries
- **Email delivery** — Audio + transcript + summary
- **Silence detection** — Auto-end after prolonged silence

## Deployment Guide

### Render Setup (Per Client)

1. **Create Web Service**
   - Name: `ai-phone-[client-name]`
   - Root Directory: (leave empty)
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Environment Variables**
   ```
   CLIENT_ID=[client-name]
   OPENAI_API_KEY=sk-...
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   SENDGRID_API_KEY=SG...
   FROM_EMAIL=calls@hydetech.ca
   ```

3. **Twilio Webhook**
   - Go to Twilio Console → Phone Numbers → Active numbers
   - Find the client's number
   - "A Call Comes In" → Webhook → `https://ai-phone-[client-name].onrender.com/incoming-call`
   - HTTP Method: POST

### Testing

```bash
# Local config test
node test-config.js [client-id]

# Health check (after deploy)
curl https://ai-phone-[client-name].onrender.com/health

# Test call (use Twilio number)
```

## File Structure

```
ai-phone-core/
├── src/
│   ├── server.js           # Main Express server (WebSocket, Twilio, OpenAI)
│   ├── prompt-engine.js    # Generates system prompts (Jon's structure + dynamic)
│   ├── config-loader.js    # Loads client JSON + validates
│   ├── utils.js            # Intent extraction, name detection, formatting
│   └── email-templates.js  # HTML/text email generation
├── clients/
│   ├── rake-clover.json    # Rake and Clover Landscaping
│   ├── crystal-window.json # Crystal Window & Gutter Cleaning
│   └── hyde-tech-demo.json # Hyde Tech demo
├── test-config.js          # Config testing utility
├── package.json
└── README.md
```

## How It Works

### 1. Call Flow
```
Caller → Twilio → /incoming-call → WebSocket → OpenAI Realtime → AI Voice
                ↓
         Recording starts
                ↓
         Call ends → Process recording → Transcribe → Summarize → Email
```

### 2. Prompt Generation
```javascript
// 1. Load client config
const config = loadClient('rake-clover');

// 2. Generate prompt (embeds greeting + conversation structure)
const prompt = promptEngine.generateSystemPrompt({
  calendarMode: 'lead_capture',
  timeOfDay: 'afternoon'
});

// 3. Send to OpenAI Realtime API
openai.session.update({ instructions: prompt });
```

### 3. Generated Prompt Example
```
You're Sarah, the friendly receptionist for Rake and Clover Landscaping...

START WITH: "Hey there! Sarah from Rake and Clover. What can I do for you today?"

Then ask: "What can I help you with today?"

AFTER they describe the service:
1. Ask: "Perfect! And who's calling?"
...

SPEAKING STYLE:
- Keep sentences SHORT (under 15 words each)
- Use contractions (it's, we're, that's, I'll)
...

ACKNOWLEDGMENTS: "Perfect!", "Got it.", "Great.", "Okay!", "Sounds good."
```

## Troubleshooting

### Silence after recording disclaimer
- Check Render logs for OpenAI connection errors
- Verify `OPENAI_API_KEY` has realtime access
- Check model version matches (`gpt-4o-realtime-preview-2024-12-17`)

### Emails not sending
- Verify `SENDGRID_API_KEY` is valid
- Check `FROM_EMAIL` is verified in SendGrid
- Check spam folders

### WebSocket errors
- Ensure Twilio webhook uses `wss://` (not `ws://`)
- Check Render service is not sleeping (upgrade to paid plan)

## Development

### Adding Features
1. Edit relevant file in `src/`
2. Test locally with `npm run dev`
3. Commit and push
4. All clients get the update on next deploy

### Modifying Prompts
Edit `src/prompt-engine.js` → affects all clients with generated structure.

### Client-Specific Changes
Edit `clients/[name].json` → affects only that client.

## Credits

- **Conversation design** based on Rake & Clover Landscaping production system by Jonathan Hynes
- **Multi-client architecture** by Hyde Tech Solutions
- **Powered by** OpenAI Realtime API, Twilio, SendGrid

## License

MIT
