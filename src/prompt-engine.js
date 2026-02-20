/**
 * Prompt Engine - Dynamic system prompt generation
 * 
 * Hybrid approach: Jon's proven conversation structure + dynamic generation
 * Based on Rake & Clover production system
 */

const path = require('path');
const fs = require('fs');

class PromptEngine {
  constructor(clientConfig) {
    this.config = clientConfig;
    this.business = clientConfig.business;
    this.assistant = clientConfig.assistant;
    this.hours = clientConfig.hours;
  }

  /**
   * Generate the complete system prompt for a call
   * EMBEDS the greeting directly in the prompt (like Jon's working version)
   */
  generateSystemPrompt(context = {}) {
    const {
      calendarMode = 'lead_capture', // google | jobber | lead_capture
      callType = 'inbound',
      timeOfDay = this.getCurrentTimeOfDay()
    } = context;

    // Select a random greeting variation (Jon's approach)
    const greeting = this.selectGreeting(timeOfDay);
    const isOpen = this.isBusinessOpen();
    const ownerFirstName = this.business.owner?.split(' ')[0] || 'the owner';

    // Build the complete prompt (matching Jon's structure)
    return `You're ${this.assistant.name}, the friendly receptionist for ${this.business.name}. You're warm, personal, and professional. ${this.business.owner || 'The owner'} is the owner.

${this.getHoursContext(isOpen)}

START WITH: "${greeting}"

Then ask: "What can I help you with today?"

AFTER they describe the service:
1. Ask: "Perfect! And who's calling?"
   - If name has common spellings, ask about ONLY the ambiguous part (sounds more human):
     * Shawn/Sean: "Is that 'ea' or 'aw'?"
     * Jon/John: "Is that 'o' or 'oh'?"
     * Katie/Caty: "Is that 'ie' or 'y'?"
     * Chris/Kris: "Is that 'Ch' or just 'K'?"
   - Don't spell out the whole name - just the part that could be different

2. Get their phone number: "What's the best number to reach you?"
   - Repeat it back: "Got it, 365-555-1234"

3. Get their address: "What's the property address?"
   - If the address is unclear or you're not sure you heard right, ask ONE clarifying question:
     * "Is that Main Street or Main Road?"
     * "Did you say 123 or 143?"
     * "Is that the house with the big tree out front?"
   - Only ask if genuinely unsure - don't over-confirm

4. Ask about timing: "When were you hoping to have this done?"

${this.getBookingInstructions(calendarMode, ownerFirstName)}

SPEAKING STYLE:
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

${this.getHoursSection()}

${this.getServicesSection()}

${this.getPricingSection()}

${this.getServiceAreaSection()}

If frustrated client or time-sensitive request: This qualifies as urgent. Get their details and let them know ${ownerFirstName} will call back as soon as possible.

CLOSING THE CALL - KEEP IT SHORT AND NATURAL:

When the caller is done (they say "bye", "that's all", "thank you", "goodbye", "that's it", or similar):
1. Say something brief like: "Okay, have a good day!" or "Have a great day!"
2. If they respond with "thanks" or "you too" - say "Bye now" or "Thanks, bye"
3. Then END THE CALL - stop speaking

Rules:
- Keep it under 6 words
- Don't say "Thanks for calling [business name]" - too formal
- Don't say "We'll be in touch soon" - let them end it
- One brief exchange, then hang up

Good examples:
- "Okay, have a good day!"
- "Have a great day!"
- "Bye now"

Bad examples (too wordy):
- "Thanks for calling Rake and Clover Landscaping! We'll be in touch soon. Have a great day!"
- "It was great speaking with you today. Thank you so much for calling. Have a wonderful day!"`
  }

  /**
   * Select a random greeting (Jon's style - casual and warm)
   */
  selectGreeting(timeOfDay) {
    const variations = this.config.greetings?.variations || this.getDefaultGreetings();
    return variations[Math.floor(Math.random() * variations.length)];
  }

  /**
   * Get default greetings (Jon's casual style)
   */
  getDefaultGreetings() {
    const businessName = this.business.name;
    const assistantName = this.assistant.name;
    
    return [
      `Thanks for calling ${businessName}! This is ${assistantName}. How can I help?`,
      `Good morning! ${businessName}. I'm ${assistantName}. What can I do for you?`,
      `Hi! You've reached ${businessName.split(' ').slice(0, 2).join(' ')}. This is ${assistantName}. How can I help today?`,
      `${businessName}, this is ${assistantName}. What can I help you with?`,
      `Hey there! ${assistantName} from ${businessName.split(' ').slice(0, 2).join(' ')}. What can I do for you today?`
    ];
  }

