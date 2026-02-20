# Migration Guide: Moving to ai-phone-core

This guide walks you through migrating your existing client repos to the new shared architecture.

## Current State (Before Migration)

```
ai-phone-LIVE-rake-clover/     ← Separate repo
ai-phone-dev-rake-clover/      ← Separate repo
ai-phone-LIVE-crystal-window/  ← Separate repo
ai-phone-dev-crystal-window/   ← Separate repo
ai-phone-demo/                 ← Separate repo
```

Each has its own:
- `server.js` (duplicated code)
- `package.json`
- Environment variables
- Render service

## New State (After Migration)

```
ai-phone-core/                 ← ONE repo
├── clients/
│   ├── rake-clover.json       ← Client-specific config only
│   ├── crystal-window.json
│   └── hyde-tech-demo.json
└── src/
    └── server.js              ← Shared code
```

Same Render services, but all point to `ai-phone-core` repo with different `CLIENT_ID` env vars.

---

## Migration Steps

### Phase 1: Deploy ai-phone-core to GitHub

```bash
cd /home/shawnhyd3/.openclaw/workspace/Projects/ai-phone-core

# Initialize git repo
git init
git add .
git commit -m "Initial commit: shared AI phone core"

# Create GitHub repo (via gh CLI)
gh repo create ai-phone-core --public --source=. --remote=origin --push
```

### Phase 2: Update Render Services (One at a Time)

For each Render service:

#### Example: Rake & Clover LIVE

1. **Go to Render Dashboard** → `ai-phone-live-rake-clover`
2. **Settings → Build & Deploy:**
   - Change **Repository** to `shawnhyd3-crypto/ai-phone-core`
   - Keep **Branch** as `main` (or `master`)
   - Build Command: `npm install`
   - Start Command: `npm start`
3. **Environment Variables:**
   - Add: `CLIENT_ID=rake-clover`
   - Keep existing: `OPENAI_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `SENDGRID_API_KEY`
4. **Save & Deploy**
5. **Test:** Call the phone number and verify it works

Repeat for:
- `ai-phone-dev-rake-clover` → `CLIENT_ID=rake-clover`
- `ai-phone-live-crystal-window` → `CLIENT_ID=crystal-window`
- `ai-phone-dev-crystal-window` → `CLIENT_ID=crystal-window`
- `ai-phone-demo` → `CLIENT_ID=hyde-tech-demo`

### Phase 3: Test Each Service

After updating each Render service:

```bash
# Health check
curl https://ai-phone-live-rake-clover.onrender.com/health

# Expected response:
{
  "status": "ok",
  "client": "rake-clover",
  "business": "Rake and Clover Landscaping",
  "timestamp": "2026-02-20T..."
}
```

**Test the phone:**
- Call the number
- Verify greeting is correct
- Check that assistant responds properly

### Phase 4: Clean Up Old Repos (Optional)

Once all services are migrated and tested:

1. **Archive old repos** (don't delete yet):
   - `ai-phone-LIVE-rake-clover` → Archive on GitHub
   - `ai-phone-dev-rake-clover` → Archive
   - etc.

2. **Keep them around for 30 days** in case you need to roll back

---

## Rollback Plan

If something breaks:

1. **Render:** Change repo back to old repo
2. **Deploy:** Redeploy the old version
3. **Fix:** Debug the issue in `ai-phone-core`
4. **Retry:** Migrate again when fixed

---

## Benefits After Migration

✅ **One codebase** → Fix bugs once, all clients benefit  
✅ **Easy client addition** → New client = new JSON file  
✅ **Consistent features** → All clients get new features automatically  
✅ **Easier testing** → Test on dev, deploy to live with confidence  
✅ **Less maintenance** → No more copy-pasting code across repos

---

## Next Steps

1. **Review this plan**
2. **Create GitHub repo** for `ai-phone-core`
3. **Migrate one dev service first** (lowest risk)
4. **Test thoroughly**
5. **Migrate remaining services**
6. **Celebrate** 🎉

Need help with any step? Just ask.
