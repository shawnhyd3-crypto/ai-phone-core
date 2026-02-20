# Retell AI Migration Checklist

Use this checklist to track your migration from OpenAI Realtime API to Retell AI.

---

## Phase 1: Research & Setup (Days 1-2)

### Account Setup
- [ ] Create Retell AI account at https://retellai.com
- [ ] Verify email and complete onboarding
- [ ] Copy API key from dashboard
- [ ] Review Retell documentation

### Development Environment
- [ ] Set up webhook server directory
- [ ] Create `.env` file with all credentials
- [ ] Install Node.js dependencies
- [ ] Test webhook server locally
- [ ] Deploy webhook server to production

### Retell Agent Configuration
- [ ] Create new agent in Retell dashboard
- [ ] Configure voice settings (test multiple options)
- [ ] Set up system prompt
- [ ] Add capture_lead function
- [ ] Configure post-call analysis
- [ ] Test agent in Retell playground

---

## Phase 2: Integration (Days 3-4)

### Phone Number Setup
- [ ] Decide: Buy through Retell or import Twilio number
- [ ] If buying: Purchase number in Retell dashboard
- [ ] If importing: Configure Twilio credentials in Retell
- [ ] Verify number is active

### Webhook Configuration
- [ ] Set webhook URL in Retell dashboard
- [ ] Select webhook events (call_started, call_ended, call_analyzed)
- [ ] Test webhook with sample payload
- [ ] Verify webhook signature verification is working

### Email Notifications
- [ ] Configure SMTP credentials
- [ ] Test email sending
- [ ] Verify email template formatting
- [ ] Check both TO and BCC recipients receive emails

### Agent Binding
- [ ] Bind agent to inbound number
- [ ] Bind agent to outbound number (for callbacks)
- [ ] Save configuration

---

## Phase 3: Testing (Days 5-6)

### Basic Functionality
- [ ] Call number and verify Sarah answers
- [ ] Confirm greeting message is correct
- [ ] Test voice quality and speed
- [ ] Verify conversation feels natural

### Lead Capture Flow
- [ ] Test name collection (normal name)
- [ ] Test name collection (ambiguous name like Shawn/Sean)
- [ ] Verify spelling confirmation works
- [ ] Test phone number collection
- [ ] Verify number repeat-back works
- [ ] Test address collection
- [ ] Verify address confirmation works
- [ ] Test service identification
- [ ] Test timing preferences collection
- [ ] Test additional details collection

### Edge Cases
- [ ] Test voicemail detection
- [ ] Test silence handling (no response)
- [ ] Test background noise handling
- [ ] Test caller interrupting Sarah
- [ ] Test off-topic redirection
- [ ] Test early hangup

### Function Calling
- [ ] Verify capture_lead function is called
- [ ] Check all parameters are populated
- [ ] Verify function is called at appropriate time
- [ ] Test incomplete data handling

---

## Phase 4: Email Verification (Day 6)

### Email Content
- [ ] Verify email is received after each test call
- [ ] Check subject line is correct
- [ ] Verify caller's phone number appears
- [ ] Check call duration is shown
- [ ] Verify transcript is included
- [ ] Check recording link works
- [ ] Verify lead information is displayed
- [ ] Check call analysis section

### Email Recipients
- [ ] Verify shawn.hyde@hydetech.ca receives email
- [ ] Verify rake.clover.landscaping@gmail.com receives BCC
- [ ] Check spam/junk folders
- [ ] Verify email formatting (HTML and text versions)

---

## Phase 5: Parallel Running (Day 7)

### Soft Launch
- [ ] Configure 50% of calls to go to Retell
- [ ] Keep 50% on existing OpenAI system as fallback
- [ ] Monitor both systems
- [ ] Compare call quality

### Monitoring
- [ ] Check Retell dashboard for call logs
- [ ] Review call recordings daily
- [ ] Monitor email notifications
- [ ] Track any errors or issues
- [ ] Compare costs between systems

---

## Phase 6: Full Migration (Day 8)

### Cutover
- [ ] Update Twilio to forward 100% to Retell
- [ ] Or: Port number to Retell fully
- [ ] Verify all calls go to new system
- [ ] Monitor closely for first 24 hours

### Documentation
- [ ] Update internal documentation
- [ ] Train Jonathan on new system
- [ ] Document any new processes
- [ ] Create quick reference guide

---

## Phase 7: Optimization (Weeks 2-4)

### Fine-Tuning
- [ ] Review 10+ call recordings
- [ ] Identify areas for improvement
- [ ] Adjust system prompt based on patterns
- [ ] Add fine-tuning examples if needed
- [ ] Optimize voice settings
- [ ] Adjust interruption sensitivity

### Cost Optimization
- [ ] Review monthly usage
- [ ] Consider switching to gpt-4o-mini for cost savings
- [ ] Set appropriate max call duration
- [ ] Review voicemail detection effectiveness

### Feature Enhancements
- [ ] Consider adding appointment booking function
- [ ] Evaluate SMS follow-up capability
- [ ] Review post-call analysis data
- [ ] Consider CRM integration

---

## Rollback Preparation

### Before Migration
- [ ] Document current OpenAI setup
- [ ] Keep OpenAI credentials secure
- [ ] Test OpenAI system is still functional
- [ ] Prepare rollback script/procedure

### Rollback Triggers
Define conditions for immediate rollback:
- [ ] Call success rate drops below 80%
- [ ] Critical functionality broken
- [ ] Cost exceeds 2x OpenAI costs
- [ ] Multiple customer complaints

### Rollback Procedure
1. Update Twilio webhook to point back to OpenAI
2. Verify OpenAI system is operational
3. Test call to confirm rollback
4. Notify stakeholders
5. Document issues for retry

---

## Post-Migration Success Metrics

### Week 1 Targets
- [ ] 95%+ call answer rate
- [ ] 90%+ successful lead capture
- [ ] Average call duration 2-4 minutes
- [ ] Zero critical errors
- [ ] Email delivery 100%

### Month 1 Targets
- [ ] 98%+ call answer rate
- [ ] 95%+ successful lead capture
- [ ] Positive customer feedback
- [ ] Cost per call lower than OpenAI
- [ ] Zero manual interventions needed

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Technical Lead | | | |
| Business Owner (Jonathan) | | | |
| QA/Testing | | | |

---

## Notes

Use this space for notes during migration:

```
Day 1:
-

Day 2:
-

Day 3:
-

Issues encountered:
-

Resolutions:
-

Lessons learned:
-
```
