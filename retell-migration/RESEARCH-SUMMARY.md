# Retell AI Capabilities Research Summary

## Architecture Overview

Retell AI is a comprehensive platform for building voice AI agents with three main architectural approaches:

### 1. Single Prompt Agent
- One comprehensive system prompt defines all behavior
- Best for: Simple conversations, quick prototypes, 1-3 functions
- Limitations: Can experience behavioral drift with complex scenarios

### 2. Multi-Prompt Agent
- Structured tree of states, each with focused prompt
- State-specific functions and transition logic
- Better for: Complex flows, conditional branching, predictable behavior

### 3. Conversation Flow Agent
- Visual node-based builder
- Most fine-grained control over conversation paths
- Best for: Enterprise use, complex multi-step processes

## Voice Options

### Recommended Female Voices for Sarah:
| Voice ID | Provider | Characteristics |
|----------|----------|-----------------|
| `11labs-Bella` | ElevenLabs | Warm, professional, natural |
| `11labs-Rachel` | ElevenLabs | Friendly, clear, approachable |
| `11labs-Jessica` | ElevenLabs | Confident, mature |
| `cartesia-Lily` | Cartesia | Youthful, expressive |
| `minimax-Emma` | MiniMax | Warm, engaging |

### Voice Settings:
- **Speed**: 0.9-1.0 (0.95 recommended for clarity)
- **Temperature**: 0.8-1.0 (controls variation)
- **Model**: `eleven_turbo_v2_5` (fast, natural)

## Function Calling (Tools)

Retell supports custom function calling similar to OpenAI:

### How It Works:
1. Define functions in agent configuration with JSON schema
2. Agent decides when to call function based on conversation
3. Function executes and returns result to agent
4. Agent continues conversation naturally

### Function Types:
- **Custom Functions**: Your own API endpoints
- **Built-in Utilities**: Calendar, SMS, transfers
- **External Integrations**: CRM, databases, etc.

### For Rake & Clover:
Current function: `capture_lead`
Future possibilities:
- `check_availability` - Check Jonathan's calendar
- `book_appointment` - Schedule directly
- `send_sms_confirmation` - Text confirmation to caller
- `lookup_pricing` - Dynamic pricing based on property details

## Webhook Events

### Voice Call Events:
| Event | Trigger | Use Case |
|-------|---------|----------|
| `call_started` | Call connects | Log call start |
| `call_ended` | Call ends | Cleanup, logging |
| `call_analyzed` | Analysis complete | Send email notification |
| `transcript_updated` | New transcript chunk | Real-time monitoring |
| `transfer_started` | Transfer initiated | Forward to human |
| `transfer_bridged` | Transfer successful | Update CRM |
| `transfer_ended` | Transfer leg ends | Log completion |

### Webhook Spec:
- Method: POST
- Timeout: 10 seconds
- Retries: Up to 3 times
- Signature: HMAC-SHA256 verification supported

## Post-Call Analysis

Retell can automatically analyze calls with custom schemas:

### Built-in Analysis:
- Call summary
- Sentiment analysis
- Call outcome
- User satisfaction

### Custom Analysis Schema:
```json
{
  "lead_captured": "boolean",
  "service_requested": "string",
  "urgency": "enum",
  "sentiment": "enum",
  "follow_up_required": "boolean"
}
```

## Twilio Integration Options

### Option 1: Buy Number via Retell (Easiest)
- $2/month per number
- Automatic configuration
- No Twilio account needed
- Limited to 15 countries

### Option 2: Import Twilio Number
- Keep existing number
- More control over telephony
- Access to Twilio features
- Requires webhook configuration

### Option 3: Custom Telephony (SIP)
- Use your own telephony provider
- Full control
- Most complex setup

## Pricing Model

### Per-Second Billing:
- Charged by time spent in conversation
- Different rates for different LLM models
- Voice synthesis included
- Post-call analysis included

### Typical Costs:
- ~$0.05-0.10 per minute (depending on model)
- Phone number: $2/month
- No per-call fees

### Cost Optimization:
- Use cheaper models for simple routing
- Premium models only for complex interactions
- Set max call duration
- Enable voicemail detection

## Knowledge Base / RAG Capabilities

Retell doesn't have built-in RAG, but you can:

### Option 1: Include in System Prompt
- Add common Q&As to prompt
- Limited by token context

### Option 2: Function-Based Lookup
```javascript
{
  "name": "lookup_knowledge",
  "description": "Search knowledge base for information",
  "parameters": {
    "query": "string"
  }
}
```

### Option 3: External Integration
- Connect to your own vector database
- Use Pinecone, Weaviate, etc.
- Return relevant context in function result

## Advanced Features

### Dynamic Variables:
- Inject runtime data into prompts
- Example: Customer name, account info
- Passed in `retell_llm_dynamic_variables`

### Voicemail Detection:
- Automatically detect voicemail beep
- Play custom voicemail message
- Skip to end without charging for full call

### Call Transfer:
- Warm transfer to human
- Bridge calls
- Multiple transfer options

### Interruption Handling:
- Configurable sensitivity
- Barge-in detection
- Graceful handling

### Backchanneling:
- "Uh-huh", "yeah", "I see"
- Shows engagement
- Configurable enable/disable

## Monitoring & Analytics

### Dashboard Features:
- Real-time call monitoring
- Call recordings and transcripts
- Post-call analysis results
- Success/failure rates
- Cost tracking

### API Endpoints:
- List calls
- Get call details
- Download recordings
- Export transcripts

## Comparison: Retell vs OpenAI Realtime

| Feature | Retell | OpenAI Realtime |
|---------|--------|-----------------|
| Stability | ✅ More stable | ⚠️ Experimental |
| Hallucinations | ✅ Less prone | ⚠️ More frequent |
| Voice Quality | ✅ Excellent | ✅ Good |
| Latency | ✅ Low | ✅ Low |
| Pricing | ✅ Predictable | ✅ Competitive |
| Webhooks | ✅ Built-in | ❌ Manual polling |
| Phone Numbers | ✅ Integrated | ❌ External (Twilio) |
| Call Analysis | ✅ Automatic | ❌ Manual |
| Ease of Setup | ✅ Dashboard | ❌ API only |
| Fine-tuning | ✅ Multi-prompt | ❌ Single prompt |
| Tools/Functions | ✅ Supported | ✅ Supported |

## Recommendation for Rake & Clover

**Use Single Prompt Agent to start** because:
- Simple conversation flow
- Quick to set up and iterate
- Good balance of control and flexibility
- Can migrate to Multi-Prompt later if needed

**Upgrade to Conversation Flow if**:
- Need more than 5 functions
- Complex conditional logic
- Want visual flow builder
- Require enterprise-grade control

## Next Steps for Future Enhancements

1. **Appointment Booking**: Add calendar integration
2. **SMS Follow-up**: Automated confirmation texts
3. **CRM Integration**: Auto-create leads in CRM
4. **Dynamic Pricing**: Calculate quotes based on property details
5. **Availability Check**: Real-time schedule checking
6. **Knowledge Base**: FAQ lookup for common questions
