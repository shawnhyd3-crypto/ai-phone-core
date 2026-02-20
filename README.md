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
    "phone": "+1-555-555-5555"
  },
  "assistant": {
    "name": "Sarah",
    "greeting": "Hello! Thanks for calling. How can I help?"
  },
  "services": [
    { "name": "Service 1", "description": "Description" }
  ]
}
```

See existing configs in `clients/` for examples.

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

## Architecture

```
ai-phone-core/
├── src/
│   ├── server.js          # Main server (shared)
│   └── config-loader.js   # Loads client config
├── clients/               # Client-specific configs
│   ├── rake-clover.json
│   ├── crystal-window.json
│   └── hyde-tech-demo.json
└── package.json
```

Each Render service:
- Same codebase
- Different `CLIENT_ID` env var
- Different Twilio phone number
