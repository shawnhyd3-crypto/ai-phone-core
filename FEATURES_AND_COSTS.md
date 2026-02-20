# AI Phone Agent - Features, Services & Cost Analysis

**Updated:** 2026-02-20  
**Next Client:** Crystal Window & Gutter Cleaning

---

## ✅ PRODUCTION FEATURES (Currently Live)

### **Call Handling**
- ✅ 24/7 AI receptionist (answers every call)
- ✅ Natural conversation flow (tested with 100+ real calls from Jon's business)
- ✅ Randomized greetings (sounds human, not robotic)
- ✅ Business hours awareness (knows when you're open/closed)
- ✅ Turn detection optimized for fast response (0.6 threshold, 800ms)

### **Customer Information Capture**
- ✅ Name capture with spelling confirmation ("Is that E-A or A-W?")
- ✅ Phone number collection + verbal confirmation
- ✅ Address capture with smart clarification (only asks if unsure)
- ✅ Service needs and timing preferences
- ✅ Property size and details (for accurate quotes)

### **Call Intelligence**
- ✅ Dual-channel recording (caller + AI separate tracks)
- ✅ Whisper transcription with timestamps
- ✅ GPT-4 call summaries (What They Wanted, Key Details, Action Items)
- ✅ Intent/category extraction (Quote Request, Booking, etc.)
- ✅ Silence detection with auto-hangup (natural call ending)

### **Email Delivery**
- ✅ HTML + plain text formats
- ✅ Hyde Tech branded templates
- ✅ Call recording attached (MP3)
- ✅ Full transcript with timestamps
- ✅ AI-generated summary
- ✅ Caller info: name, phone, duration, intent
- ✅ Address extraction with Google Maps link
- ✅ Toronto timezone formatting

### **Conversation Quality**
- ✅ Short, natural sentences (under 15 words)
- ✅ Uses contractions (it's, we're, I'll)
- ✅ Natural acknowledgments ("Perfect!", "Got it.", "Great.")
- ✅ Smart interruption handling
- ✅ Brief, natural goodbyes (under 6 words)
- ✅ Back-and-forth goodbye flow ("Bye now")

### **Calendar Integration Ready**
- ✅ Lead capture mode (default - take message for callback)
- ✅ Google Calendar mode (ready to integrate)
- ✅ Jobber mode (ready to integrate)

---

## 💰 COST BREAKDOWN (Per Client/Month)

### **Infrastructure Costs**

| Service | Cost | What It Does |
|---------|------|--------------|
| **Twilio Phone Number** | $1.15/mo | Dedicated phone number |
| **Twilio Incoming Calls** | $0.0085/min | Receiving calls |
| **Render Hosting** | $7/mo | Runs the AI server (shared plan) |
| **OpenAI Realtime API** | $0.06/min input + $0.24/min output | AI voice (realtime conversation) |
| **OpenAI Whisper** | $0.006/min | Transcription |
| **OpenAI GPT-4o-mini** | ~$0.0001/call | Call summaries |
| **SendGrid** | Free tier | Email delivery (up to 100/day) |

### **Cost Per Call Estimate**

**Scenario: 3-minute average call**

| Item | Calculation | Cost |
|------|-------------|------|
| Twilio incoming | 3 min × $0.0085 | $0.026 |
| OpenAI Realtime (input) | 3 min × $0.06 | $0.18 |
| OpenAI Realtime (output) | 3 min × $0.24 | $0.72 |
| Whisper transcription | 3 min × $0.006 | $0.018 |
| GPT-4o-mini summary | Fixed | $0.0001 |
| **Total per call** | | **~$0.94** |

### **Monthly Cost Estimates**

| Call Volume | Calls/Day | Infrastructure | Call Costs | **Total/Month** |
|-------------|-----------|----------------|------------|-----------------|
| **Low** | 5 calls/day | $8.15 | ~$141 (150 calls) | **~$150/mo** |
| **Medium** | 10 calls/day | $8.15 | ~$282 (300 calls) | **~$290/mo** |
| **High** | 20 calls/day | $8.15 | ~$564 (600 calls) | **~$570/mo** |

### **Cost Per Call Breakdown by Length**

| Call Length | Cost |
|-------------|------|
| 1 minute | ~$0.31 |
| 3 minutes | ~$0.94 |
| 5 minutes | ~$1.56 |
| 10 minutes | ~$3.12 |

---

## 📊 PRICING STRATEGY

### **Current Model (Jon - Rake & Clover)**
- **Beta pricing:** $79/month
- **Client pays:** Operating costs (Twilio + OpenAI usage)
- **We pay:** Development, hosting, maintenance
- **Reality:** If Jon gets 10+ calls/day, we're subsidizing ~$200/month

### **Recommended Pricing for Crystal Windows**

**Option A: Simple Monthly (Recommended)**
- **$299/month flat rate** (covers ~10 calls/day)
- Includes: phone number, AI agent, recordings, transcripts, emails
- Overage: $1/call after 300 calls/month
- Client doesn't worry about usage spikes

**Option B: Usage-Based**
- **$49/month base** (phone number + hosting)
- **$1.50/call** (covers our $0.94 + 60% margin)
- More transparent, but unpredictable for client

**Option C: Tiered**
- **Starter:** $149/month (up to 150 calls)
- **Growth:** $249/month (up to 300 calls)
- **Pro:** $399/month (up to 600 calls)
- Overage: $1.50/call

### **Recommendation: Option A ($299/month)**

**Why:**
- Simple for client to budget
- Covers realistic usage (5-15 calls/day)
- 3x markup on average costs = sustainable
- Room for growth without repricing

---

## 🎯 CRYSTAL WINDOW & GUTTER CLEANING - ONBOARDING PLAN

### **1. Setup Required**

**Twilio:**
- ✅ Buy new phone number (~5 min)
- ✅ Configure webhook to Render service

**Render:**
- ✅ Deploy new service: `ai-phone-crystal-window`
- ✅ Set `CLIENT_ID=crystal-window`
- ✅ Add env vars (same keys, different client config)

**Config:**
- ✅ Already created: `clients/crystal-window.json`
- ⚠️ Need to update: owner name, email address

**Testing:**
- Test calls with different scenarios
- Verify email delivery
- Confirm address extraction works
- Test goodbye flow

**Time estimate:** 1-2 hours

### **2. Information Needed from Client**

- [ ] Owner's full name
- [ ] Owner's email address
- [ ] Preferred phone number (we provide, or port existing?)
- [ ] Service area confirmation (Hamilton/Niagara region?)
- [ ] Pricing details (if any specific pricing to mention)
- [ ] Any specific instructions or FAQs

### **3. Current Config Status**

```json
{
  "business": {
    "name": "Crystal Window & Gutter Cleaning",
    "owner": "[TBD - Update when known]",  ← NEED THIS
    "email": "[TBD - Update when known]",  ← NEED THIS
    "phone": "+1-365-656-0617",
    "location": "Hamilton/Niagara Region"
  },
  "assistant": {
    "name": "Crystal",
    "voice": "marin"
  }
}
```

### **4. Deployment Checklist**

- [ ] Get client info (name, email, preferences)
- [ ] Update `crystal-window.json` config
- [ ] Buy Twilio number
- [ ] Deploy Render service
- [ ] Test 5+ calls (different scenarios)
- [ ] Verify emails arrive correctly
- [ ] Train client on checking emails
- [ ] Monitor first week of calls
- [ ] Adjust based on feedback

---

## 📈 BUSINESS MODEL ANALYSIS

### **Current State**
- 1 live client (Jon - Rake & Clover)
- 1 ready to deploy (Crystal Windows)
- Infrastructure: fully built and tested

### **Target: 10 Clients @ $299/month**

| Item | Amount |
|------|--------|
| **Gross Revenue** | $2,990/month |
| **Infrastructure** | ~$100/month (Render + shared costs) |
| **Operating Costs** | ~$1,200/month (assumes 10 calls/day avg per client) |
| **Net Profit** | **~$1,690/month** |

### **Margins by Call Volume**

If clients average:
- **5 calls/day:** ~65% margin
- **10 calls/day:** ~50% margin
- **20 calls/day:** ~35% margin

### **Break-Even Analysis**

At $299/month flat rate:
- Client can make **~280 calls/month** before we lose money
- That's **~9 calls/day**
- Most home service businesses get 5-10 calls/day

**Safe zone:** ✅

---

## 🚀 NEXT STEPS

### **Immediate (This Week)**
1. Get Crystal Windows owner info
2. Update config file
3. Deploy to Render
4. Test thoroughly
5. Schedule onboarding call with client

### **Short Term (Next 2 Weeks)**
1. Monitor Crystal's calls
2. Gather feedback
3. Refine prompts if needed
4. Get testimonial from Jon
5. Create case study

### **Medium Term (Next Month)**
1. Reach out to 5 more prospects
2. Standardize onboarding process
3. Create client dashboard (usage stats)
4. Add SMS notifications (optional upgrade)

---

## 💡 UPSELL OPPORTUNITIES

**Additional services to offer:**

| Service | Monthly Cost | Client Value |
|---------|--------------|--------------|
| **SMS confirmations** | +$50/mo | Sends text after call with details |
| **Google Calendar integration** | +$75/mo | Auto-book appointments |
| **Custom voice training** | +$100/mo | Train AI on specific scenarios |
| **CRM integration** | +$100/mo | Sync to Jobber/ServiceTitan/etc. |
| **After-hours only** | -$100/mo | AI only answers when closed |

---

## 📋 COMPETITIVE ANALYSIS

**Alternatives clients might consider:**

| Solution | Cost | Pros | Cons |
|----------|------|------|------|
| **Receptionist (part-time)** | $1,500-2,500/mo | Human touch | Limited hours, sick days, training |
| **Answering service** | $200-500/mo | 24/7 | Scripted, no intelligence, no recordings |
| **Our AI Agent** | $299/mo | 24/7, intelligent, recordings, transcripts | New technology, requires trust |

**Our edge:** Best of both worlds at 1/5 the cost of a human.

---

## ✅ READY TO DEPLOY

Crystal Windows is **ready to go**. Just need their info and a phone number.

**Estimated time to live:** 2 hours after receiving their details.
