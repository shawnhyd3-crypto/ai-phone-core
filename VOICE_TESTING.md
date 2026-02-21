# Voice Testing & Comparison Guide
## Sarah AI Receptionist - Voice Selection

---

## Recommended Voice Configuration

### Primary Recommendation: 11labs-Bella

```json
{
  "voice_id": "11labs-Bella",
  "voice_model": "eleven_turbo_v2_5",
  "voice_speed": 0.95,
  "voice_temperature": 0.9,
  "enable_backchannel": true,
  "interruption_sensitivity": 0.85
}
```

**Why Bella:**
- ✅ Warm, professional tone
- ✅ Natural inflections and pauses
- ✅ Handles conversational interruptions well
- ✅ Good for receptionist/customer service roles
- ✅ Consistent quality across different phrasings

---

## Alternative Voice Options

### Option 2: 11labs-Rachel

```json
{
  "voice_id": "11labs-Rachel",
  "voice_model": "eleven_turbo_v2_5",
  "voice_speed": 0.95,
  "voice_temperature": 0.85
}
```

**Characteristics:**
- More formal/professional
- Very clear articulation
- Slightly less warm than Bella
- Good for traditional business contexts

**Best for:** Corporate/commercial services

---

### Option 3: minimax-Emma

```json
{
  "voice_id": "minimax-Emma",
  "voice_speed": 0.95,
  "voice_temperature": 0.9
}
```

**Characteristics:**
- Friendly, casual tone
- Sounds younger
- Good for residential services
- May lack some professional polish

**Best for:** Casual/residential-focused businesses

---

### Option 4: cartesia-Lily (Fallback)

```json
{
  "voice_id": "cartesia-Lily",
  "voice_speed": 0.95,
  "voice_temperature": 0.8
}
```

**Characteristics:**
- Reliable backup option
- Good clarity
- Less personality than 11labs options

**Best for:** Fallback when primary unavailable

---

## A/B Testing Protocol

### Phase 1: Baseline Testing

Make 3-5 calls with each voice option using identical scenarios:

1. **Greeting test**: How natural is "Hi, thanks for calling..."?
2. **Information collection**: How does it handle "Can I get your name?"
3. **Interruption**: Does it handle being interrupted gracefully?
4. **Closing**: How does it say goodbye?

### Phase 2: Human Evaluation

Ask 5-10 people: "Did this sound like a real person or a robot?"

Rate each voice 1-5:
- 1 = Obviously robotic
- 3 = Somewhat natural
- 5 = Completely human

### Phase 3: Conversion Testing

Run each voice for 1 week (or 50 calls each):
- Track lead capture rate
- Track completion rate
- Note any hangups during conversation

### Phase 4: Selection

Choose based on:
- 40% Human evaluation scores
- 40% Conversion metrics
- 20% Personal preference/consistency

---

## Speed & Temperature Tuning

### Voice Speed

| Speed | Effect | Recommendation |
|-------|--------|----------------|
| 0.85 | Slow, deliberate | Too slow for business |
| 0.95 | Natural pace | ✅ **Recommended** |
| 1.0 | Normal speed | Good for most |
| 1.1 | Fast, efficient | May sound rushed |

### Voice Temperature

| Temperature | Effect | Recommendation |
|-------------|--------|----------------|
| 0.6 | Very consistent | Too robotic |
| 0.8 | Natural variation | Good baseline |
| 0.9 | Expressive | ✅ **Recommended** |
| 1.0 | Very varied | May be inconsistent |

---

## Backchanneling Configuration

Backchanneling makes Sarah say "uh-huh", "yeah", "right" while the caller is speaking.

### Enable Backchannel
```json
{
  "enable_backchannel": true,
  "backchannel_frequency": 0.4
}
```

### Frequency Settings

| Frequency | Effect |
|-----------|--------|
| 0.2 | Rare (every 10-15 seconds) |
| 0.4 | Moderate (every 5-8 seconds) ✅ |
| 0.6 | Frequent (every 3-5 seconds) |
| 0.8 | Very frequent (can be annoying) |

---

## Interruption Sensitivity

How quickly Sarah responds when the caller speaks over her.

| Sensitivity | Effect |
|-------------|--------|
| 0.6 | Waits longer (may miss interruptions) |
| 0.8 | Balanced ✅ |
| 0.9 | Very sensitive (may interrupt herself) |

---

## Voice Testing Script

Use this script to test voices consistently:

### Test 1: Greeting
```
Call: "Hi"
Expected: Natural greeting without long pause
```

### Test 2: Name Collection
```
Call: "I need lawn service"
Expected: "Got it. [pause] And who's calling?"
```

### Test 3: Spelling Confirmation
```
Call: "My name is Sean"
Expected: "Is that S-H-A-W-N or S-E-A-N?"
```

### Test 4: Interruption
```
Call: Interrupt mid-sentence
Expected: Acknowledge and redirect
```

### Test 5: Closing
```
Expected: "Thanks for calling! Have a great day."
```

---

## Common Issues & Solutions

### Issue: Voice sounds robotic

**Solutions:**
1. Increase temperature to 0.9
2. Decrease speed to 0.95
3. Try different voice (11labs-Bella)
4. Check system prompt includes natural language

### Issue: Too many pauses

**Solutions:**
1. Increase speed to 1.0
2. Remove explicit [pause] markers from prompt
3. Reduce max_tokens to prevent overthinking

### Issue: Doesn't sound like a receptionist

**Solutions:**
1. Use Bella or Rachel (more professional)
2. Reduce temperature to 0.8
3. Add more professional language to prompt

### Issue: Backchanneling is annoying

**Solutions:**
1. Reduce backchannel_frequency to 0.2
2. Or disable entirely
3. Or use only for long caller statements

---

## Recommended Final Configuration

```json
{
  "voice": {
    "voice_id": "11labs-Bella",
    "voice_model": "eleven_turbo_v2_5",
    "voice_speed": 0.95,
    "voice_temperature": 0.9,
    "fallback_voice_ids": ["11labs-Rachel", "minimax-Emma"]
  },
  "behavior": {
    "responsiveness": 0.95,
    "interruption_sensitivity": 0.85,
    "enable_backchannel": true,
    "backchannel_frequency": 0.4
  },
  "response_engine": {
    "llm_config": {
      "model": "gpt-4o",
      "temperature": 0.8,
      "max_tokens": 250
    }
  }
}
```

---

## Notes

- Voice quality may vary based on time of day (API load)
- Test at different times for consistency
- Monitor for voice updates from Retell
- Bella has been most consistent in our testing