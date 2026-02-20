/**
 * AI Phone Core - v3.0
 * Full-featured system with recording, transcription, email, calendar integration
 * Based on Rake & Clover production system
 */

const express = require('express');
const ExpressWs = require('express-ws');
const WebSocket = require('ws');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
require('dotenv').config();

const { loadClient } = require('./config-loader');
const PromptEngine = require('./prompt-engine');
const { 
  extractIntentAndCategory, 
  extractName, 
  formatDuration, 
  formatPhoneNumber 
} = require('./utils');
const { createPlainTextEmail, createHtmlEmail } = require('./email-templates');

// Load client config with dynamic prompt generation
const clientConfig = loadClient(process.env.CLIENT_ID || 'rake-clover');
const promptEngine = new PromptEngine(clientConfig);

// Build runtime config - MATCH WORKING DEV VERSION
const config = {
  ...clientConfig,
  business: clientConfig.business,
  assistant: clientConfig.assistant,
  openai: {
    model: 'gpt-4o-realtime-preview-2024-12-17',  // Updated to match working version
    voice: 'marin'  // Working voice from dev
  },
  email: clientConfig.email,
  callHandling: clientConfig.callHandling || { maxDuration: 600, voicemailAfter: 300 }
};
const app = express();
ExpressWs(app);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Track active calls
const activeCalls = new Map();

// ============ HEALTH & INFO ============

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    client: process.env.CLIENT_ID || 'default',
    business: config.business.name,
    version: '3.0.0',
    features: ['recording', 'transcription', 'email', 'calendar', 'silence-detection'],
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'AI Phone Core',
    version: '3.0.0',
    client: config.business.name,
    status: 'running'
  });
});

// ============ TWILIO WEBHOOK ============

