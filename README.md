# Sarah AI Receptionist
## Rake & Clover Landscaping - Retell AI Implementation

An AI-powered phone receptionist that handles inbound calls, captures leads, and sends detailed email notifications. Built with Retell AI and deployable on Render.

---

## Features

- 🤖 **Human-like conversations** with natural speech patterns
- 📞 **Lead capture** with structured function calling
- 📧 **Email notifications** with transcripts and recordings
- 📊 **Post-call analysis** for lead quality and follow-up priority
- 📮 **Voicemail detection** with automatic message delivery
- 🔧 **Webhook server** for real-time call event handling

---

## Quick Start

### 1. Clone and Install

```bash
git clone [your-repo-url]
cd ai-phone-core
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Run Locally

```bash
npm start
```

### 4. Deploy to Render

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed deployment instructions.

---

## File Structure

```
.
├── webhook-server.js           # Production webhook server
├── sarah-agent-config.json     # Complete agent configuration
├── SARAH_PROMPT_HUMAN_LIKE.md  # Full system prompt
├── package.json                # Dependencies
├── .env.example                # Environment template
├── SETUP_GUIDE.md              # Detailed setup instructions
├── CRYSTAL_WINDOW_QUICK_REF.md # Quick ref for replicating
└── README.md                   # This file
```

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Caller    │────▶│  Retell AI   │────▶│   Sarah     │
│  (Phone)    │     │  (Voice AI)  │     │  (Agent)    │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                                                ▼
                                        ┌──────────────┐
                                        │  Functions   │
                                        │ capture_lead │
                                        │ check_area   │
                                        │ get_pricing  │
                                        └──────────────┘
                                                │
                                                ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Email     │◀────│   Webhook    │◀────│  Post-Call  │
│  (Gmail)    │     │   Server     │     │  Analysis   │
└─────────────┘     │  (Render)    │     └─────────────┘
                    └──────────────┘
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | Health check |
| `/webhooks/retell` | POST | Main webhook endpoint |
| `/api/calls` | GET | List recent calls |
| `/api/calls/:callId` | GET | Get specific call |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `SMTP_HOST` | Yes | Email server host |
| `SMTP_PORT` | Yes | Email server port |
| `SMTP_USER` | Yes | Email username |
| `SMTP_PASS` | Yes | Email password/app password |
| `NOTIFY_EMAIL` | Yes | Primary notification recipient |
| `BCC_EMAIL` | No | BCC recipient |
| `RETELL_WEBHOOK_SECRET` | No | Webhook verification secret |

---

## Lead Capture Function

When a caller provides their information, Sarah calls the `capture_lead` function:

```json
{
  "name": "John Smith",
  "phone": "905-555-1234",
  "address": "123 Main Street, Hamilton, ON",
  "service": "lawn_mowing",
  "timing": "this week",
  "urgency": "this_week",
  "property_type": "residential",
  "details": "Large backyard, approximately 0.5 acres"
}
```

---

## Email Notifications

Emails include:
- Call details (duration, timestamp, recording link)
- Lead information (formatted nicely)
- Post-call analysis (lead quality, sentiment, urgency)
- Full conversation transcript
- Priority indicators for hot leads

---

## Human-Like Behaviors

Sarah incorporates natural human receptionist behaviors:

- **Micro-acknowledgments**: "Uh-huh", "Yeah", "Got it"
- **Thinking sounds**: "Hmm...", "Well...", "Let's see..."
- **Paper shuffling**: "Let me grab a pen..."
- **Self-correction**: "Sorry, I mean..."
- **Personal touches**: "That sounds like a nice property"
- **Casual language**: "No worries", "Sounds good", "Perfect"

---

## Testing

Run test scenarios:

```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/webhooks/retell \
  -H "Content-Type: application/json" \
  -d '{
    "event": "call_started",
    "call": {
      "call_id": "test-123",
      "from_number": "+19055551234"
    }
  }'
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for full test scenarios.

---

## Replicating for Other Businesses

Want to use this for another business? See [CRYSTAL_WINDOW_QUICK_REF.md](./CRYSTAL_WINDOW_QUICK_REF.md) for a quick reference on adapting this system.

Key changes needed:
1. Update business name, owner, services
2. Update pricing and service area
3. Rewrite system prompt
4. Update email configuration
5. Deploy new instance

---

## Support

- **Setup Issues**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Replication Guide**: See [CRYSTAL_WINDOW_QUICK_REF.md](./CRYSTAL_WINDOW_QUICK_REF.md)
- **Retell Docs**: [docs.retellai.com](https://docs.retellai.com)
- **Render Docs**: [render.com/docs](https://render.com/docs)

---

## License

MIT License - Feel free to adapt for your business.

---

## Credits

Built for Rake & Clover Landscaping in Hamilton, Ontario.

- **Owner**: Jonathan Hynes
- **Developer**: Hyde Technologies
- **AI Platform**: Retell AI
- **Hosting**: Render