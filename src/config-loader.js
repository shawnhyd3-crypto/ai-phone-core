const fs = require('fs');
const path = require('path');

/**
 * Config Loader
 * Loads client-specific configuration based on CLIENT_ID environment variable
 */

const DEFAULT_CONFIG = {
  // OpenAI Realtime API settings (shared across all clients)
  openai: {
    model: 'gpt-4o-realtime-preview-2024-10-01',
    voice: 'alloy'
  },
  
  // Default system prompt template
  systemPrompt: `You are a helpful AI phone assistant for a small business. 
Be friendly, professional, and concise. 
Answer questions about services and pricing.
Take messages when the owner is unavailable.`,
  
  // Default business info
  business: {
    name: 'Business Name',
    owner: 'Owner Name',
    email: 'business@example.com',
    phone: '+1-000-000-0000'
  },
  
  // Default services
  services: [],
  
  // Default pricing
  pricing: {
    currency: 'CAD',
    note: 'Pricing available upon request'
  },
  
  // Default assistant personality
  assistant: {
    name: 'Sarah',
    greeting: 'Hello! Thanks for calling. How can I help you today?',
    personality: 'Friendly, professional, helpful'
  },
  
  // Email settings
  email: {
    enabled: true,
    summarySubject: 'New Call Summary',
    voicemailSubject: 'New Voicemail'
  },
  
  // Call handling
  callHandling: {
    maxDuration: 600, // 10 minutes
    voicemailAfter: 300, // 5 minutes
    requireGreeting: true
  }
};

function loadConfig() {
  const clientId = process.env.CLIENT_ID;
  
  if (!clientId) {
    console.warn('[Config] No CLIENT_ID set, using defaults');
    return DEFAULT_CONFIG;
  }
  
  const configPath = path.join(__dirname, '../clients', `${clientId}.json`);
  
  if (!fs.existsSync(configPath)) {
    console.error(`[Config] Client config not found: ${configPath}`);
    console.error(`[Config] Available clients:`, listAvailableClients());
    throw new Error(`Unknown client: ${clientId}`);
  }
  
  const clientConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Deep merge client config with defaults
  const merged = deepMerge(DEFAULT_CONFIG, clientConfig);
  
  console.log(`[Config] Loaded config for client: ${clientId}`);
  console.log(`[Config] Business: ${merged.business.name}`);
  
  return merged;
}

function listAvailableClients() {
  const clientsDir = path.join(__dirname, '../clients');
  if (!fs.existsSync(clientsDir)) return [];
  
  return fs.readdirSync(clientsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

function deepMerge(target, source) {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
}

module.exports = {
  loadConfig,
  listAvailableClients,
  DEFAULT_CONFIG
};