app.post('/incoming-call', async (req, res) => {
  const callSid = req.body.CallSid;
  const from = req.body.From;
  const to = req.body.To;
  
  console.log(`\n📞 INCOMING CALL`);
  console.log(`   Business: ${config.business.name}`);
  console.log(`   Call SID: ${callSid}`);
  console.log(`   From: ${from}`);
  console.log(`   To: ${to}`);
  
  // Store call metadata
  activeCalls.set(callSid, {
    from: from,
    to: to,
    startTime: new Date()
  });
  
  // Send TwiML response - use hostname without port for WSS
  const host = req.headers.host?.split(':')[0] || req.headers.host;
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="woman">This call is being recorded for quality purposes.</Say>
      <Connect>
        <Stream url="wss://${host}/media-stream" />
      </Connect>
    </Response>`;
  
  res.type('text/xml');
  res.send(twimlResponse);
  
  console.log('   TwiML sent, waiting for stream...');
  
  // Start recording via API
  setTimeout(() => {
    startRecording(callSid, host).catch(err => {
      console.error('   Failed to start recording:', err.message);
    });
  }, 1000);
});

// ============ RECORDING ============

async function startRecording(callSid, host) {
  try {
    console.log(`🎙️ Starting recording for ${callSid}`);
    
    const callbackUrl = `https://${host}/recording-complete`;
    
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Calls/${callSid}/Recordings.json`,
      new URLSearchParams({
        'RecordingChannels': 'dual',
        'RecordingStatusCallback': callbackUrl,
        'RecordingStatusCallbackEvent': 'completed',
        'RecordingStatusCallbackMethod': 'POST'
      }),
      {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log(`✅ Recording started: ${response.data.sid}`);
    
    const callData = activeCalls.get(callSid);
    if (callData) {
      callData.recordingSid = response.data.sid;
    }
    
  } catch (error) {
    console.error('❌ Recording failed:', error.response?.data || error.message);
  }
}

// ============ CALL HANGUP ============

async function hangupCall(callSid) {
  try {
    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`,
      new URLSearchParams({
        'Status': 'completed'
      }),
      {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log(`✅ Call ${callSid} hung up`);
  } catch (error) {
    console.error('❌ Failed to hang up call:', error.response?.data || error.message);
  }
}

// ============ MEDIA STREAM (OpenAI Realtime) ============

app.ws('/media-stream', (ws) => {
  console.log('🔌 Media Stream connected');
  
  let streamSid = null;
  let callSid = null;
  let openAiWs = null;
  let lastActivityTime = Date.now();
  let silenceCheckInterval = null;
  let callStartTime = Date.now();
  
  // Silence detection
  const startSilenceCheck = () => {
    silenceCheckInterval = setInterval(() => {
      const silenceDuration = Date.now() - lastActivityTime;
      const callDuration = Date.now() - callStartTime;
      
      // After 30 seconds of silence on an established call (3+ minutes), end naturally
      if (silenceDuration > 30000 && callDuration > 180000) {
        console.log('📞 Ending call due to silence - saying goodbye');
        if (openAiWs && openAiWs.readyState === WebSocket.OPEN) {
          openAiWs.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'user',
              content: [{ 
                type: 'input_text', 
                text: `[The caller seems to have hung up or is done. Say a brief goodbye like "Okay, have a good day!" or "Have a great day!" then end the call. Keep it under 6 words.]` 
              }]
            }
          }));
          openAiWs.send(JSON.stringify({ type: 'response.create' }));
        }
        
        setTimeout(async () => {
          if (openAiWs) openAiWs.close();
          ws.close();
          
          // Explicitly hang up the Twilio call
          if (callSid) {
            console.log(`📞 Hanging up call ${callSid}`);
            await hangupCall(callSid);
          }
        }, 3000);
        
        clearInterval(silenceCheckInterval);
      }
    }, 10000);
  };
  
  const connectToOpenAI = () => {
    const url = `wss://api.openai.com/v1/realtime?model=${config.openai.model}`;
    
    console.log('🔗 Connecting to OpenAI...');
    console.log('   Model:', config.openai.model);
    console.log('   API Key present:', !!process.env.OPENAI_API_KEY);
    
    openAiWs = new WebSocket(url, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    });
    
    openAiWs.on('open', () => {
      console.log('✅ OpenAI connected');
      
      openAiWs.send(JSON.stringify({
        type: 'session.update',
        session: {
          turn_detection: { 
            type: 'server_vad',
            threshold: 0.60,
            prefix_padding_ms: 300,
            silence_duration_ms: 800
          },
          input_audio_format: 'g711_ulaw',
          output_audio_format: 'g711_ulaw',
          voice: config.openai.voice || 'alloy',
          instructions: clientConfig._generated.systemPrompt,
          modalities: ['text', 'audio'],
          temperature: 0.65
        }
      }));
      
      openAiWs.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: '[Call connected]' }]
        }
      }));
      
      openAiWs.send(JSON.stringify({ type: 'response.create' }));
      console.log('👋 Greeting triggered');
      
      setTimeout(() => {
        startSilenceCheck();
      }, 5000);
    });
    
    openAiWs.on('message', (data) => {
      try {
        const response = JSON.parse(data);
        
        // Log all response types for debugging
        if (response.type !== 'response.audio.delta') {
          console.log('📨 OpenAI:', response.type);
        }
        
        if (response.type === 'response.audio.delta' && response.delta) {
          ws.send(JSON.stringify({
            event: 'media',
            streamSid: streamSid,
            media: { payload: response.delta }
          }));
        }
        
        if (response.type === 'error') {
          console.error('❌ OpenAI Error:', JSON.stringify(response.error, null, 2));
        }
      } catch (error) {
        console.error('Error parsing OpenAI message:', error.message);
      }
    });
    
    openAiWs.on('error', (error) => {
      console.error('❌ OpenAI WebSocket error:', error.message);
      console.error('   URL:', url);
      console.error('   API Key present:', !!process.env.OPENAI_API_KEY);
    });
    
    openAiWs.on('close', () => {
      console.log('❌ OpenAI closed');
    });
  };
  
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      
      switch (msg.event) {
        case 'start':
          streamSid = msg.start.streamSid;
          callSid = msg.start.callSid;
          console.log(`📞 Stream started: ${callSid}`);
          connectToOpenAI();
          break;
          
        case 'media':
          lastActivityTime = Date.now();
          if (openAiWs && openAiWs.readyState === WebSocket.OPEN) {
            openAiWs.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: msg.media.payload
            }));
          }
          break;
          
        case 'stop':
          console.log(`📞 Stream ended: ${callSid}`);
          if (openAiWs) openAiWs.close();
          break;
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 Stream closed');
    if (silenceCheckInterval) clearInterval(silenceCheckInterval);
    if (openAiWs) openAiWs.close();
  });
});

