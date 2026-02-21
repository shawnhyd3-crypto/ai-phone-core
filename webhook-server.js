/**
 * Rake & Clover Landscaping - Retell AI Webhook Server
 * Production-ready for Render deployment
 * 
 * Environment variables required:
 * - SMTP_HOST (default: smtp.gmail.com)
 * - SMTP_PORT (default: 587)
 * - SMTP_USER (email address)
 * - SMTP_PASS (email password or app password)
 * - RETELL_WEBHOOK_SECRET (optional, for signature verification)
 * - NOTIFY_EMAIL (default: shawn.hyde@hydetech.ca)
 * - BCC_EMAIL (default: rake.clover.landscaping@gmail.com)
 * - PORT (default: 3000)
 */

const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

// Configuration
const PORT = process.env.PORT || 3000;
const RETELL_WEBHOOK_SECRET = process.env.RETELL_WEBHOOK_SECRET;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'shawn.hyde@hydetech.ca';
const BCC_EMAIL = process.env.BCC_EMAIL || 'rake.clover.landscaping@gmail.com';
const EMAIL_FROM = process.env.EMAIL_FROM || '"Sarah - Rake & Clover" <sarah@rakeandclover.ca>';

// Validate critical configuration
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('❌ CRITICAL: SMTP_USER and SMTP_PASS must be set in environment variables');
  console.error('   For Gmail, use an App Password: https://support.google.com/accounts/answer/185833');
}

// Create email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify transporter on startup
emailTransporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
  } else {
    console.log('✅ Email transporter ready');
  }
});

// In-memory stores (use Redis/database in production)
const activeCalls = new Map();
const completedCalls = new Map();

/**
 * Verify Retell webhook signature using HMAC-SHA256
 */
