#!/usr/bin/env node
/**
 * Test Script for Sarah
 * Makes a test call to verify the deployment
 * 
 * Usage: npm run test
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_BASE_URL = 'https://api.retellai.com/v2';

// Load saved state
function loadState() {
  const statePath = path.join(__dirname, '.retell-state.json');
  if (fs.existsSync(statePath)) {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  }
  return null;
}

// Create test call
async function createTestCall(agentId, phoneNumber) {
  console.log('\n📞 Creating test call...');
  
  try {
    // Note: Retell's API for making outbound calls
    // This may need to be adjusted based on actual API
    const response = await axios.post(
      `${RETELL_BASE_URL}/create-phone-call`,
      {
        agent_id: agentId,
        to_number: process.env.TEST_PHONE_NUMBER || null // Your number to receive test call
      },
      {
        headers: {
          'Authorization': `Bearer ${RETELL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Test call initiated');
    console.log(`   Call ID: ${response.data.call_id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create test call');
    if (error.response) {
      console.error(`   Error ${error.response.status}:`, error.response.data);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    return null;
  }
}

// Main
async function main() {
  console.log('\n🧪 Sarah Test Script');
  console.log('   ' + new Date().toLocaleString());
  
  if (!RETELL_API_KEY) {
    console.error('\n❌ RETELL_API_KEY not set!');
    process.exit(1);
  }
  
  const state = loadState();
  if (!state || !state.agentId) {
    console.error('\n❌ No agent found. Run setup first:');
    console.error('   npm run setup');
    process.exit(1);
  }
  
  console.log('\n📋 Current Deployment:');
  console.log(`   Agent ID: ${state.agentId}`);
  console.log(`   Phone: ${state.phoneNumber || 'Not assigned'}`);
  
  console.log('\n📝 Manual Test Instructions:');
  console.log('   1. Call this number from your phone:');
  console.log(`      ${state.phoneNumber || '[Not assigned - configure in Retell dashboard]'}`);
  console.log('\n   2. Sarah should answer with:');
  console.log('      "Hi, thanks for calling Rake and Clover. This is Sarah. What can I help you with?"');
  console.log('\n   3. Test the conversation:');
  console.log('      - Ask about lawn mowing');
  console.log('      - Provide your name (test spelling)');
  console.log('      - Provide a test address');
  console.log('      - Ask about pricing');
  console.log('\n   4. Check your webhook server logs for events');
  console.log('   5. Check email for call summary');
  
  // If outbound test is configured
  if (process.env.TEST_PHONE_NUMBER) {
    console.log('\n📞 Attempting outbound test call...');
    await createTestCall(state.agentId, state.phoneNumber);
  }
  
  console.log('\n✅ Test setup complete\n');
}

main().catch(console.error);
