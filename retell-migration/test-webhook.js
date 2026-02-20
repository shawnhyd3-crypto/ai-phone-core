/**
 * Test script for Retell webhook handler
 * Simulates webhook events from Retell for testing
 */

const crypto = require('crypto');
require('dotenv').config();

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/webhooks/retell';
const WEBHOOK_SECRET = process.env.RETELL_WEBHOOK_SECRET || 'test-secret';

/**
 * Generate webhook signature
 */
function generateSignature(payload) {
  return crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
}

/**
 * Send test webhook
 */
async function sendWebhook(eventType, callData) {
  const payload = {
    event: eventType,
    call: {
      call_id: `test_call_${Date.now()}`,
      agent_id: 'agent_test123',
      from_number: '+19055551234',
      to_number: '+12895559876',
      start_timestamp: new Date().toISOString(),
      end_timestamp: new Date().toISOString(),
      duration_ms: 180000,
      recording_url: 'https://example.com/recording.mp3',
      transcript: [
        { role: 'agent', content: 'Hi, thanks for calling Rake and Clover. This is Sarah. What can I help you with?' },
        { role: 'user', content: 'Hi, I need a quote for lawn mowing.' },
        { role: 'agent', content: 'Great! We do lawn mowing all over Hamilton. Could I get your name?' },
        { role: 'user', content: 'It\'s Shawn Hyde.' },
        { role: 'agent', content: 'Thanks! Is that S-H-A-W-N?' },
        { role: 'user', content: 'Yes, that\'s right.' },
        { role: 'agent', content: 'Perfect. And what\'s the best phone number to reach you?' },
        { role: 'user', content: '905-555-1234' },
        { role: 'agent', content: 'Let me repeat that back - 905-555-1234. Is that right?' },
        { role: 'user', content: 'Yes.' }
      ],
      tool_calls: [
        {
          name: 'capture_lead',
          parameters: {
            name: 'Shawn Hyde',
            phone: '905-555-1234',
            address: '123 Main Street, Hamilton, Ontario',
            service: 'lawn_mowing',
            timing: 'As soon as possible',
            details: 'Small residential yard, about 2000 sq ft'
          }
        }
      ],
      ...callData
    }
  };

  const signature = generateSignature(payload);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Retell-Signature': signature
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log(`✅ ${eventType} webhook sent successfully`);
    console.log('Response:', result);
    return result;
  } catch (error) {
    console.error(`❌ ${eventType} webhook failed:`, error.message);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Starting webhook tests...\n');
  console.log(`Webhook URL: ${WEBHOOK_URL}`);
  console.log(`Webhook Secret: ${WEBHOOK_SECRET ? 'Set' : 'Not set'}\n`);

  try {
    // Test call_started
    console.log('Test 1: call_started event');
    await sendWebhook('call_started', {
      start_timestamp: new Date().toISOString()
    });
    console.log('');

    // Test call_ended
    console.log('Test 2: call_ended event');
    await sendWebhook('call_ended', {
      end_timestamp: new Date().toISOString(),
      duration_ms: 180000,
      disconnection_reason: 'user_hangup'
    });
    console.log('');

    // Test call_analyzed (triggers email)
    console.log('Test 3: call_analyzed event (triggers email)');
    await sendWebhook('call_analyzed', {
      call_analysis: {
        lead_captured: true,
        service_requested: 'lawn_mowing',
        urgency: 'this_week',
        sentiment: 'positive',
        follow_up_required: false,
        notes: 'Caller was friendly and provided all required information quickly.'
      }
    });
    console.log('');

    console.log('✅ All tests completed!');
    console.log('\nCheck your email for the test notification.');
    
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

/**
 * Health check
 */
async function healthCheck() {
  try {
    const response = await fetch(WEBHOOK_URL.replace('/webhooks/retell', '/health'));
    const result = await response.json();
    console.log('✅ Health check passed:', result);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

// CLI usage
const command = process.argv[2];

switch (command) {
  case 'health':
    healthCheck();
    break;
  case 'test':
  default:
    runTests();
    break;
}
