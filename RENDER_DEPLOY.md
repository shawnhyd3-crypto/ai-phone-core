# Deploy Webhook Server to Render

## Quick Deploy (5 minutes)

### 1. Create Render Account
- Go to: https://render.com
- Sign up with GitHub

### 2. Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect to `ai-phone-core` repo
3. Configure:
   - **Name:** `ai-phone-webhook` (or any name)
   - **Region:** Oregon (US West)
   - **Branch:** `master`
   - **Root Directory:** `src`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free

### 3. Add Environment Variables
Click **"Environment"** tab and add:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NOTIFY_EMAIL=shawn.hyde@hydetech.ca
BCC_EMAIL=rake.clover.landscaping@gmail.com
PORT=10000
```

### 4. Deploy
- Click **"Create Web Service"**
- Wait 2-3 minutes for deployment
- Copy the URL (e.g., `https://ai-phone-webhook.onrender.com`)

### 5. Update Retell Webhook
```bash
curl -X PATCH https://api.retellai.com/update-agent/agent_af0d2e3876b2cbfc55fa668178 \
  -H "Authorization: Bearer key_28c135abc9eee42b25321116025a" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://YOUR-RENDER-URL.onrender.com/webhook"
  }'
```

---

## Verify Deployment

1. **Health Check:**
   ```bash
   curl https://your-render-url.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

2. **Test Call:**
   - Call (289) 815-0431
   - Complete a conversation
   - Check email for call summary

---

## Auto-Deploy (Already Configured)

Every `git push` to `master` branch will auto-deploy to Render.

---

## Troubleshooting

**"Service won't start"**
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `PORT=10000` is set

**"Emails not sending"**
- Verify Gmail app password (not regular password)
- Check SMTP settings in env vars

**"Webhook not receiving events"**
- Verify webhook URL in Retell dashboard matches Render URL
- Check Render logs for incoming requests