function verifyWebhookSignature(payload, signature) {
  if (!RETELL_WEBHOOK_SECRET) {
    console.warn('⚠️  RETELL_WEBHOOK_SECRET not set, skipping signature verification');
    return true;
  }
  if (!signature) {
    console.warn('⚠️  Webhook signature missing in request');
    return false;
  }
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', RETELL_WEBHOOK_SECRET)
      .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('❌ Signature verification error:', error.message);
    return false;
  }
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp) {
  if (!timestamp) return 'Unknown';
  return new Date(timestamp).toLocaleString('en-CA', {
    timeZone: 'America/Toronto',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format duration from milliseconds
 */
function formatDuration(ms) {
  if (!ms) return 'Unknown';
  const seconds = Math.round(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

/**
 * Format transcript for email
 */
function formatTranscript(transcript) {
  if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
    return '<p style="color: #999; font-style: italic;">Transcript not available</p>';
  }
  
  return transcript.map(entry => {
    const speaker = entry.role === 'agent' ? 'Sarah' : 'Caller';
    const bgColor = entry.role === 'agent' ? '#e8f5e9' : '#f5f5f5';
    const align = entry.role === 'agent' ? 'left' : 'right';
    const borderColor = entry.role === 'agent' ? '#4CAF50' : '#2196F3';
    
    return `
      <div style="margin: 10px 0; text-align: ${align};">
        <div style="display: inline-block; max-width: 80%; text-align: left; background: ${bgColor}; padding: 10px; border-radius: 8px; border-left: 3px solid ${borderColor};">
          <strong style="font-size: 12px; color: #666;">${speaker}</strong><br>
          ${entry.content}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Extract lead data from tool calls
 */
function extractLeadData(callData) {
  if (!callData.tool_calls || !Array.isArray(callData.tool_calls)) {
    return null;
  }
  
  const captureCall = callData.tool_calls.find(t => 
    t.name === 'capture_lead' || t.function?.name === 'capture_lead'
  );
  
  if (captureCall) {
    return captureCall.parameters || captureCall.arguments || null;
  }
  
  return null;
}

/**
 * Send lead notification email
 */
async function sendLeadEmail(callData, analysis) {
  const callId = callData.call_id;
  const leadData = extractLeadData(callData);
  
  // Determine email subject based on lead quality
  let subject;
  if (leadData) {
    const serviceDisplay = leadData.service ? leadData.service.replace(/_/g, ' ').toUpperCase() : 'Service Request';
    subject = `🌿 New Lead: ${leadData.name} - ${serviceDisplay}`;
  } else if (analysis?.completion_status === 'voicemail') {
    subject = `📞 Voicemail Received - ${callData.from_number || 'Unknown Number'}`;
  } else {
    subject = `📞 Call Completed - ${analysis?.lead_quality === 'not_lead' ? 'Not a Lead' : 'Lead Capture Incomplete'}`;
  }

  // Build email HTML
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; margin: 0; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #2e7d32, #4CAF50); color: white; padding: 25px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0; opacity: 0.9; }
    .content { padding: 25px; }
    .section { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 6px; }
    .section-title { font-size: 16px; font-weight: bold; color: #2e7d32; margin-bottom: 15px; border-bottom: 2px solid #4CAF50; padding-bottom: 8px; }
    .field { margin: 12px 0; }
    .label { font-weight: 600; color: #555; display: inline-block; min-width: 120px; }
    .value { color: #333; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-hot { background: #ffebee; color: #c62828; }
    .badge-warm { background: #fff3e0; color: #ef6c00; }
    .badge-cold { background: #e3f2fd; color: #1565c0; }
    .badge-lead { background: #e8f5e9; color: #2e7d32; }
    .badge-not-lead { background: #f5f5f5; color: #666; }
    .priority-high { background: #ffebee; border-left: 4px solid #c62828; padding: 12px; margin: 15px 0; }
    .recording-btn { display: inline-block; background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }
    .transcript { background: white; border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; max-height: 400px; overflow-y: auto; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #777; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; border-bottom: 1px solid #eee; }
    tr:last-child td { border-bottom: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 Rake & Clover Landscaping</h1>
      <p>New Call Summary from Sarah</p>
    </div>
    
    <div class="content">
      <!-- Lead Quality Badge -->
      <div style="text-align: center; margin-bottom: 20px;">
        ${analysis?.lead_quality ? `<span class="badge badge-${analysis.lead_quality === 'hot' ? 'hot' : analysis.lead_quality === 'warm' ? 'warm' : analysis.lead_quality === 'cold' ? 'cold' : 'not-lead'}">${analysis.lead_quality.toUpperCase()} LEAD</span>` : ''}
        ${analysis?.follow_up_priority === 'call_today' ? '<span class="badge badge-hot" style="margin-left: 10px;">⚡ CALL TODAY</span>' : ''}
      </div>

      <!-- Call Details -->
      <div class="section">
        <div class="section-title">📞 Call Details</div>
        <table>
          <tr><td class="label">Call ID:</td><td class="value">${callId}</td></tr>
          <tr><td class="label">From:</td><td class="value">${callData.from_number || 'Unknown'}</td></tr>
          <tr><td class="label">To:</td><td class="value">${callData.to_number || 'Unknown'}</td></tr>
          <tr><td class="label">Duration:</td><td class="value">${formatDuration(callData.duration_ms)}</td></tr>
          <tr><td class="label">Start Time:</td><td class="value">${formatTime(callData.start_timestamp)}</td></tr>
          <tr><td class="label">End Reason:</td><td class="value">${callData.disconnection_reason || 'Unknown'}</td></tr>
        </table>
      </div>

      ${leadData ? `
      <!-- Lead Information -->
      <div class="section" style="background: #e8f5e9;">
        <div class="section-title">📋 Lead Information</div>
        <table>
          <tr><td class="label">Name:</td><td class="value" style="font-size: 18px; font-weight: bold;">${leadData.name}</td></tr>
          <tr><td class="label">Phone:</td><td class="value" style="font-size: 16px;">${leadData.phone}</td></tr>
          <tr><td class="label">Address:</td><td class="value">${leadData.address}</td></tr>
          <tr><td class="label">Service:</td><td class="value"><strong>${leadData.service.replace(/_/g, ' ').toUpperCase()}</strong></td></tr>
          ${leadData.property_type ? `<tr><td class="label">Property:</td><td class="value">${leadData.property_type}</td></tr>` : ''}
          ${leadData.timing ? `<tr><td class="label">Timing:</td><td class="value">${leadData.timing}</td></tr>` : ''}
          ${leadData.urgency ? `<tr><td class="label">Urgency:</td><td class="value">${leadData.urgency.replace(/_/g, ' ')}</td></tr>` : ''}
          ${leadData.details ? `<tr><td class="label">Details:</td><td class="value">${leadData.details}</td></tr>` : ''}
        </table>
      </div>
      ` : `
      <div class="section" style="background: #fff3e0;">
        <div class="section-title">⚠️ Lead Information</div>
        <p style="color: #e65100;">Lead information was not fully captured during this call.</p>
        ${analysis?.completion_status === 'voicemail' ? '<p>This was a voicemail - no live conversation occurred.</p>' : ''}
      </div>
      `}

      ${analysis ? `
      <!-- Call Analysis -->
      <div class="section">
        <div class="section-title">📊 Call Analysis</div>
        <table>
          ${analysis.lead_quality ? `<tr><td class="label">Lead Quality:</td><td class="value">${analysis.lead_quality.toUpperCase()}</td></tr>` : ''}
          ${analysis.service_requested ? `<tr><td class="label">Service:</td><td class="value">${analysis.service_requested}</td></tr>` : ''}
          ${analysis.sentiment ? `<tr><td class="label">Sentiment:</td><td class="value">${analysis.sentiment}</td></tr>` : ''}
          ${analysis.price_sensitivity ? `<tr><td class="label">Price Sensitivity:</td><td class="value">${analysis.price_sensitivity}</td></tr>` : ''}
          ${analysis.urgency ? `<tr><td class="label">Urgency:</td><td class="value">${analysis.urgency.replace(/_/g, ' ')}</td></tr>` : ''}
          ${analysis.completion_status ? `<tr><td class="label">Completion:</td><td class="value">${analysis.completion_status.replace(/_/g, ' ')}</td></tr>` : ''}
          ${analysis.follow_up_priority ? `<tr><td class="label">Follow-up:</td><td class="value">${analysis.follow_up_priority.replace(/_/g, ' ')}</td></tr>` : ''}
        </table>
        ${analysis.notes ? `<div style="margin-top: 15px; padding: 12px; background: white; border-radius: 4px;"><strong>Notes:</strong> ${analysis.notes}</div>` : ''}
      </div>
      ` : ''}

      ${analysis?.follow_up_priority === 'call_today' || analysis?.lead_quality === 'hot' ? `
      <div class="priority-high">
        <strong>⚡ PRIORITY ACTION REQUIRED</strong><br>
        This lead requires immediate follow-up. Please call back as soon as possible.
      </div>
      ` : ''}

      ${callData.recording_url ? `
      <!-- Recording -->
      <div class="section">
        <div class="section-title">🎙️ Call Recording</div>
        <a href="${callData.recording_url}" class="recording-btn" target="_blank">▶️ Listen to Recording</a>
        <p style="font-size: 12px; color: #666; margin-top: 10px;">Recording will be available for 30 days</p>
      </div>
      ` : ''}

      <!-- Transcript -->
      <div class="section">
        <div class="section-title">📝 Conversation Transcript</div>
        <div class="transcript">
          ${formatTranscript(callData.transcript)}
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Rake & Clover Landscaping</strong> | Hamilton, Ontario</p>
      <p>Call ID: ${callId} | Agent: ${callData.agent_id || 'Unknown'}</p>
      <p style="margin-top: 10px; font-size: 11px;">This email was automatically generated by Sarah, your AI receptionist</p>
    </div>
  </div>
</body>
</html>
  `;

  // Plain text version
  const textBody = `
RAKE & CLOVER LANDSCAPING - CALL SUMMARY
=========================================

Call Details:
- Call ID: ${callId}
- From: ${callData.from_number || 'Unknown'}
- Duration: ${formatDuration(callData.duration_ms)}
- Time: ${formatTime(callData.start_timestamp)}

${leadData ? `LEAD INFORMATION:
Name: ${leadData.name}
Phone: ${leadData.phone}
Address: ${leadData.address}
Service: ${leadData.service.replace(/_/g, ' ').toUpperCase()}
${leadData.timing ? `Timing: ${leadData.timing}` : ''}
${leadData.details ? `Details: ${leadData.details}` : ''}
` : 'Lead information was not fully captured.'}

${analysis ? `ANALYSIS:
Lead Quality: ${analysis.lead_quality || 'N/A'}
Sentiment: ${analysis.sentiment || 'N/A'}
Urgency: ${analysis.urgency || 'N/A'}
Notes: ${analysis.notes || 'N/A'}
` : ''}

Recording: ${callData.recording_url || 'Not available'}

---
Rake & Clover Landscaping | Hamilton, Ontario
Automated notification from Sarah AI
  `;

  const mailOptions = {
    from: EMAIL_FROM,
    to: NOTIFY_EMAIL,
    bcc: BCC_EMAIL,
    subject: subject,
    text: textBody,
    html: htmlBody
  };

  try {
    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Email sent for call ${callId}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email for call ${callId}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main webhook endpoint - handles all Retell events
 * POST /webhooks/retell
 */
app.post('/webhooks/retell', async (req, res) => {
  const signature = req.headers['x-retell-signature'];
  
  // Verify signature
  if (!verifyWebhookSignature(req.body, signature)) {
    console.error('❌ Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const payload = req.body;
  const eventType = payload.event;
  const callData = payload.call;
  
  console.log('\n📥 Webhook received:', {
    event: eventType,
    callId: callData?.call_id,
    timestamp: new Date().toISOString()
  });

  try {
    switch (eventType) {
      case 'call_started':
        console.log(`📞 Call started: ${callData.call_id}`);
        activeCalls.set(callData.call_id, {
          startTime: Date.now(),
          fromNumber: callData.from_number,
          toNumber: callData.to_number,
          agentId: callData.agent_id
        });
        break;

      case 'transcript_updated':
        // Store transcript for real-time monitoring
        const callRecord = activeCalls.get(callData.call_id);
        if (callRecord) {
          callRecord.transcript = payload.transcript_with_tool_calls;
          callRecord.lastUpdate = Date.now();
        }
        console.log(`📝 Transcript updated: ${callData.call_id} (${payload.transcript?.length || 0} entries)`);
        break;

      case 'call_ended':
        console.log(`📴 Call ended: ${callData.call_id}`);
        const activeCall = activeCalls.get(callData.call_id);
        completedCalls.set(callData.call_id, {
          ...activeCall,
          endTime: Date.now(),
          duration: callData.duration_ms,
          recordingUrl: callData.recording_url,
          disconnectionReason: callData.disconnection_reason
        });
        activeCalls.delete(callData.call_id);
        break;

      case 'call_analyzed':
        console.log(`📊 Call analyzed: ${callData.call_id}`);
        const analysis = callData.call_analysis;
        
        // Update stored call data
        const completedCall = completedCalls.get(callData.call_id);
        if (completedCall) {
          completedCall.analysis = analysis;
          completedCall.toolCalls = callData.tool_calls;
        }
        
        // Send email notification
        await sendLeadEmail(callData, analysis);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${eventType}`);
    }

    res.status(200).json({ received: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'sarah-webhook-server',
    version: '2.0.0',
    activeCalls: activeCalls.size,
    completedCalls: completedCalls.size,
    uptime: process.uptime()
  });
});

/**
 * API: Get specific call data
 * GET /api/calls/:callId
 */
app.get('/api/calls/:callId', (req, res) => {
  const callId = req.params.callId;
  const callData = completedCalls.get(callId) || activeCalls.get(callId);
  
  if (!callData) {
    return res.status(404).json({ error: 'Call not found' });
  }
  
  res.json({ callId, ...callData });
});

/**
 * API: List recent calls
 * GET /api/calls?limit=50
 */
app.get('/api/calls', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const calls = Array.from(completedCalls.entries())
    .sort((a, b) => (b[1].endTime || 0) - (a[1].endTime || 0))
    .slice(0, limit)
    .map(([id, data]) => ({ callId: id, ...data }));
  
  res.json({ 
    calls, 
    total: completedCalls.size,
    active: activeCalls.size,
    limit
  });
});

/**
 * Root endpoint - basic info
 * GET /
 */
app.get('/', (req, res) => {
  res.json({
    service: 'Sarah Webhook Server',
    version: '2.0.0',
    company: 'Rake & Clover Landscaping',
    endpoints: {
      webhook: 'POST /webhooks/retell',
      health: 'GET /health',
      calls: 'GET /api/calls',
      call: 'GET /api/calls/:callId'
    },
    documentation: 'See README.md for setup instructions'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🌿 Rake & Clover Landscaping - Sarah Webhook Server');
  console.log('='.repeat(60));
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🔗 Webhook URL: https://your-render-url.onrender.com/webhooks/retell`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log('='.repeat(60));
  console.log('\n📋 Retell Dashboard Configuration:');
  console.log('   1. Go to https://dashboard.retellai.com');
  console.log('   2. Navigate to your agent settings');
  console.log('   3. Under "Webhooks", add the URL above');
  console.log('   4. Select events: call_started, call_ended, call_analyzed, transcript_updated');
  console.log('   5. Copy the Webhook Secret and set it as RETELL_WEBHOOK_SECRET');
  console.log('='.repeat(60));
  console.log('\n⚡ Ready to receive webhooks from Retell AI\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received, shutting down...');
  process.exit(0);
});

module.exports = app;
