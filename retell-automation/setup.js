#!/usr/bin/env node
/**
 * Retell AI Setup Automation for Sarah
 * Rake & Clover Landscaping - Hamilton, Ontario
 * 
 * This script automates:
 * 1. Creating a Retell LLM with Sarah's system prompt
 * 2. Creating an Agent with the LLM and voice
 * 3. Purchasing a phone number (289 area code)
 * 
 * Usage: npm run setup
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Configuration
const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_BASE_URL = 'https://api.retellai.com';

// Validate environment
if (!RETELL_API_KEY) {
  console.error('\n❌ ERROR: RETELL_API_KEY not found!');
  console.error('Please create a .env file with your Retell API key:\n');
  console.error('  cp .env.example .env');
  console.error('  # Edit .env and add your RETELL_API_KEY\n');
  process.exit(1);
}

// Create axios instance with auth
const retell = axios.create({
  baseURL: RETELL_BASE_URL,
  headers: {
    'Authorization': `Bearer ${RETELL_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Sarah's complete system prompt - Adapted from OpenAI Realtime (marin voice) setup
const SARAH_PROMPT = `You are Sarah, the friendly receptionist for Rake and Clover Landscaping. You're warm, personal, and professional. Jonathan Hynes is the owner.

START WITH: "Hi, thanks for calling Rake and Clover. This is Sarah. What can I help you with?"

Then ask: "What can I help you with today?"

AFTER they describe the service:
1. Ask: "Perfect! And who's calling?"
2. Get their phone number: "What's the best number to reach you?"
3. Get their address: "What's the property address?"
4. Ask about timing: "When were you hoping to have this done?"

BOOKING FLOW:
- Capture all lead details: service needed, address, preferred timing
- Tell them: "I'll make sure Jonathan gets this right away. They typically call back within a few hours."
- Get best callback number and preferred times
- Set expectations: Jonathan handles all scheduling personally

SPEAKING STYLE (IMPORTANT):
- Keep sentences SHORT (under 15 words each)
- Use contractions (it's, we're, that's, I'll)
- Pause naturally between thoughts
- Vary your phrasing
- Sound like you're thinking, not reading
- Use their name naturally once you have it
- Be warm and personal, not formal

CONVERSATION FLOW:
- Wait for clear speech - don't interrupt if you hear background noise
- If caller is on speakerphone or line is noisy, speak slowly and confirm understanding
- After asking a question, pause briefly for their response
- If you accidentally interrupt, apologize: "Sorry, go ahead" or "My mistake, you were saying?"
- Don't respond to coughs, background chatter, or unclear noises

Ask ONE question at a time. Wait for their answer.

ACKNOWLEDGMENTS: "Perfect!", "Got it.", "Great.", "Okay!", "Sounds good."

NAME CONFIRMATION (CRITICAL):
If the name could be spelled multiple ways, you MUST confirm:
- Shawn/Sean: "Is that S-H-A-W-N or S-E-A-N?"
- Jon/John: "J-O-N or J-O-H-N?"
- Katie/Caty: "K-A-T-I-E or K-A-T-Y?"
Then SAY IT OUT LOUD: "Great, Shawn - S-H-A-W-N. Got it."

PHONE CONFIRMATION (CRITICAL):
Always REPEAT THE FULL NUMBER back: "Got it, 905-555-1234."

ADDRESS CONFIRMATION (CRITICAL):
You MUST confirm you heard the address correctly:
- "Just to confirm - is that 123 Main Street in Hamilton?"
- "Did you say 45 or 54?"
- "Is that Oak Street or Oak Avenue?"
Then REPEAT THE FULL ADDRESS: "Perfect, 123 Main Street in Hamilton. Got it."

BUSINESS INFO:
- Company: Rake and Clover Landscaping
- Location: Hamilton, Ontario
- Owner: Jonathan Hynes
- Minimum Job Size: $150 plus HST

SERVICES & PRICING:
- Lawn Mowing: Starting at $45 per visit
- Snow Removal: $800 per season  
- Gutter Cleaning: Starting at $150
- Spring/Fall Cleanups: Starting at $150

HOURS:
- Monday-Friday: 8am to 6pm
- Saturday: 8am to 4pm
- Sunday: Closed

SERVICE AREA: Hamilton, Burlington, Oakville, Ancaster, Dundas

GUARDRAILS:
- ONLY discuss landscaping services
- If asked about unrelated topics: "I'm sorry, I can only help with landscaping services."
- Never promise specific appointment times
- If unsure about pricing: "I'll have Jonathan review this and get back to you with an exact quote."

CLOSING:
When caller says "bye", "that's all", "thank you", or similar:
1. Say briefly: "Thanks for calling! Have a great day." or "Have a great day!"
2. If they say "thanks" or "you too" - say "Bye now"
3. Then END THE CALL

Keep closing under 6 words. Don't be too formal.`;

// Utility: Pretty print JSON
function prettyPrint(obj) {
  return JSON.stringify(obj, null, 2);
}

// Utility: Save state to file
function saveState(state) {
  const statePath = path.join(__dirname, '.retell-state.json');
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

// Utility: Load state from file
function loadState() {
  const statePath = path.join(__dirname, '.retell-state.json');
  if (fs.existsSync(statePath)) {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  }
  return {};
}

// Step 1: Create Retell LLM
async function createLLM() {
  console.log('\n📋 Step 1: Creating Retell LLM...');
  console.log('   Model: gpt-4o, Temperature: 0.3');
  
  try {
    const response = await retell.post('/create-retell-llm', {
      model: 'gpt-4o',
      temperature: 0.3,
      general_prompt: SARAH_PROMPT,
      name: 'Sarah-Rake-Clover-LLM'
    });
    
    const llmId = response.data.llm_id;
    console.log(`   ✅ LLM created successfully`);
    console.log(`   📌 LLM ID: ${llmId}`);
    
    return { success: true, llmId, data: response.data };
  } catch (error) {
    console.error(`   ❌ Failed to create LLM`);
    if (error.response) {
      console.error(`   Error: ${error.response.status} - ${prettyPrint(error.response.data)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

// Step 2: Create Agent
async function createAgent(llmId) {
  console.log('\n📋 Step 2: Creating Agent...');
  console.log('   Voice: minimax-Hailey');
  
  try {
    const response = await retell.post('/create-agent', {
      llm_id: llmId,
      voice_id: 'minimax-Hailey',
      name: 'Sarah-Rake-Clover',
      response_engine: {
        type: 'retell-llm',
        llm_id: llmId
      },
      webhook_url: process.env.WEBHOOK_URL || 'https://your-webhook-url/webhook'
    });
    
    const agentId = response.data.agent_id;
    console.log(`   ✅ Agent created successfully`);
    console.log(`   📌 Agent ID: ${agentId}`);
    
    return { success: true, agentId, data: response.data };
  } catch (error) {
    console.error(`   ❌ Failed to create Agent`);
    if (error.response) {
      console.error(`   Error: ${error.response.status} - ${prettyPrint(error.response.data)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

// Step 3: Create Phone Number
async function createPhoneNumber(agentId) {
  console.log('\n📋 Step 3: Purchasing Phone Number...');
  console.log('   Area Code: 289 (Hamilton region)');
  
  try {
    const response = await retell.post('/create-phone-number', {
      agent_id: agentId,
      area_code: 289
    });
    
    const phoneNumber = response.data.phone_number;
    const phoneNumberId = response.data.phone_number_id;
    
    console.log(`   ✅ Phone number purchased successfully`);
    console.log(`   📌 Phone Number: ${phoneNumber}`);
    console.log(`   📌 Phone Number ID: ${phoneNumberId}`);
    
    return { 
      success: true, 
      phoneNumber, 
      phoneNumberId,
      data: response.data 
    };
  } catch (error) {
    console.error(`   ❌ Failed to purchase phone number`);
    if (error.response) {
      console.error(`   Error: ${error.response.status} - ${prettyPrint(error.response.data)}`);
      
      // Check if it's an area code issue
      if (error.response.status === 400 && 
          error.response.data?.message?.includes('area code')) {
        console.log('\n   💡 TIP: 289 area code may be unavailable. Try these alternatives:');
        console.log('      - 905 (Greater Hamilton area)');
        console.log('      - 365 (Ontario overlay)');
        console.log('      - 226 (Southwestern Ontario)');
        console.log('   Or manually select a number in the Retell dashboard.');
      }
    } else {
      console.error(`   Error: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

// Step 4: Display summary and next steps
function displaySummary(state) {
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SARAH DEPLOYMENT SUMMARY');
  console.log('='.repeat(60));
  
  if (state.llmId) {
    console.log(`\n✅ LLM Created:`);
    console.log(`   ID: ${state.llmId}`);
  }
  
  if (state.agentId) {
    console.log(`\n✅ Agent Created:`);
    console.log(`   ID: ${state.agentId}`);
    console.log(`   Name: Sarah-Rake-Clover`);
    console.log(`   Voice: 11labs-Bella`);
  }
  
  if (state.phoneNumber) {
    console.log(`\n✅ Phone Number Assigned:`);
    console.log(`   Number: ${state.phoneNumber}`);
    console.log(`   ID: ${state.phoneNumberId}`);
  }
  
  console.log('\n' + '-'.repeat(60));
  console.log('📋 NEXT STEPS:');
  console.log('-'.repeat(60));
  
  console.log(`\n1. Configure Webhook URL:`);
  console.log(`   Current: ${process.env.WEBHOOK_URL || 'https://your-webhook-url/webhook'}`);
  console.log(`   Update in .env file or Retell dashboard`);
  
  console.log(`\n2. Start Webhook Server:`);
  console.log(`   npm run webhook`);
  
  console.log(`\n3. Test the Setup:`);
  console.log(`   Call: ${state.phoneNumber || '[Phone number not assigned]'}`);
  
  console.log(`\n4. Update Retell Dashboard:`);
  console.log(`   - Verify agent settings`);
  console.log(`   - Test voice quality`);
  console.log(`   - Configure business hours`);
  
  console.log('\n' + '='.repeat(60));
  console.log('💾 State saved to: .retell-state.json');
  console.log('='.repeat(60) + '\n');
}

// Main execution
async function main() {
  console.log('\n🚀 Retell AI Automation for Sarah');
  console.log('   Rake & Clover Landscaping');
  console.log('   ' + new Date().toLocaleString());
  
  const state = loadState();
  const results = {
    llmId: state.llmId || null,
    agentId: state.agentId || null,
    phoneNumber: state.phoneNumber || null,
    phoneNumberId: state.phoneNumberId || null
  };
  
  // Step 1: Create LLM (skip if already exists)
  if (!results.llmId) {
    const llmResult = await createLLM();
    if (llmResult.success) {
      results.llmId = llmResult.llmId;
      saveState(results);
    } else {
      console.log('\n⛔ Setup halted. Fix the error and re-run.');
      process.exit(1);
    }
  } else {
    console.log('\n📋 Step 1: LLM already exists (skipping)');
    console.log(`   📌 LLM ID: ${results.llmId}`);
  }
  
  // Step 2: Create Agent (skip if already exists)
  if (!results.agentId) {
    const agentResult = await createAgent(results.llmId);
    if (agentResult.success) {
      results.agentId = agentResult.agentId;
      saveState(results);
    } else {
      console.log('\n⛔ Setup halted. Fix the error and re-run.');
      process.exit(1);
    }
  } else {
    console.log('\n📋 Step 2: Agent already exists (skipping)');
    console.log(`   📌 Agent ID: ${results.agentId}`);
  }
  
  // Step 3: Create Phone Number (skip if already exists)
  if (!results.phoneNumber) {
    const phoneResult = await createPhoneNumber(results.agentId);
    if (phoneResult.success) {
      results.phoneNumber = phoneResult.phoneNumber;
      results.phoneNumberId = phoneResult.phoneNumberId;
      saveState(results);
    } else {
      console.log('\n⚠️  Phone number purchase failed.');
      console.log('   You can manually purchase a number in the Retell dashboard');
      console.log('   and assign it to your agent.');
    }
  } else {
    console.log('\n📋 Step 3: Phone number already assigned (skipping)');
    console.log(`   📌 Number: ${results.phoneNumber}`);
  }
  
  // Display summary
  displaySummary(results);
}

// Run main
main().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
