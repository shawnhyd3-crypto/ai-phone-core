# AI Phone Core

Shared AI phone assistant codebase. One core, multiple clients.

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your credentials

# Run locally
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLIENT_ID` | Yes | Client config to load (e.g., `rake-clover`, `crystal-window`) |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio auth token |
| `SENDGRID_API_KEY` | No | SendGrid API key for email summaries |
| `PORT` | No | Server port (default: 3000) |

## Client Configuration

Add new clients by creating a JSON file in `clients/`:

```json
{
  "business": {
    "name": "Your Business",
    "owner": "Owner Name",
    "email": "owner@business.com",
    "phone": "+1-555-555-5555",
    "location": "City, State"
  },
  "assistant": {
    "name": "Sarah",
    "personality": "Friendly, professional, helpful",
    "voice": "alloy"
  },
  "greetings": {
    "variations": [
      "Hello! Thanks for calling...",
      "Hi there! You've reached..."
    ]
  },
  "services": [
    { 
      "name": "Service 1", 
      "description": "Description",
      "pricing": "Starting at $X"
    }
  ],
  "hours": {
    "monday": "8:00 AM - 6:00 PM",
    "tuesday": "8:00 AM - 6:00 PM",
    ...
  },
  "calendar": {
    "mode": "lead_capture"
  },
  "email": {
    "enabled": true,
    "to": "owner@business.com"
  }
}
```

See existing configs in `clients/` for full examples.

## Deployment

### Render (Recommended)

1. Create new Web Service from this repo
2. Set environment variables:
   - `CLIENT_ID=rake-clover` (or other client)
   - API keys for OpenAI, Twilio, SendGrid
3. Deploy

### Multiple Clients on Render

Create separate services pointing to the same repo:
- `ai-phone-rake-clover` → `CLIENT_ID=rake-clover`
- `ai-phone-crystal-window` → `CLIENT_ID=crystal-window`

Each service gets its own phone number in Twilio.

## Adding Features

1. Edit `src/server.js` or add modules in `src/`
2. Test on dev environment
3. Deploy → all clients get the update

## Available Clients

Run this to list configured clients:
```bash
node -e "console.log(require('./src/config-loader').listAvailableClients())"
```

## Dynamic Features (Jon's Features for All Clients)

The prompt engine generates context-aware prompts with:

- **Random greeting variations** — Different greeting each call
- **Time-aware greetings** — "Good morning!", "Good afternoon!" etc.
- **Business hours awareness** — Prompt includes OPEN/CLOSED status
- **Calendar modes** — Support for Google Calendar, Jobber, or lead capture
- **Silence detection** — Auto-end calls after prolonged silence

### Test Config Loading

```bash
# Test any client config
node test-config.js rake-clover
node test-config.js crystal-window
```

## Architecture

```
ai-phone-core/
├── src/
│   ├── server.js          # Main server (shared)
│   ├── config-loader.js   # Loads client config + generates prompts
│   ├── prompt-engine.js   # Dynamic prompt generation
│   ├── utils.js           # Helper functions
│   └── email-templates.js # Email formatting
├── clients/               # Client-specific data only
│   ├── rake-clover.json
│   ├── crystal-window.json
│   └── hyde-tech-demo.json
├── test-config.js         # Config testing utility
└── package.json
```

### How It Works

1. **Client data** (`clients/*.json`) — Business info, services, hours, rules
2. **Prompt engine** (`src/prompt-engine.js`) — Generates dynamic system prompt
3. **Config loader** (`src/config-loader.js`) — Combines data + generated prompts
4. **Server** (`src/server.js`) — Uses `_generated.systemPrompt` and `_generated.greeting`

Each Render service:
- Same codebase
- Different `CLIENT_ID` env var
- Different Twilio phone number
