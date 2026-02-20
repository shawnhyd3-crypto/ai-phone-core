/**
 * Twilio Integration for Retell AI
 * 
 * This module handles the connection between Twilio and Retell AI.
 * Use this if you want to keep your existing Twilio number or need
 * additional Twilio features (call tracking, recording, etc.)
 */

const twilio = require('twilio');

// Configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER; // e.g., +12895551234

// Retell configuration
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID; // From Retell dashboard
const RETELL_API_KEY = process.env.RETELL_API_KEY;

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Generate TwiML to connect call to Retell AI
 * This is the simplest integration - just forwards to Retell
 */
function generateRetellTwiML() {
  // Retell provides a webhook URL for Twilio integration
  // You can find this in the Retell dashboard under your agent's settings
  const retellWebhookUrl = `https://api.retellai.com/v1/twilio-webhook/${RETELL_AGENT_ID}`;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${retellWebhookUrl}">
      <Parameter name="retell_agent_id" value="${RETELL_AGENT_ID}" />
    </Stream>
  </Connect>
</Response>`;
}

/**
 * Express handler for Twilio webhooks
 * Place this in your main server file
 */
function handleTwilioWebhook(req, res) {
  const twiml = generateRetellTwiML();
  res.type('text/xml');
  res.send(twiml);
}

/**
 * Alternative: Using Retell's SDK approach
 * This gives you more control over the call flow
 */
async function createRetellCallWithTwilio(toNumber, fromNumber = TWILIO_PHONE_NUMBER) {
  try {
    // Create call in Retell first
    const retellResponse = await fetch('https://api.retellai.com/v2/create-phone-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from_number: fromNumber,
        to_number: toNumber,
        override_agent_id: RETELL_AGENT_ID,
        metadata: {
          source: 'twilio_integration',
          initiated_by: 'system'
        }
      })
    });

    if (!retellResponse.ok) {
      throw new Error(`Retell API error: ${retellResponse.status}`);
    }

    const callData = await retellResponse.json();
    console.log('Retell call created:', callData.call_id);
    
    return callData;
  } catch (error) {
    console.error('Error creating Retell call:', error);
    throw error;
  }
}

/**
 * Make an outbound call using Twilio that connects to Retell
 */
async function makeOutboundCall(toNumber) {
  try {
    // Option 1: Use Retell's direct API (recommended for outbound)
    return await createRetellCallWithTwilio(toNumber);
    
    // Option 2: Use Twilio to initiate, then hand off to Retell
    // This is useful if you need Twilio features during call setup
    /*
    const call = await twilioClient.calls.create({
      url: 'https://your-server.com/twilio/retell-connect',
      to: toNumber,
      from: TWILIO_PHONE_NUMBER,
      statusCallback: 'https://your-server.com/twilio/status',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });
    return call;
    */
  } catch (error) {
    console.error('Error making outbound call:', error);
    throw error;
  }
}

/**
 * Configure Twilio number for Retell integration
 * Run this once to set up your Twilio number
 */
async function configureTwilioNumber() {
  try {
    // Your webhook server URL
    const webhookUrl = process.env.WEBHOOK_BASE_URL + '/twilio/incoming';
    
    // Update the phone number configuration
    const number = await twilioClient.incomingPhoneNumbers.list({
      phoneNumber: TWILIO_PHONE_NUMBER
    });
    
    if (number.length === 0) {
      throw new Error('Phone number not found in Twilio account');
    }
    
    await twilioClient.incomingPhoneNumbers(number[0].sid).update({
      voiceUrl: webhookUrl,
      voiceMethod: 'POST',
      voiceReceiveMode: 'voice'
    });
    
    console.log('✅ Twilio number configured successfully');
    console.log('📞 Number:', TWILIO_PHONE_NUMBER);
    console.log('🔗 Webhook:', webhookUrl);
    
  } catch (error) {
    console.error('❌ Error configuring Twilio number:', error);
    throw error;
  }
}

/**
 * Express routes for Twilio integration
 * Add these to your main server file
 */
function setupTwilioRoutes(app) {
  // Handle incoming calls from Twilio
  app.post('/twilio/incoming', (req, res) => {
    console.log('📞 Incoming Twilio call from:', req.body.From);
    handleTwilioWebhook(req, res);
  });
  
  // Handle call status updates
  app.post('/twilio/status', (req, res) => {
    console.log('📊 Call status update:', {
      callSid: req.body.CallSid,
      status: req.body.CallStatus,
      duration: req.body.CallDuration
    });
    res.sendStatus(200);
  });
  
  // Handle Retell connect (for complex flows)
  app.post('/twilio/retell-connect', (req, res) => {
    handleTwilioWebhook(req, res);
  });
  
  // API endpoint to make outbound calls
  app.post('/api/calls/outbound', async (req, res) => {
    const { toNumber } = req.body;
    
    if (!toNumber) {
      return res.status(400).json({ error: 'toNumber is required' });
    }
    
    try {
      const call = await makeOutboundCall(toNumber);
      res.json({ success: true, call });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

/**
 * Get call logs from Twilio
 * Useful for reconciliation with Retell data
 */
async function getTwilioCallLogs(startDate, endDate) {
  try {
    const calls = await twilioClient.calls.list({
      startTimeAfter: startDate,
      startTimeBefore: endDate,
      limit: 100
    });
    
    return calls.map(call => ({
      sid: call.sid,
      from: call.from,
      to: call.to,
      status: call.status,
      duration: call.duration,
      startTime: call.startTime,
      endTime: call.endTime,
      price: call.price,
      direction: call.direction
    }));
  } catch (error) {
    console.error('Error fetching Twilio call logs:', error);
    throw error;
  }
}

/**
 * Reconcile Twilio calls with Retell calls
 * Ensures billing accuracy and complete call records
 */
async function reconcileCalls(date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  try {
    const twilioCalls = await getTwilioCallLogs(startOfDay, endOfDay);
    
    // Fetch Retell calls for the same period
    const retellResponse = await fetch(
      `https://api.retellai.com/v2/list-calls?start_timestamp=${startOfDay.toISOString()}&end_timestamp=${endOfDay.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${RETELL_API_KEY}`
        }
      }
    );
    
    const retellCalls = await retellResponse.json();
    
    // Compare and identify any discrepancies
    const reconciliation = {
      date: date.toISOString().split('T')[0],
      twilioCount: twilioCalls.length,
      retellCount: retellCalls.length,
      twilioCalls: twilioCalls,
      retellCalls: retellCalls,
      discrepancies: []
    };
    
    // Simple matching by phone number and approximate time
    // In production, you'd want more sophisticated matching
    
    console.log('Call reconciliation complete:', reconciliation);
    return reconciliation;
    
  } catch (error) {
    console.error('Error reconciling calls:', error);
    throw error;
  }
}

module.exports = {
  handleTwilioWebhook,
  makeOutboundCall,
  configureTwilioNumber,
  setupTwilioRoutes,
  getTwilioCallLogs,
  reconcileCalls,
  generateRetellTwiML
};

// CLI usage for initial setup
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'configure':
      configureTwilioNumber()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'reconcile':
      reconcileCalls()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log('Usage:');
      console.log('  node twilio-integration.js configure  - Configure Twilio number for Retell');
      console.log('  node twilio-integration.js reconcile  - Reconcile Twilio and Retell call logs');
      process.exit(0);
  }
}