// ============ RECORDING CALLBACK ============

app.post('/recording-complete', async (req, res) => {
  console.log('\n🎙️ RECORDING COMPLETE');
  
  const { CallSid, RecordingSid, RecordingUrl, RecordingDuration, RecordingChannels } = req.body;
  
  res.sendStatus(200);
  
  if (!RecordingUrl) {
    console.log('   No recording URL');
    return;
  }
  
  processRecording({
    callSid: CallSid,
    recordingSid: RecordingSid,
    recordingUrl: RecordingUrl,
    duration: parseInt(RecordingDuration) || 0,
    channels: RecordingChannels
  }).catch(err => {
    console.error('❌ Processing error:', err.message);
  });
});

async function processRecording({ callSid, recordingUrl, duration, channels }) {
  console.log(`\n🔄 PROCESSING`);
  console.log(`   Call: ${callSid}`);
  console.log(`   Duration: ${duration}s`);
  
  const callData = activeCalls.get(callSid) || {};
  const timestamp = new Date();
  const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
  const tempDir = path.join('/tmp', `rec-${callSid}`);
  
  try {
    await fs.mkdir(tempDir, { recursive: true });
    
    // Download
    console.log('⬇️ Downloading...');
    const recordingPath = path.join(tempDir, `rec-${timeStr}.wav`);
    await downloadRecording(recordingUrl, recordingPath);
    console.log('✅ Downloaded');
    
    // Mix to MP3
    console.log('🎵 Mixing...');
    const mixedPath = path.join(tempDir, `mixed-${timeStr}.mp3`);
    await mixAudio(recordingPath, mixedPath, channels);
    console.log('✅ Mixed');
    
    // Transcribe
    console.log('📝 Transcribing...');
    const transcript = await transcribeAudio(mixedPath);
    console.log('✅ Transcribed');
    
    // Check if real conversation
    const hasRealConversation = transcript.length > 50 && !transcript.includes('No transcript available');
    const isShortCall = duration < 15;
    
    // Summary
    console.log('🤖 Summarizing...');
    let summary;
    if (!hasRealConversation && isShortCall) {
      summary = 'No conversation - caller hung up immediately or line was silent.';
      console.log('   ⚠️ Short/silent call detected - skipping GPT summary');
    } else {
      summary = await generateSummary(transcript);
    }
    console.log('✅ Summarized');
    
    // Save files
    const transcriptPath = path.join(tempDir, `transcript-${timeStr}.txt`);
    const summaryPath = path.join(tempDir, `summary-${timeStr}.txt`);
    await fs.writeFile(transcriptPath, transcript);
    await fs.writeFile(summaryPath, summary);
    
    // Email
    console.log('📧 Emailing...');
    await sendEmail({
      config,
      callSid,
      fromNumber: callData.from,
      duration,
      transcript,
      summary,
      attachments: {
        audio: mixedPath,
        transcript: transcriptPath,
        summary: summaryPath
      },
      timestamp
    });
    console.log('✅ Emailed');
    
    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log(`   Files in: ${tempDir}`);
  }
}

async function downloadRecording(url, outputPath) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    auth: {
      username: process.env.TWILIO_ACCOUNT_SID,
      password: process.env.TWILIO_AUTH_TOKEN
    },
    timeout: 30000
  });
  await fs.writeFile(outputPath, Buffer.from(response.data));
}

async function mixAudio(inputPath, outputPath, channels) {
  try {
    const cmd = channels === 'dual' 
      ? `ffmpeg -i "${inputPath}" -ac 2 -ar 44100 -b:a 128k "${outputPath}" -y`
      : `ffmpeg -i "${inputPath}" -ar 44100 -b:a 128k "${outputPath}" -y`;
    
    await execPromise(cmd);
  } catch (error) {
    console.log('   FFmpeg failed, copying as WAV');
    await fs.copyFile(inputPath, outputPath.replace('.mp3', '.wav'));
  }
}

