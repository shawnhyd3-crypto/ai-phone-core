#!/usr/bin/env node
/**
 * Retell Webhook Server for Sarah
 * Receives call events and sends email notifications
 * 
 * Usage: npm run webhook
 */

const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3000;

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'sarah@rakeandclover.ca';
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'shawn.hyde@hydetech.ca';
const BCC_EMAIL = process.env.BCC_EMAIL || 'rake.clover.landscaping@gmail.com';

// Validate email config
if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn('\n⚠️  Email credentials not configured.');
  console.warn('   Set EMAIL_USER and EMAIL_PASS in .env file');
  console.warn('   Webhook events will be logged but no emails sent.\n');
}

// Create email transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT == 465,
  auth: EMAIL_USER && EMAIL_PASS ? {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  } : undefined
});

// Verify transporter
if (EMAIL_USER && EMAIL_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter error:', error.message);
    } else {
      console.log('✅ Email transporter ready');
    }
  });
}

// Middleware
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

// Store for call data (in production, use a database)
const callStore = new Map();

// Utility: Format timestamp
function formatTime(isoString) {
  return new Date(isoString).toLocaleString('en-CA', {
    timeZone: 'America/Toronto',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Utility: Send email notification
async function sendEmail(subject, htmlContent, textContent) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('   [Email skipped - credentials not configured]');
    return { success: false, reason: 'credentials_not_configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Sarah (Rake & Clover)" <${EMAIL_FROM}>`,
      to: NOTIFY_EMAIL,
      bcc: BCC_EMAIL,
      subject: subject,
      text: textContent,
      html: htmlContent
    });
    
    console.log(`   ✅ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`   ❌ Email failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Webhook: Call Started
app.post('/webhook/call-started', async (req, res) => {
  const event = req.body;
  const callId = event.call_id;
  
  console.log(`\n📞 Call Started: ${callId}`);
  console.log(`   From: ${event.from_number || 'Unknown'}`);
  console.log(`   To: ${event.to_number || 'Unknown'}`);
  console.log(`   Time: ${formatTime(event.timestamp || new Date())}`);
  
  // Store initial call data
  callStore.set(callId, {
    id: callId,
    from: event.from_number,
    to: event.to_number,
    startTime: event.timestamp,
    status: 'started'
  });
  
  // Send notification email
  const subject = `📞 New Call Started - ${event.from_number || 'Unknown'}`;
  const textContent = `A new call has started.

Call ID: ${callId}
From: ${event.from_number || 'Unknown'}
To: ${event.to_number || 'Unknown'}
Time: ${formatTime(event.timestamp || new Date())}

You'll receive another email when the call ends with full details.`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .field { margin: 10px 0; }
    .label { font-weight: bold; color: #555; }
    .footer { margin-top: 20px; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📞 New Call Started</h2>
    </div>
    <div class="content">
      <div class="field"><span class="label">Call ID:</span> ${callId}</div>
      <div class="field"><span class="label">From:</span> ${event.from_number || 'Unknown'}</div>
      <div class="field"><span class="label">To:</span> ${event.to_number || 'Unknown'}</div>
      <div class="field"><span class="label">Time:</span> ${formatTime(event.timestamp || new Date())}</div>
      <p style="margin-top: 20px; padding: 10px; background: #fff3cd; border-radius: 4px;">
        You'll receive another email when the call ends with full details and transcript.
      </p>
    </div>
    <div class="footer">
      Rake & Clover Landscaping | Hamilton, Ontario<br>
      Automated notification from Sarah AI
    </div>
  </div>
</body>
</html>`;

  await sendEmail(subject, htmlContent, textContent);
  
  res.status(200).json({ received: true });
});

// Webhook: Call Ended
app.post('/webhook/call-ended', async (req, res) => {
  const event = req.body;
  const callId = event.call_id;
  
  console.log(`\n🔚 Call Ended: ${callId}`);
  console.log(`   Duration: ${event.duration_seconds || 'Unknown'} seconds`);
  console.log(`   End Reason: ${event.end_reason || 'Unknown'}`);
  
  // Update call data
  const callData = callStore.get(callId) || {};
  callData.endTime = event.timestamp;
  callData.duration = event.duration_seconds;
  callData.endReason = event.end_reason;
  callData.status = 'ended';
  callStore.set(callId, callData);
  
  res.status(200).json({ received: true });
});

// Webhook: Call Analyzed (Full summary)
app.post('/webhook/call-analyzed', async (req, res) => {
  const event = req.body;
  const callId = event.call_id;
  const analysis = event.analysis || {};
  
  console.log(`\n📊 Call Analyzed: ${callId}`);
  console.log(`   Summary: ${analysis.call_summary || 'No summary'}`);
  
  // Update call data
  const callData = callStore.get(callId) || {};
  callData.analysis = analysis;
  callData.recordingUrl = event.recording_url;
  callData.status = 'analyzed';
  callStore.set(callId, callData);
  
  // Extract customer info if available
  const customerName = analysis.customer_name || 'Unknown';
  const customerPhone = analysis.customer_phone || callData.from || 'Unknown';
  const serviceInterest = analysis.service_interest || 'Not specified';
  const callSummary = analysis.call_summary || 'No summary available';
  
  // Send detailed email
  const subject = `📋 Call Completed - ${customerName} (${customerPhone})`;
  
  const textContent = `CALL SUMMARY
============

Customer: ${customerName}
Phone: ${customerPhone}
Service Interest: ${serviceInterest}
Call Duration: ${callData.duration || 'Unknown'} seconds
Time: ${formatTime(callData.startTime || new Date())}

SUMMARY:
${callSummary}

RECORDING:
${event.recording_url || 'Not available'}

---
Rake & Clover Landscaping | Hamilton, Ontario`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .section { margin: 20px 0; padding: 15px; background: white; border-radius: 4px; }
    .field { margin: 10px 0; }
    .label { font-weight: bold; color: #555; display: inline-block; width: 150px; }
    .summary { background: #e8f5e9; padding: 15px; border-radius: 4px; margin: 10px 0; }
    .recording-link { 
      display: inline-block; 
      background: #2196F3; 
      color: white; 
      padding: 10px 20px; 
      text-decoration: none; 
      border-radius: 4px;
      margin-top: 10px;
    }
    .footer { margin-top: 20px; font-size: 12px; color: #777; }
    .urgent { background: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📋 Call Completed - Action Required</h2>
    </div>
    <div class="content">
      <div class="section">
        <h3>Customer Information</h3>
        <div class="field"><span class="label">Name:</span> ${customerName}</div>
        <div class="field"><span class="label">Phone:</span> ${customerPhone}</div>
        <div class="field"><span class="label">Service Interest:</span> ${serviceInterest}</div>
        <div class="field"><span class="label">Call Duration:</span> ${callData.duration || 'Unknown'} seconds</div>
        <div class="field"><span class="label">Call Time:</span> ${formatTime(callData.startTime || new Date())}</div>
      </div>
      
      <div class="section">
        <h3>Call Summary</h3>
        <div class="summary">${callSummary.replace(/\n/g, '<br>')}</div>
      </div>
      
      ${event.recording_url ? `
      <div class="section">
        <h3>Recording</h3>
        <a href="${event.recording_url}" class="recording-link" target="_blank">🎧 Listen to Recording</a>
      </div>
      ` : ''}
      
      <div class="section urgent">
        <strong>⚡ Next Step:</strong> Contact this lead within 24 hours to maximize conversion.
      </div>
    </div>
    <div class="footer">
      Rake & Clover Landscaping | Hamilton, Ontario<br>
      289-XXX-XXXX | rakeandclover.ca<br>
      Automated notification from Sarah AI
    </div>
  </div>
</body>
</html>`;

  await sendEmail(subject, htmlContent, textContent);
  
  res.status(200).json({ received: true });
});

// Webhook: Transcript Updated
app.post('/webhook/transcript-updated', async (req, res) => {
  const event = req.body;
  const callId = event.call_id;
  const transcript = event.transcript || [];
  
  console.log(`\n📝 Transcript Updated: ${callId}`);
  console.log(`   Entries: ${transcript.length}`);
  
  // Update call data
  const callData = callStore.get(callId) || {};
  callData.transcript = transcript;
  callStore.set(callId, callData);
  
  res.status(200).json({ received: true });
});

// Main webhook endpoint (catches all events)
app.post('/webhook', async (req, res) => {
  const event = req.body;
  const eventType = event.event;
  
  console.log(`\n📨 Webhook received: ${eventType}`);
  console.log(`   Call ID: ${event.call_id || 'N/A'}`);
  
  // Route to specific handler based on event type
  switch (eventType) {
    case 'call_started':
      return app._router.handle(req, res, () => {});
    case 'call_ended':
      return app._router.handle(req, res, () => {});
    case 'call_analyzed':
      return app._router.handle(req, res, () => {});
    case 'transcript_updated':
      return app._router.handle(req, res, () => {});
    default:
      console.log(`   ⚠️  Unknown event type: ${eventType}`);
      res.status(200).json({ received: true, note: 'unknown_event_type' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'sarah-webhook-server',
    version: '1.0.0'
  });
});

// List recent calls endpoint
app.get('/calls', (req, res) => {
  const calls = Array.from(callStore.values()).reverse().slice(0, 50);
  res.json({ calls, total: callStore.size });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎙️  Sarah Webhook Server Running');
  console.log('='.repeat(60));
  console.log(`📡 Listening on port: ${PORT}`);
  console.log(`🔗 Webhook URL: http://your-domain.com:${PORT}/webhook`);
  console.log(`❤️  Health Check: http://your-domain.com:${PORT}/health`);
  console.log(`📋 Recent Calls: http://your-domain.com:${PORT}/calls`);
  console.log('='.repeat(60));
  console.log('\n📝 Webhook Endpoints:');
  console.log('   POST /webhook/call-started');
  console.log('   POST /webhook/call-ended');
  console.log('   POST /webhook/call-analyzed');
  console.log('   POST /webhook/transcript-updated');
  console.log('   POST /webhook (catches all)');
  console.log('\n⚡ Ready to receive events from Retell AI\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});
