/**
 * Email templates for call summaries
 */

/**
 * Extract address from transcript (basic pattern matching)
 */
function extractAddress(transcript) {
  if (!transcript) return null;
  
  // Look for common address patterns
  const addressPatterns = [
    /(\d+\s+[A-Za-z\s]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct|Way|Place|Pl)\b[^\n]*)/i,
    /address is[:\s]+([^\n]+)/i,
    /property (?:is at|at)[:\s]+([^\n]+)/i
  ];
  
  for (const pattern of addressPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Create Google Maps static image URL
 */
function getMapImageUrl(address, apiKey) {
  if (!address) return null;
  
  // Encode address for URL
  const encodedAddress = encodeURIComponent(address);
  
  // Google Maps Static API URL
  // Note: This requires a Google Maps API key. If not available, returns null.
  if (apiKey) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${encodedAddress}&key=${apiKey}`;
  }
  
  // Fallback: Google Maps search link (no API key needed)
  return `https://maps.google.com/maps?q=${encodedAddress}`;
}

/**
 * Create plain text email body
 */
function createPlainTextEmail({ config, callerName, callerNumber, formattedDuration, intent, summary, transcript, timestamp }) {
  const address = extractAddress(transcript);
  const mapLink = address ? `\nADDRESS\n-------\n${address}\nView on map: https://maps.google.com/maps?q=${encodeURIComponent(address)}\n` : '';
  
  return `
New Call Summary - ${config.business.name}
================================

CALLER: ${callerName}
PHONE: ${callerNumber}
DURATION: ${formattedDuration}
INTENT: ${intent}
TIME: ${timestamp.toLocaleString('en-US', { timeZone: 'America/Toronto' })}
${mapLink}
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
  
  // Extract address from transcript
  const address = extractAddress(transcript);
  
  // Convert plain text summary to HTML with proper formatting
  const formattedSummary = summary
    .replace(/\n/g, '<br>')
    .replace(/- (.*?)<br>/g, '<li>$1</li>');
  
  // Format transcript with timestamps
  const formattedTranscript = transcript
    .replace(/\n/g, '<br>');

  // Build address section if found
  let addressSection = '';
  if (address) {
    const mapLink = `https://maps.google.com/maps?q=${encodeURIComponent(address)}`;
    addressSection = `
    <div class="section">
      <h2>📍 Address</h2>
      <div class="address-box">
        <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 500;">${address}</p>
        <a href="${mapLink}" target="_blank" style="display: inline-block; background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px;">View on Google Maps</a>
      </div>
    </div>`;
  }

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
    .address-box { background: #ecfdf5; padding: 15px; border-radius: 6px; border: 1px solid #10b981; }
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
    
    ${addressSection}
    
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
