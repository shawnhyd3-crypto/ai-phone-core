require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { parse } = require('url');
const { WebSocketServer } = require('ws');
const twilio = require('twilio');
const { loadConfig } = require('./config-loader');

const config = loadConfig();
const app = express();
const server = createServer(app);

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    client: process.env.CLIENT_ID || 'default',
    business: config.business.name,
    timestamp: new Date().toISOString()
  });
});

// Twilio incoming call webhook
app.post('/incoming-call', async (req, res) => {
  const { From, To, CallSid } = req.body;
  
  console.log(`[Call] Incoming from ${From} to ${To} (${CallSid})`);
  
  const twiml = new twilio.twiml.VoiceResponse();
  
  // Greeting
  if (config.callHandling.requireGreeting) {
    twiml.say(
      { voice: 'Polly.Joanna' },
      config.assistant.greeting
    );
  }
  
  // Connect to OpenAI Realtime stream
  const connect = twiml.connect();
  connect.stream({
    url: `wss://${req.headers.host}/media-stream`,
    track: 'both_tracks'
  });
  
  res.type('text/xml');
  res.send(twiml.toString());
});

// Call status callbacks
app.post('/call-status', (req, res) => {
  console.log('[Status]', req.body.CallStatus, req.body.CallSid);
  res.sendStatus(200);
});

// Voicemail/recording callback
app.post('/recording', (req, res) => {
  console.log('[Recording]', req.body.RecordingUrl);
  // TODO: Send email notification
  res.sendStatus(200);
});

// WebSocket for media stream (OpenAI Realtime)
const wss = new WebSocketServer({ 
  server,
  path: '/media-stream'
});

wss.on('connection', (ws, req) => {
  console.log('[WebSocket] Client connected');
  
  // TODO: Implement OpenAI Realtime connection
  // This is where the magic happens - connect to OpenAI,
  // stream audio both ways, handle function calls
  
  ws.on('message', (data) => {
    // Handle media from Twilio
    const msg = JSON.parse(data);
    
    if (msg.event === 'media') {
      // Forward to OpenAI
    } else if (msg.event === 'start') {
      console.log('[Stream] Started:', msg.start.callSid);
    } else if (msg.event === 'stop') {
      console.log('[Stream] Stopped');
    }
  });
  
  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });
  
  ws.on('error', (err) => {
    console.error('[WebSocket] Error:', err);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[Server] ${config.business.name} AI Assistant running on port ${PORT}`);
  console.log(`[Server] Health: http://localhost:${PORT}/health`);
});

module.exports = { app, server };
