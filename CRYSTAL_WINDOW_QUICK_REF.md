# Sarah AI Receptionist - Quick Reference Card
## For Replicating to Crystal Window

---

## Files to Copy

| File | Purpose | Changes Needed |
|------|---------|----------------|
| `webhook-server.js` | Webhook server | Update email addresses |
| `package.json` | Dependencies | None |
| `.env.example` | Env template | Update with Crystal emails |
| `sarah-agent-config.json` | Agent config | Update business info, prompt |
| `SARAH_PROMPT_HUMAN_LIKE.md` | System prompt | Rewrite for Crystal Window |

---

## Quick Conversion Checklist

### 1. Update Business Information

```json
{
  "business_name": "Crystal Window Cleaning",
  "owner": "[Owner Name]",
  "phone": "[Crystal Phone]",
  "email": "[Crystal Email]",
  "location": "[City, Province]",
  "service_area": ["City1", "City2", "City3"]
}
```

### 2. Update Services

Replace landscaping services:
- ❌ Lawn Mowing → ✅ Window Cleaning
- ❌ Snow Removal → ✅ Eavestrough Cleaning  
- ❌ Gutter Cleaning → ✅ Pressure Washing
- Add: Screen cleaning, chandelier cleaning, etc.

### 3. Update Pricing

```json
{
  "minimum": "$[X] plus HST",
  "interior_exterior": "Starting at $[X]",
  "eavestrough": "Starting at $[X]",
  "pressure_washing": "Starting at $[X]"
}
```

### 4. Update Email Configuration

```bash
NOTIFY_EMAIL=[crystal-owner]@[domain].com
BCC_EMAIL=[backup]@[domain].com
EMAIL_FROM="[Assistant Name] - Crystal Window" <[assistant]@[domain].com>
```

### 5. Rewrite System Prompt

Replace all references:
- "Rake and Clover" → "Crystal Window Cleaning"
- "Sarah" → [New Assistant Name]
- "Jonathan Hynes" → [Owner Name]
- "landscaping" → "window cleaning"
- Service area cities
- Pricing details

Keep the **same human-like behaviors**:
- Micro-acknowledgments
- Paper shuffling
- Thinking sounds
- Self-correction
- Personal touches

---

## Deploy Steps

### Step 1: Create New Render Service
1. Duplicate the webhook server repository
2. Create new Web Service on Render
3. Set environment variables
4. Deploy

### Step 2: Create New Retell Agent
1. Go to dashboard.retellai.com
2. Create new agent
3. Copy agent configuration from `sarah-agent-config.json`
4. Update all business-specific content
5. Set webhook URL to new Render service
6. Configure voice settings

### Step 3: Connect Phone Number
1. In Retell, add phone number
2. Point to new agent
3. Test incoming calls

---

## Function Schema (Crystal Window Version)

```json
{
  "name": "capture_lead",
  "parameters": {
    "properties": {
      "name": { "type": "string" },
      "phone": { "type": "string" },
      "address": { "type": "string" },
      "service": {
        "enum": [
          "interior_window_cleaning",
          "exterior_window_cleaning",
          "interior_and_exterior",
          "eavestrough_cleaning",
          "pressure_washing",
          "screen_cleaning",
          "chandelier_cleaning",
          "other"
        ]
      },
      "property_type": { "enum": ["residential", "commercial"] },
      "number_of_windows": { "type": "string" },
      "stories": { "type": "string" },
      "timing": { "type": "string" },
      "urgency": { "enum": ["immediate", "this_week", "this_month", "flexible"] },
      "details": { "type": "string" }
    },
    "required": ["name", "phone", "address", "service"]
  }
}
```

---

## Testing Checklist (Crystal Window)

- [ ] Greeting mentions Crystal Window
- [ ] Correct services discussed
- [ ] Correct pricing mentioned
- [ ] Correct service area
- [ ] Owner name is correct
- [ ] Emails go to correct addresses
- [ ] Lead capture works
- [ ] Post-call analysis accurate

---

## Time Estimate

| Task | Time |
|------|------|
| Update webhook server | 15 min |
| Update agent config | 30 min |
| Rewrite system prompt | 45 min |
| Deploy to Render | 10 min |
| Configure Retell | 20 min |
| Testing | 30 min |
| **Total** | **~2.5 hours** |

---

## Key Differences from Rake & Clover

| Aspect | Rake & Clover | Crystal Window |
|--------|---------------|----------------|
| Industry | Landscaping | Window Cleaning |
| Services | Mowing, snow, gutters | Windows, eavestroughs, pressure washing |
| Seasonality | All year | Spring/Fall peaks |
| Property Info | Yard size | # of windows, stories |
| Pricing | Per visit/season | Usually per window/job |

---

## Questions?

Refer to full `SETUP_GUIDE.md` for detailed instructions.
Contact: shawn.hyde@hydetech.ca