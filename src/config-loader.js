/**
 * Config Loader - Loads and processes client configurations
 */

const fs = require('fs');
const path = require('path');
const PromptEngine = require('./prompt-engine');

const CLIENTS_DIR = path.join(__dirname, '..', 'clients');

/**
 * Load a client configuration by ID
 */
function loadClient(clientId) {
  const configPath = path.join(CLIENTS_DIR, `${clientId}.json`);
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Client config not found: ${clientId}.json`);
  }

  const rawConfig = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(rawConfig);
  
  // Initialize prompt engine
  const promptEngine = new PromptEngine(config);
  
  // Generate dynamic system prompt
  const systemPrompt = promptEngine.generateSystemPrompt({
    calendarMode: config.calendar?.mode || 'lead_capture'
  });
  
  // Generate a dynamic greeting
  const greeting = promptEngine.generateGreeting();

  return {
    ...config,
    _generated: {
      systemPrompt,
      greeting,
      isOpen: promptEngine.isBusinessOpen()
    }
  };
}

/**
 * List all available client configs
 */
function listAvailableClients() {
  if (!fs.existsSync(CLIENTS_DIR)) {
    return [];
  }

  return fs.readdirSync(CLIENTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

/**
 * Validate a client config
 */
function validateConfig(config) {
  const required = ['business.name', 'assistant.name'];
  const missing = [];

  // Simple deep check for required fields
  if (!config.business?.name) missing.push('business.name');
  if (!config.assistant?.name) missing.push('assistant.name');

  return {
    valid: missing.length === 0,
    missing
  };
}

module.exports = {
  loadClient,
  listAvailableClients,
  validateConfig
};
