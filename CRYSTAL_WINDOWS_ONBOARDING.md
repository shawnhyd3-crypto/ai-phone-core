# Crystal Window & Gutter Cleaning - Onboarding Checklist

**Client:** Crystal Window & Gutter Cleaning  
**Location:** Hamilton/Niagara Region  
**Status:** Ready to Deploy

---

## ✅ PRE-DEPLOYMENT

### Information Collection
- [ ] Owner's full name
- [ ] Owner's email address  
- [ ] Confirm service area (Hamilton, Niagara Falls, St. Catharines, Welland)
- [ ] Any specific pricing to mention?
- [ ] Any common questions/FAQs to add to prompt?
- [ ] Preferred assistant voice (default: marin)
- [ ] Business hours confirmation

### Technical Setup
- [ ] Update `clients/crystal-window.json` with owner info
- [ ] Test config locally: `node test-config.js crystal-window`
- [ ] Commit config changes to GitHub

---

## 📞 TWILIO SETUP

- [ ] Buy new phone number via Twilio console
  - Area code: 365, 289, or 905 (Ontario)
  - Capabilities: Voice, SMS
  - **Number:** ________________
  
- [ ] Configure webhook
  - URL: `https://ai-phone-crystal-window.onrender.com/incoming-call`
  - Method: POST
  - Fallback: (leave empty for now)

---

## 🚀 RENDER DEPLOYMENT

- [ ] Create new Web Service
  - Name: `ai-phone-crystal-window`
  - Repository: `shawnhyd3-crypto/ai-phone-core`
  - Branch: `master`
  - Build command: `npm install`
  - Start command: `npm start`

- [ ] Environment Variables
  ```
  CLIENT_ID=crystal-window
  OPENAI_API_KEY=[same as others]
  TWILIO_ACCOUNT_SID=[same as others]
  TWILIO_AUTH_TOKEN=[same as others]
  SENDGRID_API_KEY=[same as others]
  FROM_EMAIL=calls@hydetech.ca
  ```

- [ ] Deploy and verify
  - Health check: `https://ai-phone-crystal-window.onrender.com/health`
  - Should return: `"client": "crystal-window"`

---

## 🧪 TESTING (Critical!)

### Test Call Scenarios

**Test 1: Basic quote request**
- [ ] Call the number
- [ ] Hear Crystal's greeting (random variation)
- [ ] Request window cleaning quote
- [ ] Provide name (test spelling confirmation if ambiguous)
- [ ] Provide phone number (verify she repeats it back)
- [ ] Provide address (verify clarification if needed)
- [ ] End call naturally
- [ ] **Verify:** Email received with correct info, map link, recording

**Test 2: Gutter cleaning inquiry**
- [ ] Call about gutter cleaning
- [ ] Ask about pricing
- [ ] Ask about service area
- [ ] Provide partial info (test how she handles incomplete info)
- [ ] **Verify:** Email summary reflects the conversation

**Test 3: Goodbye flow**
- [ ] Call and have brief conversation
- [ ] Say "okay thanks" or "that's all"
- [ ] **Verify:** Crystal says brief goodbye (under 6 words)
- [ ] **Verify:** Call hangs up properly (no dead air)

**Test 4: Address extraction**
- [ ] Call and provide a specific address (e.g., "123 Main Street, Hamilton")
- [ ] **Verify:** Email includes address with Google Maps link

**Test 5: Name extraction**
- [ ] Use a common name with spelling variations (e.g., "Jon" or "Shawn")
- [ ] **Verify:** Crystal asks "Is that E-A or A-W?" (or similar)
- [ ] **Verify:** Email shows correct caller name (NOT "Crystal")

---

## 📧 EMAIL VERIFICATION

- [ ] Confirm emails arrive at owner's inbox
- [ ] Check spam folder
- [ ] Verify all attachments (MP3 recording)
- [ ] Verify address shows with map link
- [ ] Verify caller name is correct (not "Crystal")
- [ ] Verify transcript formatting is readable
- [ ] Verify summary is accurate

---

## 👤 CLIENT ONBOARDING

### Onboarding Call/Email
- [ ] Explain how the system works
- [ ] Show sample email (from test calls)
- [ ] Explain how to check voicemails
- [ ] Set expectations for callback times
- [ ] Provide emergency contact (your number)

### Documentation to Send
- [ ] Phone number: _____________
- [ ] How to check call logs (email)
- [ ] How to update greeting/info (contact you)
- [ ] Pricing breakdown (monthly + usage)
- [ ] Support contact (you)

### Training Points
- **Emails arrive immediately after call**
- **Check spam folder first few days**
- **Recording is attached as MP3**
- **Transcript shows exact conversation**
- **Summary is AI-generated (check for accuracy)**
- **Address link opens Google Maps**

---

## 📊 MONITORING (First Week)

- [ ] Day 1: Check first 3 calls closely
- [ ] Day 2: Review email delivery (any issues?)
- [ ] Day 3: Check for caller feedback
- [ ] Day 7: Follow-up call with client
  - Any missed information?
  - Any confusing conversations?
  - Voice/tone feedback?
  - Greeting variations working?

---

## 🐛 TROUBLESHOOTING

### Common Issues

**No calls coming through:**
- Check Twilio webhook URL is correct
- Check Render service is running (not sleeping)
- Check phone number is active

**Emails not arriving:**
- Check spam folder
- Verify SendGrid API key is valid
- Check email address in config

**AI sounds off:**
- Review transcript
- Check if greeting is appropriate
- Verify turn detection isn't too fast/slow

**Call doesn't hang up:**
- Check logs for hangup call
- Verify Twilio API credentials
- May need to adjust timeout

---

## 💰 PRICING DISCUSSION

### Proposed Pricing
- **Monthly:** $299/month flat rate
- **Includes:** Up to 300 calls/month (~10/day)
- **Overage:** $1.50/call after 300
- **Setup fee:** $0 (waived for beta)

### Payment Terms
- Month-to-month (no contract)
- Cancel anytime with 30 days notice
- First month: Prorated from activation date

---

## ✅ LAUNCH CHECKLIST

- [ ] All tests passed
- [ ] Client onboarded and trained
- [ ] Emergency contact shared
- [ ] Monitoring in place
- [ ] Invoice sent (if applicable)
- [ ] Add to client list in MEMORY.md

---

## 📞 SUPPORT

**For client issues:**
- Email: shawn.hyde@hydetech.ca
- Phone: [your number]
- Response time: Same day

**For system issues:**
- Check Render logs
- Check Twilio console
- Review call recordings
- Update config if needed

---

**Status:** ⏳ Waiting for client information

**Next step:** Contact Crystal Windows owner for details