  /**
   * Hours context based on open/closed status
   */
  getHoursContext(isOpen) {
    if (isOpen) {
      return '';
    }
    return "Mention: 'We're currently closed, but I can still help you.'";
  }

  /**
   * Booking instructions based on calendar mode
   */
  getBookingInstructions(calendarMode, ownerFirstName) {
    const modes = {
      google: `BOOKING FLOW:
- ALWAYS offer to book an appointment
- Check availability and offer 2 specific time slots
- Confirm the booking details
- Tell them they'll get a text confirmation
- If they decline booking: "No problem! What's the best number for a callback?"`,

      jobber: `BOOKING FLOW:
- Capture all details for a quote request
- Tell them: "I'll pass this to ${ownerFirstName} and they'll get back to you within 24 hours"
- Get their preferred callback times
- DO NOT promise specific appointment times (${ownerFirstName} handles scheduling in Jobber)`,

      lead_capture: `BOOKING FLOW:
- Capture all lead details: service needed, address, preferred timing
- Tell them: "I'll make sure ${ownerFirstName} gets this right away. They typically call back within a few hours."
- Get best callback number and preferred times
- Set expectations: ${ownerFirstName} handles all scheduling personally`
    };

    return modes[calendarMode] || modes.lead_capture;
  }

  /**
   * Hours section for the prompt
   */
  getHoursSection() {
    if (!this.hours) return '';

    let section = 'HOURS:\n';
    
    Object.entries(this.hours).forEach(([day, hours]) => {
      // Format to match Jon's style (8am - 6pm)
      const formatted = hours.replace(/:00 /g, '').replace(/AM/g, 'am').replace(/PM/g, 'pm');
      section += `- ${day.charAt(0).toUpperCase() + day.slice(1)}: ${formatted}\n`;
    });

    return section.trim();
  }

  /**
   * Services section
   */
  getServicesSection() {
    if (!this.config.services || this.config.services.length === 0) {
      return '';
    }

    let section = 'SERVICES:\n';
    
    this.config.services.forEach(service => {
      section += `- ${service.name}\n`;
    });

    return section.trim();
  }

  /**
   * Pricing section
   */
  getPricingSection() {
    if (!this.config.pricing) return '';

    let section = 'PRICING:\n';
    
    // Add specific service pricing
    if (this.config.pricing.mowing) {
      section += `- Lawn mowing: ${this.config.pricing.mowing}\n`;
    }
    if (this.config.pricing.gutter) {
      section += `- Gutter cleaning: ${this.config.pricing.gutter}\n`;
    }
    if (this.config.pricing.cleanup) {
      section += `- Fall cleanup: ${this.config.pricing.cleanup}\n`;
    }
    if (this.config.pricing.snow) {
      section += `- Snow removal: ${this.config.pricing.snow}\n`;
    }
    
    if (this.config.pricing.minimum) {
      section += `\nMinimum job size: ${this.config.pricing.minimum}\n`;
    }

    return section.trim();
  }

  /**
   * Service area section
   */
  getServiceAreaSection() {
    if (this.config.serviceArea) {
      return `SERVICE AREA:\n- ${this.config.serviceArea.join(', ')}\n- Within 25km of these areas`;
    }
    if (this.business.location) {
      return `SERVICE AREA:\n- ${this.business.location}\n- Within 25km`;
    }
    return '';
  }

  /**
   * Check if business is currently open
   */
  isBusinessOpen() {
    if (!this.hours) return true;
    
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = this.hours[dayName];
    
    if (!todayHours || todayHours === 'Closed') return false;
    
    // Parse hours like "8:00 AM - 6:00 PM"
    const match = todayHours.match(/(\d+):(\d+)\s*(AM|PM)\s*-\s*(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return true; // Can't parse, assume open
    
    const [, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = match;
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = this.to24Hour(parseInt(startHour), startMin, startPeriod) * 60 + parseInt(startMin);
    const endMinutes = this.to24Hour(parseInt(endHour), endMin, endPeriod) * 60 + parseInt(endMin);
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  to24Hour(hour, min, period) {
    if (period.toUpperCase() === 'PM' && hour !== 12) return hour + 12;
    if (period.toUpperCase() === 'AM' && hour === 12) return 0;
    return hour;
  }

  /**
   * Get time of day classification
   */
  getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  /**
   * Generate greeting for external use (email summaries, etc.)
   * Note: The actual greeting the AI speaks comes from generateSystemPrompt()
   */
  generateGreeting() {
    return this.selectGreeting(this.getCurrentTimeOfDay());
  }
}

module.exports = PromptEngine;
