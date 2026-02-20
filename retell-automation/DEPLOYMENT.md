# 🚀 QUICK DEPLOYMENT GUIDE: Sarah for Rake & Clover

Get Sarah live in 25 minutes with this checklist.

---

## ⏱️ TIME ESTIMATE: 25 Minutes

| Step | Time | Status |
|------|------|--------|
| 1. Prerequisites | 5 min | ⬜ |
| 2. Configure Environment | 3 min | ⬜ |
| 3. Run Setup Script | 2 min | ⬜ |
| 4. Deploy Webhook Server | 10 min | ⬜ |
| 5. Test & Verify | 5 min | ⬜ |

---

## STEP 1: Prerequisites (5 min)

### Required Accounts
- [ ] **Retell AI** account with API key
  - Sign up: https://www.retellai.com/
  - Get API key from dashboard
- [ ] **Email SMTP** (Gmail recommended)
  - Enable 2FA
  - Generate App Password
- [ ] **Server/Hosting** for webhook
  - Option A: Your own server
  - Option B: Railway/Render/Heroku
  - Option C: Local with ngrok (testing only)

### Get Your Tools Ready
```bash
# Navigate to project
cd /Projects/ai-phone-core/retell-automation

# Install dependencies
npm install
```

---

## STEP 2: Configure Environment (3 min)

```bash
# Copy example config
cp .env.example .env

# Edit with your values
nano .env
```

### Required Variables

```env
# From Retell Dashboard
RETELL_API_KEY=your_actual_api_key_here

# Gmail App Password (NOT your regular password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password

# Where notifications go
NOTIFY_EMAIL=shawn.hyde@hydetech.ca
BCC_EMAIL=rake.clover.landscaping@gmail.com
```

### Optional Variables

```env
# Your webhook server URL (update after deployment)
WEBHOOK_URL=https://your-server.com/webhook

# Port for webhook server
WEBHOOK_PORT=3000
```

---

## STEP 3: Run Setup Script (2 min)

```bash
npm run setup
```

### Expected Output
```
🚀 Retell AI Automation for Sarah

📋 Step 1: Creating Retell LLM...
   ✅ LLM created successfully
   📌 LLM ID: llm_xxxxxxxx

📋 Step 2: Creating Agent...
   ✅ Agent created successfully
   📌 Agent ID: agent_xxxxxxxx

📋 Step 3: Purchasing Phone Number...
   ✅ Phone number purchased successfully
   📌 Phone Number: +1 289-XXX-XXXX
   📌 Phone Number ID: phone_xxxxxxxx

🎉 SARAH DEPLOYMENT SUMMARY
============================================================
✅ LLM Created:
   ID: llm_xxxxxxxx

✅ Agent Created:
   ID: agent_xxxxxxxx
   Name: Sarah-Rake-Clover
   Voice: 11labs-Bella

✅ Phone Number Assigned:
   Number: +1 289-XXX-XXXX

📋 NEXT STEPS:
------------------------------------------------------------
1. Configure Webhook URL
2. Start Webhook Server
3. Test the Setup
```

**📝 Save the Phone Number! This is Sarah's new number.**

---

## STEP 4: Deploy Webhook Server (10 min)

### Option A: Self-Hosted Server

```bash
# Start the webhook server
npm run webhook

# Expected output:
🎙️  Sarah Webhook Server Running
============================================================
📡 Listening on port: 3000
🔗 Webhook URL: http://your-domain.com:3000/webhook
```

Configure your reverse proxy (nginx/caddy) to forward to port 3000.

### Option B: Railway (Easiest)

1. Push code to GitHub
2. Connect Railway to repo
3. Set environment variables in Railway dashboard
4. Railway provides URL: `https://your-app.up.railway.app`
5. Update `WEBHOOK_URL` in Retell dashboard

### Option C: Local Testing with ngrok

```bash
# Install ngrok if needed
npm install -g ngrok

# In terminal 1: Start webhook server
npm run webhook

# In terminal 2: Create tunnel
ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Update WEBHOOK_URL in .env: https://abc123.ngrok.io/webhook
# Re-run: npm run setup (to update agent webhook URL)
```

⚠️ **ngrok URLs change on restart - only for testing!**

---

## STEP 5: Test & Verify (5 min)

### 5.1 Call Sarah
```bash
npm run test
```

Or manually dial the assigned phone number from your cell.

### 5.2 Expected Conversation Flow

**Sarah:** "Hi, thanks for calling Rake and Clover. This is Sarah. What can I help you with?"

**You:** "Hi, I'm interested in lawn mowing services."

**Sarah:** [Asks for your name]

**You:** "Test Customer"

**Sarah:** [Confirms spelling] "Got it, that's T-E-S-T C-U-S-T-O-M-E-R. Is that right?"

**You:** "Yes"

**Sarah:** [Asks for phone number, confirms it]

**Sarah:** [Asks for address]

**You:** "123 Test Street, Hamilton"

**Sarah:** [Asks about timing]

**You:** "Flexible"

**Sarah:** "Perfect! I've got all your information. Jonathan will be in touch within 24 hours to confirm everything. Thank you for calling Rake and Clover. Have a great day!"

### 5.3 Verify Webhook & Email

1. Check webhook server logs - you should see events
2. Check shawn.hyde@hydetech.ca for email notification
3. Verify email contains:
   - Customer name
   - Phone number
   - Service interest
   - Call recording link

---

## 🔧 TROUBLESHOOTING

### "RETELL_API_KEY not set"
```bash
cp .env.example .env
# Edit .env and add your key
```

### Phone number purchase fails
- 289 area code may be out of stock
- Edit setup.js, change area_code to "905" or "365"
- Or manually buy number in Retell dashboard

### Webhook not receiving events
```bash
# Test webhook is accessible
curl https://your-server.com/health

# Should return: {"status":"ok"}
```

### Email not sending
```bash
# Verify SMTP settings
# For Gmail: Use App Password, not regular password
# Enable "Less secure app access" (if not using App Password)
```

### Sarah sounds wrong
- Check Retell dashboard > Agent > Voice settings
- Voice should be "11labs-Bella"
- Test voice preview in dashboard

---

## 📋 POST-DEPLOYMENT CHECKLIST

- [ ] Test call completed successfully
- [ ] Email received with call summary
- [ ] Recording link works
- [ ] Business hours configured in Retell dashboard
- [ ] Fallback message set (if Sarah can't answer)
- [ ] Team knows new number
- [ ] Website updated with new number
- [ ] Google Business Profile updated

---

## 🔄 MAINTENANCE

### To Update Sarah's Prompt
1. Edit `setup.js` - modify `SARAH_PROMPT`
2. Delete `.retell-state.json`
3. Run `npm run setup` again
4. Or update directly in Retell dashboard

### To Change Phone Number
1. Retell dashboard > Phone Numbers
2. Release old number
3. Buy new number
4. Assign to Sarah-Rake-Clover agent

### To View Call History
```bash
# While webhook server is running
curl http://localhost:3000/calls
```

---

## 📞 SUPPORT

**Retell AI Documentation:**
https://docs.retellai.com/

**Webhook Events Reference:**
https://docs.retellai.com/api-references/webhooks

**Emergency Contact:**
If Sarah stops working, you can:
1. Check webhook server is running
2. Check Retell dashboard for agent status
3. Temporarily forward calls to Jonathan's cell

---

## ✅ YOU'RE DONE!

Sarah is now live and answering calls for Rake & Clover Landscaping.

**Next call that comes in will be handled by AI.** 🎉
