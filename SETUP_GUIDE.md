# Sarah AI Receptionist - Setup Guide
## Rake & Clover Landscaping - Retell AI Configuration

---

## Table of Contents

1. [Overview](#overview)
2. [Deploy Webhook Server](#deploy-webhook-server)
3. [Configure Retell Dashboard](#configure-retell-dashboard)
4. [Voice Settings](#voice-settings)
5. [Test Plan](#test-plan)
6. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers the complete setup for Sarah, the AI receptionist for Rake & Clover Landscaping. After completion, Sarah will:

- Answer calls with a human-like voice and personality
- Collect lead information using structured function calling
- Send detailed email notifications after each call
- Automatically analyze calls for lead quality and follow-up priority
- Handle voicemails appropriately

### Key Files

| File | Purpose |
|------|---------|
| `webhook-server.js` | Production webhook server for Render |
| `sarah-agent-config.json` | Complete agent configuration with functions |
| `SARAH_PROMPT_HUMAN_LIKE.md` | Full system prompt with human-like behaviors |
| `package.json` | Node.js dependencies |
| `.env.example` | Environment variable template |

---

## Deploy Webhook Server

### Step 1: Create Render Account

1. Go to [render.com](https://render.com) and sign up/login
2. Create a new **Web Service**
3. Connect your GitHub repository (or use "Deploy from Git" later)

### Step 2: Deploy Configuration

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**

| Variable | Value | Description |
|----------|-------|-------------|
| `SMTP_HOST` | `smtp.gmail.com` | Email server |
| `SMTP_PORT` | `587` | Email port |
| `SMTP_USER` | Your Gmail | Sending email address |
| `SMTP_PASS` | App Password | Gmail App Password (not your regular password!) |
| `NOTIFY_EMAIL` | `shawn.hyde@hydetech.ca` | Primary notification recipient |
| `BCC_EMAIL` | `rake.clover.landscaping@gmail.com` | BCC recipient |
| `RETELL_WEBHOOK_SECRET` | (from Retell) | Webhook verification secret |

### Step 3: Gmail App Password Setup

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Other (Custom name)" → name it "Sarah Webhook"
5. Copy the 16-character password
6. Use this as `SMTP_PASS` (NOT your regular Gmail password)

### Step 4: Verify Deployment

After deployment, your webhook URL will be:
```
https://your-service-name.onrender.com/webhooks/retell
```

Test it:
```bash
curl https://your-service-name.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "sarah-webhook-server",
  "version": "2.0.0"
}
```

---

## Configure Retell Dashboard

### Step 1: Create/Edit Agent

1. Go to [dashboard.retellai.com](https://dashboard.retellai.com)
2. Navigate to **Agents** → Your agent (or create new)
3. Agent ID: `agent_af0d2e3876b2cbfc55fa668178`

### Step 2: Voice Settings

| Setting | Recommended Value | Notes |
|---------|-------------------|-------|
| **Voice** | `11labs-Bella` | Best natural sound for receptionist |
| **Speed** | `0.95` | Slightly slower than normal |
| **Temperature** | `0.9` | Natural variation |
| **Backchannel** | `Enabled` | Says "uh-huh", "yeah" while caller speaks |
| **Interruption** | `0.85` | Sensitive to interruptions |

Alternative voices to test:
- `11labs-Rachel` - Professional, warm
- `minimax-Emma` - Friendly, casual
- `cartesia-Lily` - Backup option

### Step 3: Model Settings

| Setting | Value |
|---------|-------|
| **Model** | `gpt-4o` |
| **Temperature** | `0.8` |
| **Max Tokens** | `250` |

### Step 4: System Prompt

Copy the content from `SARAH_PROMPT_HUMAN_LIKE.md` into the **System Prompt** field.

**Begin Message:**
```
Hi, thanks for calling Rake and Clover. This is Sarah. What can I help you with?
```

### Step 5: Function Calling

Add these functions in the **Functions** section:

#### Function 1: capture_lead

```json
{
  "name": "capture_lead",
  "description": "Capture lead information after collecting from caller. Call this when you have name, phone, address, and service.",
  "parameters": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Full name with confirmed spelling"
      },
      "phone": {
        "type": "string",
        "description": "Phone number in format XXX-XXX-XXXX"
      },
      "address": {
        "type": "string",
        "description": "Full property address"
      },
      "service": {
        "type": "string",
        "enum": ["lawn_mowing", "snow_removal", "gutter_cleaning", "spring_cleanup", "fall_cleanup", "mulching", "garden_maintenance", "other"]
      },
      "timing": {
        "type": "string",
        "description": "When they want service"
      },
      "details": {
        "type": "string",
        "description": "Additional job details"
      },
      "urgency": {
        "type": "string",
        "enum": ["immediate", "this_week", "this_month", "flexible"]
      },
      "property_type": {
        "type": "string",
        "enum": ["residential", "commercial"]
      }
    },
    "required": ["name", "phone", "address", "service"]
  }
}
```

#### Function 2: check_service_area

```json
{
  "name": "check_service_area",
  "description": "Check if an address is within the service area (Hamilton, Burlington, Oakville, Ancaster, Dundas)",
  "parameters": {
    "type": "object",
    "properties": {
      "address": {
        "type": "string",
        "description": "The address to check"
      },
      "city": {
        "type": "string",
        "description": "The city extracted from the address"
      }
    },
    "required": ["address"]
  }
}
```

#### Function 3: get_pricing_info

```json
{
  "name": "get_pricing_info",
  "description": "Get starting prices for services",
  "parameters": {
    "type": "object",
    "properties": {
      "service": {
        "type": "string",
        "enum": ["lawn_mowing", "snow_removal", "gutter_cleaning", "spring_cleanup", "fall_cleanup", "mulching", "garden_maintenance"]
      }
    },
    "required": ["service"]
  }
}
```

### Step 6: Post-Call Analysis

Enable **Post-Call Analysis** and add this schema:

```json
{
  "lead_quality": "enum (hot, warm, cold, not_lead)",
  "service_requested": "string",
  "sentiment": "enum (enthusiastic, neutral, hesitant, frustrated)",
  "price_sensitivity": "enum (high, medium, low, not_discussed)",
  "urgency": "enum (immediate, this_week, this_month, flexible)",
  "completion_status": "enum (complete_lead, partial_info, voicemail, hangup, wrong_number)",
  "follow_up_priority": "enum (call_today, call_this_week, low_priority, none)",
  "notes": "string"
}
```

### Step 7: Webhook Configuration

1. Go to **Webhooks** section
2. Add webhook URL: `https://your-render-url.onrender.com/webhooks/retell`
3. Select events:
   - ✅ `call_started`
   - ✅ `call_ended`
   - ✅ `call_analyzed`
   - ✅ `transcript_updated`
4. Copy the **Webhook Secret**
5. Add it to your Render environment variables as `RETELL_WEBHOOK_SECRET`

### Step 8: Voicemail Detection

1. Enable **Voicemail Detection**
2. Set voicemail message:
   ```
   Hi, this is Sarah calling from Rake and Clover Landscaping. I wanted to let you know we received your inquiry and Jonathan will give you a call back within a few hours today. If you need to reach us sooner, you can call this number back. Thanks, and have a great day!
   ```
3. Enable **Hang up after voicemail**

---

## Voice Settings

### Recommended Configuration

```json
{
  "voice_id": "11labs-Bella",
  "voice_speed": 0.95,
  "voice_temperature": 0.9,
  "enable_backchannel": true,
  "interruption_sensitivity": 0.85
}
```

### Testing Different Voices

If you want to test alternatives:

1. **11labs-Bella** (Recommended)
   - Warm, professional
   - Best for receptionist role
   - Natural pauses and inflection

2. **11labs-Rachel**
   - Clear, articulate
   - Slightly more formal
   - Good for professional services

3. **minimax-Emma**
   - Friendly, casual
   - Good for residential services
   - May sound younger

### A/B Testing Protocol

1. Make 5 test calls with each voice
2. Ask: "Did this sound like a real person?"
3. Track conversion rates for each
4. Choose based on both feedback and data

---

## Test Plan

### Test Scenarios

#### Test 1: Complete Lead Capture
**Caller:** "I need my lawn mowed."
**Expected Flow:**
1. Greeting
2. Service confirmed (lawn mowing)
3. Name collected with spelling confirmation
4. Phone collected with repeat-back
5. Address collected with confirmation
6. Timing asked
7. capture_lead function called
8. Close with callback expectation

**Success Criteria:**
- ✅ All required info collected
- ✅ capture_lead function triggered
- ✅ Email sent with complete lead

---

#### Test 2: Ambiguous Name Handling
**Caller:** "My name is Shawn."
**Expected:**
- "Is that S-H-A-W-N or S-E-A-N?"
- After response: "Great, Shawn — S-H-A-W-N. Got it."

**Success Criteria:**
- ✅ Spelling explicitly confirmed
- ✅ Name stored correctly

---

#### Test 3: Interruption Handling
**Caller:** Interrupts mid-sentence
**Expected:**
- "Oh, sorry — go ahead!"
- Or: "Got it! Before we continue, can I get your phone number?"

**Success Criteria:**
- ✅ Acknowledges interruption gracefully
- ✅ Redirects back to information collection

---

#### Test 4: Pricing Questions
**Caller:** "How much for snow removal?"
**Expected:**
- "Our snow removal starts at $800 for the season, but it depends on your driveway size. Jonathan can give you an exact quote when he calls back."

**Success Criteria:**
- ✅ Provides starting price
- ✅ Sets expectation for custom quote
- ✅ Doesn't make up specific pricing

---

#### Test 5: Outside Service Area
**Caller:** "I live in Mississauga."
**Expected:**
- "Hmm, let me check... Yeah, that's a bit outside our usual area. We primarily serve Hamilton, Burlington, Oakville, Ancaster, and Dundas. I'd be happy to refer you to a trusted partner in that area if you'd like?"

**Success Criteria:**
- ✅ Politely explains service area
- ✅ Offers referral
- ✅ Professional handling

---

#### Test 6: Urgent Request
**Caller:** "I need this done today!"
**Expected:**
- "Okay, I'll mark this as priority. Let me make sure I have everything..."
- Urgency flagged in analysis

**Success Criteria:**
- ✅ Acknowledges urgency
- ✅ Lead marked as high priority
- ✅ Follow-up set to "call_today"

---

#### Test 7: Voicemail Detection
**Call:** Goes to voicemail
**Expected:**
- Leaves concise message
- Hangs up immediately after
- Email still sent with voicemail notification

**Success Criteria:**
- ✅ Voicemail message delivered
- ✅ Call ends automatically
- ✅ Email indicates voicemail status

---

#### Test 8: Background Noise/Speakerphone
**Caller:** On speakerphone with background noise
**Expected:**
- "Sorry, it's a bit hard to hear — are you on speakerphone?"
- Or adapts and speaks clearly

**Success Criteria:**
- ✅ Acknowledges audio issues
- ✅ Maintains professionalism

---

#### Test 9: Shopping Around
**Caller:** "I'm getting quotes from a few companies."
**Expected:**
- "Smart! Can I grab your info so Jonathan can give you a detailed estimate? He's pretty competitive, and he'll come out and take a look at no charge."

**Success Criteria:**
- ✅ Validates caller's approach
- ✅ Still captures lead
- ✅ Positions Jonathan well

---

#### Test 10: Wrong Number/Spam
**Caller:** "Is this Joe's Pizza?"
**Expected:**
- "No, this is Rake and Clover Landscaping. You might have the wrong number."
- Ends call politely

**Success Criteria:**
- ✅ Corrects politely
- ✅ Analysis marks as "wrong_number"
- ✅ No follow-up needed

---

## Quality Checklist

### Human-Like Evaluation

- [ ] **Voice sounds natural** (not robotic)
- [ ] **Pauses feel appropriate** (not too fast/slow)
- [ ] **Uses backchanneling** ("uh-huh", "yeah")
- [ ] **Handles interruptions gracefully**
- [ ] **Varies responses** (not repetitive)
- [ ] **Confirms spellings** (names, addresses)
- [ ] **Repeats phone numbers**
- [ ] **Shows personality** (warmth, empathy)

### Technical Evaluation

- [ ] **Emails sent successfully**
- [ ] **Lead data complete in emails**
- [ ] **Recording links work**
- [ ] **Transcript included**
- [ ] **Post-call analysis accurate**
- [ ] **Function calls work**
- [ ] **Webhook events received**
- [ ] **Voicemail detection works**

---

## Troubleshooting

### Emails Not Sending

1. Check Gmail App Password (not regular password)
2. Verify SMTP_USER and SMTP_PASS in Render env vars
3. Check Render logs for error messages
4. Test email manually:
   ```javascript
   // Add to webhook-server.js temporarily
   emailTransporter.sendMail({
     to: NOTIFY_EMAIL,
     subject: 'Test',
     text: 'Test email'
   }).then(console.log).catch(console.error);
   ```

### Webhook Not Receiving Events

1. Verify webhook URL in Retell dashboard
2. Check URL ends with `/webhooks/retell`
3. Verify `RETELL_WEBHOOK_SECRET` matches Retell dashboard
4. Check Render logs for incoming requests
5. Test with curl:
   ```bash
   curl -X POST https://your-url.onrender.com/webhooks/retell \
     -H "Content-Type: application/json" \
     -d '{"event":"call_started","call":{"call_id":"test"}}'
   ```

### Function Calling Not Working

1. Verify functions are added in Retell dashboard
2. Check function names match exactly
3. Ensure required parameters are defined
4. Test in Retell playground first
5. Check webhook logs for function call events

### Voice Sounds Robotic

1. Try different voice (11labs-Bella recommended)
2. Increase voice_temperature to 0.9
3. Decrease voice_speed to 0.95
4. Enable backchanneling
5. Check system prompt includes natural language patterns

---

## Maintenance

### Monthly Tasks

- [ ] Review call recordings for quality
- [ ] Check email delivery rates
- [ ] Analyze lead conversion data
- [ ] Update pricing if needed
- [ ] Review and refine system prompt

### Monitoring

Check these endpoints regularly:
- Health: `https://your-url.onrender.com/health`
- Recent calls: `https://your-url.onrender.com/api/calls`

---

## Support

For issues or questions:
- Retell Documentation: [docs.retellai.com](https://docs.retellai.com)
- Render Documentation: [render.com/docs](https://render.com/docs)
- Email: shawn.hyde@hydetech.ca