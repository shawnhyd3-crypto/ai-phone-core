/**
 * Quick test to verify prompt-engine and config-loader work
 * Run: node test-config.js [client-id]
 */

const PromptEngine = require('./src/prompt-engine');
const { loadClient, listAvailableClients } = require('./src/config-loader');

const clientId = process.argv[2] || 'rake-clover';

console.log('\n🧪 Testing AI Phone Core Config\n');
console.log('=' .repeat(50));

// List available clients
console.log('\n📋 Available clients:');
const clients = listAvailableClients();
clients.forEach(c => console.log(`   - ${c}`));

// Load and test specific client
try {
  console.log(`\n🔧 Loading client: ${clientId}`);
  const config = loadClient(clientId);
  
  console.log('\n✅ Config loaded successfully!\n');
  console.log('='.repeat(50));
  
  // Business info
  console.log('\n🏢 BUSINESS:');
  console.log(`   Name: ${config.business.name}`);
  console.log(`   Owner: ${config.business.owner}`);
  console.log(`   Location: ${config.business.location}`);
  
  // Assistant
  console.log('\n🤖 ASSISTANT:');
  console.log(`   Name: ${config.assistant.name}`);
  console.log(`   Voice: ${config.assistant.voice}`);
  
  // Generated content
  console.log('\n✨ GENERATED:');
  console.log(`   Business Open: ${config._generated.isOpen}`);
  console.log(`   Greeting: "${config._generated.greeting}"`);
  
  // Show different greetings (randomization test)
  console.log('\n🎲 Testing random greetings (3 samples):');
  const engine = new PromptEngine(config);
  for (let i = 0; i < 3; i++) {
    console.log(`   ${i + 1}. "${engine.generateGreeting()}"`);
  }
  
  // Calendar mode
  console.log('\n📅 CALENDAR MODE:');
  console.log(`   Mode: ${config.calendar?.mode || 'lead_capture'}`);
  
  // Show partial system prompt
  console.log('\n📝 SYSTEM PROMPT (first 800 chars):');
  console.log('-'.repeat(50));
  console.log(config._generated.systemPrompt.substring(0, 800) + '...');
  console.log('-'.repeat(50));
  
  console.log('\n✅ All tests passed!\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