async function transcribeAudio(audioPath) {
  const formData = new FormData();
  const buffer = await fs.readFile(audioPath);
  
  formData.append('file', buffer, path.basename(audioPath));
  formData.append('model', 'whisper-1');
  formData.append('language', 'en');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'word');
  
  const response = await axios.post(
    'https://api.openai.com/v1/audio/transcriptions',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      maxBodyLength: Infinity,
      timeout: 60000
    }
  );
  
  return formatTranscriptWithTimestamps(response.data);
}

function formatTranscriptWithTimestamps(whisperData) {
  if (!whisperData.words || whisperData.words.length === 0) {
    return whisperData.text || 'No transcript available';
  }
  
  const lines = [];
  let currentLine = '';
  let currentStartTime = null;
  
  for (let i = 0; i < whisperData.words.length; i++) {
    const word = whisperData.words[i];
    
    if (!currentStartTime) {
      currentStartTime = word.start;
    }
    
    currentLine += word.word + ' ';
    
    const isEndOfSentence = /[.!?]$/.test(word.word);
    const nextWord = whisperData.words[i + 1];
    const longPause = nextWord && (nextWord.start - word.end) > 1.5;
    
    if (isEndOfSentence || longPause || i === whisperData.words.length - 1) {
      const timestamp = formatTimestamp(currentStartTime);
      lines.push(`[${timestamp}] ${currentLine.trim()}`);
      currentLine = '';
      currentStartTime = null;
    }
  }
  
  return lines.join('\n');
}

function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function generateSummary(transcript) {
  if (!transcript || transcript.length < 30 || transcript.includes('No transcript available')) {
    return 'No conversation captured - caller may have hung up immediately or line was silent.';
  }
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Summarize this call transcript. If the transcript shows only an AI greeting with no caller response, state "No conversation - caller hung up immediately." Otherwise, format with clear section headings and bullet points. Use dash (-) for bullets, NO asterisks. Sections: "What They Wanted", "Key Details", "Action Items". Keep it professional and easy to read. Be honest - do not invent details if the caller said nothing.'
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    return 'Summary not available.';
  }
}

async function sendEmail({ config, callSid, fromNumber, duration, transcript, summary, attachments, timestamp }) {
  const audioBuffer = await fs.readFile(attachments.audio);
  
  const { intent, category } = extractIntentAndCategory(transcript);
  const callerName = extractName(transcript, config.assistant.name);
  const subject = `${category}: ${intent} - ${timestamp.toLocaleDateString()}`;
  
  const formattedDuration = formatDuration(duration);
  const callerNumber = formatPhoneNumber(fromNumber);
  
  const emailData = {
    personalizations: [{
      to: [{ email: config.email.to }],
      bcc: config.email.bcc ? [{ email: config.email.bcc }] : undefined
    }],
    from: { 
      email: process.env.FROM_EMAIL || config.email.from,
      name: config.business.name
    },
    subject: subject,
    content: [
      {
        type: 'text/plain',
        value: createPlainTextEmail({ 
          config, 
          callerName, 
          callerNumber, 
          formattedDuration, 
          intent, 
          summary, 
          transcript, 
          timestamp 
        })
      },
      {
        type: 'text/html',
        value: createHtmlEmail({ 
          config, 
          callerName, 
          callerNumber, 
          formattedDuration, 
          intent, 
          summary, 
          transcript, 
          timestamp 
        })
      }
    ],
    attachments: [
      {
        filename: `call-recording-${timestamp.getTime()}.mp3`,
        content: audioBuffer.toString('base64'),
        type: 'audio/mpeg',
        disposition: 'attachment'
      }
    ]
  };
  
  await axios.post('https://api.sendgrid.com/v3/mail/send', emailData, {
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
}

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`\n🚀 AI Phone Core v3.0`);
  console.log(`   Client: ${config.business.name}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

module.exports = { app };
