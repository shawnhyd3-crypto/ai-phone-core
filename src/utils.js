/**
 * Utility functions for AI Phone Core
 */

/**
 * Extract intent and category from transcript
 */
function extractIntentAndCategory(transcript) {
  if (!transcript || transcript.length < 10) {
    return { intent: 'No conversation', category: 'MISC' };
  }
  
  const lower = transcript.toLowerCase();
  
  // Intent detection
  let intent = 'General inquiry';
  if (lower.includes('quote') || lower.includes('estimate') || lower.includes('price') || lower.includes('cost')) {
    intent = 'Quote request';
  } else if (lower.includes('book') || lower.includes('schedule') || lower.includes('appointment')) {
    intent = 'Booking request';
  } else if (lower.includes('cancel') || lower.includes('reschedule')) {
    intent = 'Cancellation/reschedule';
  } else if (lower.includes('question') || lower.includes('information')) {
    intent = 'Information request';
  }
  
  // Category detection
  let category = 'MISC';
  if (lower.includes('lawn') || lower.includes('mowing') || lower.includes('grass')) {
    category = 'LAWN';
  } else if (lower.includes('window') || lower.includes('gutter')) {
    category = 'WINDOW';
  } else if (lower.includes('snow') || lower.includes('removal')) {
    category = 'SNOW';
  } else if (lower.includes('garden') || lower.includes('mulch') || lower.includes('cleanup')) {
    category = 'GARDEN';
  }
  
  return { intent, category };
}

/**
 * Extract caller name from transcript using simple heuristics
 */
function extractName(transcript, assistantName = 'Sarah') {
  if (!transcript) return 'Unknown';
  
  // Common names to exclude (the assistant, common words)
  const excludedNames = [
    assistantName.toLowerCase(),
    'the', 'a', 'an', 'calling', 'from', 'this', 'that', 'there', 'here',
    'yes', 'yeah', 'sure', 'okay', 'ok', 'hi', 'hello', 'hey', 'thanks'
  ];
  
  // Look for "my name is X" patterns
  const namePatterns = [
    /my name is (\w+)/i,
    /call me (\w+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const name = match[1];
      if (name && name.length > 1 && !excludedNames.includes(name.toLowerCase())) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
  }
  
  // Look for patterns after Sarah asks "who's calling" or "who do I have"
  const responsePatterns = [
    /who['']?s calling\??\s*(?:\[.*?\]\s*)?(\w+)/i,
    /who do i have.*?\s*(?:\[.*?\]\s*)?(\w+)/i,
    /and who['']?s (?:this|calling)\??\s*(?:\[.*?\]\s*)?(\w+)/i
  ];
  
  for (const pattern of responsePatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const name = match[1];
      if (name && name.length > 1 && !excludedNames.includes(name.toLowerCase())) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
  }
  
  // Look for "this is X" but be more careful - check it's not the assistant
  const thisIsMatch = transcript.match(/this is (\w+)/gi);
  if (thisIsMatch) {
    for (const match of thisIsMatch) {
      const name = match.replace(/this is /i, '');
      if (name && name.length > 1 && !excludedNames.includes(name.toLowerCase())) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
  }
  
  return 'Unknown';
}

/**
 * Format duration in seconds to human readable string
 */
function formatDuration(seconds) {
  if (!seconds || seconds < 1) return '0s';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

/**
 * Format phone number for display
 */
function formatPhoneNumber(number) {
  if (!number) return 'Unknown';
  
  // Clean the number
  const cleaned = number.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX if 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format as +X (XXX) XXX-XXXX if 11 digits with country code
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return number;
}

module.exports = {
  extractIntentAndCategory,
  extractName,
  formatDuration,
  formatPhoneNumber
};
