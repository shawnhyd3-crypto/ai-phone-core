/**
 * Email templates for call summaries
 */

/**
 * Create plain text email body
 */
function createPlainTextEmail({ config, callerName, callerNumber, formattedDuration, intent, summary, transcript, timestamp }) {
  return `
New Call Summary - ${config.business.name}
================================

CALLER: ${callerName}
PHONE: ${callerNumber}
DURATION: ${formattedDuration}
INTENT: ${intent}
TIME: ${timestamp.toLocaleString('en-US', { timeZone: 'America/Toronto' })}

SUMMARY
-------
${summary}

TRANSCRIPT
----------
${transcript}

---
Powered by Hyde Tech AI Phone Agent
`;
}

/**
 * Create HTML email body
 */
function createHtmlEmail({ config, callerName, callerNumber, formattedDuration, intent, summary, transcript, timestamp }) {
  const formattedTime = timestamp.toLocaleString('en-US', { 
    timeZone: 'America/Toronto',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Convert plain text summary to HTML with proper formatting
  const formattedSummary = summary
    .replace(/\n/g, '<br>')
    .replace(/- (.*?)<br>/g, '<li>$1</li>');
  
  // Format transcript with timestamps
  const formattedTranscript = transcript
    .replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0; opacity: 0.9; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
    .section { margin-bottom: 20px; }
    .section h2 { font-size: 16px; color: #374151; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.05em; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .meta-item { background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; }
    .meta-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .meta-value { font-size: 14px; font-weight: 600; color: #111827; }
    .summary-box { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; }
    .transcript-box { background: #1f2937; color: #e5e7eb; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 13px; max-height: 300px; overflow-y: auto; }
    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${config.business.name}</h1>
    <p>New Call Summary</p>
  </div>
  
  <div class="content">
    <div class="meta">
      <div class="meta-item">
        <div class="meta-label">Caller</div>
        <div class="meta-value">${callerName}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Phone</div>
        <div class="meta-value">${callerNumber}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Duration</div>
        <div class="meta-value">${formattedDuration}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Intent</div>
        <div class="meta-value">${intent}</div>
      </div>
    </div>
    
    <div class="section">
      <h2>Summary</h2>
      <div class="summary-box">
        ${formattedSummary}
      </div>
    </div>
    
    <div class="section">
      <h2>Transcript</h2>
      <div class="transcript-box">
        ${formattedTranscript}
      </div>
    </div>
    
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">
      Received: ${formattedTime} (Toronto time)
    </div>
  </div>
  
  <div class="footer">
    Powered by Hyde Tech AI Phone Agent
  </div>
</body>
</html>`;
}

module.exports = {
  createPlainTextEmail,
  createHtmlEmail
};
