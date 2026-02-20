/**
 * Prompt Engine - Dynamic system prompt generation
 * 
 * Generates context-aware prompts based on client config + real-time context
 * (time of day, calendar mode, business hours, etc.)
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
   */
  generateSystemPrompt(context = {}) {
    const {
      calendarMode = 'lead_capture', // google | jobber | lead_capture
      callType = 'inbound', // inbound | callback
      timeOfDay = this.getCurrentTimeOfDay()
    } = context;

    const parts = [
      this.getIdentitySection(),
      this.getBusinessDetailsSection(),
      this.getServicesSection(),
      this.getHoursSection(timeOfDay),
      this.getCalendarSection(calendarMode),
      this.getConversationFlowSection(),
      this.getRulesSection()
    ];

    return parts.join('\n\n');
  }

  /**
   * Generate a dynamic greeting based on context
   */
  generateGreeting(context = {}) {
    const { timeOfDay = this.getCurrentTimeOfDay() } = context;
    
    const greetings = this.config.greetings?.variations || this.getDefaultGreetings(timeOfDay);
    
    // Pick random greeting
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    // Personalize with time-appropriate modifier
    const timeModifier = this.getTimeModifier(timeOfDay);
    
    return `${timeModifier}${greeting}`.trim();
  }

  /**
   * Identity section - who the AI is
   */
  getIdentitySection() {
    return `You are ${this.assistant.name}, the AI phone assistant for ${this.business.name} in ${this.business.location || 'our service area'}.

YOUR PERSONALITY:
${this.assistant.personality || 'Friendly, professional, and helpful'}

YOUR VOICE:
Speak naturally and conversationally, like a real receptionist. Be warm but efficient.`;
  }

  /**
   * Business details section
   */
  getBusinessDetailsSection() {
    let section = `BUSINESS DETAILS:
- Business Name: ${this.business.name}
- Owner: ${this.business.owner || 'Not specified'}
- Location: ${this.business.location || 'Not specified'}`;

    if (this.business.email) {
      section += `\n- Email: ${this.business.email}`;
    }
    if (this.business.website) {
      section += `\n- Website: ${this.business.website}`;
    }

    return section;
  }

  /**
   * Services and pricing section
   */
  getServicesSection() {
    if (!this.config.services || this.config.services.length === 0) {
      return '';
    }

    let section = 'SERVICES WE OFFER:\n';
    
    this.config.services.forEach(service => {
      section += `- ${service.name}`;
      if (service.description) {
        section += `: ${service.description}`;
      }
      if (service.pricing) {
        section += ` (${service.pricing})`;
      }
      section += '\n';
    });

    // Add pricing rules
    if (this.config.pricing) {
      section += '\nPRICING RULES:\n';
      if (this.config.pricing.minimum) {
        section += `- Minimum job size: ${this.config.pricing.minimum}\n`;
      }
      if (this.config.pricing.quote) {
        section += `- ${this.config.pricing.quote}\n`;
      }
    }

    return section.trim();
  }

  /**
   * Hours section with current status
   */
  getHoursSection(timeOfDay) {
    if (!this.hours) return '';

    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = this.hours[dayName];
    const isOpen = this.isBusinessOpen();

    let section = 'BUSINESS HOURS:\n';
    
    Object.entries(this.hours).forEach(([day, hours]) => {
      section += `- ${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}\n`;
    });

    section += `\nCURRENT STATUS: ${isOpen ? 'OPEN' : 'CLOSED'}\n`;
    
    if (!isOpen && todayHours && todayHours !== 'Closed') {
      section += `Today's hours were: ${todayHours}\n`;
    }

    return section.trim();
  }

  /**
   * Calendar/booking section based on mode
   */
  getCalendarSection(mode) {
    const modes = {
      google: `BOOKING APPOINTMENTS:
We use Google Calendar for scheduling. 
- Ask for: preferred date/time, service needed, name, phone, and address
- Tell them you'll send a calendar invite to confirm
- If they need to reschedule, they can call back or reply to the invite`,

      jobber: `BOOKING APPOINTMENTS:
We use Jobber for scheduling.
- Collect: name, phone, email, service needed, preferred date/time, address
- Tell them Jonathan will confirm the appointment within 24 hours
- Mention they can also book online at ${this.business.website || 'our website'}`,

      lead_capture: `BOOKING APPOINTMENTS (Lead Capture Mode):
We take detailed messages for the owner to follow up.
- Collect: name, phone number, address, service needed, preferred timing
- Ask about: property size, specific issues, urgency
- Tell them ${this.business.owner || 'the owner'} will call back within 24 hours to confirm
- For urgent issues, offer to have them call back ASAP`
    };

    return modes[mode] || modes.lead_capture;
  }

  /**
   * Conversation flow instructions
   */
  getConversationFlowSection() {
    return `CONVERSATION FLOW:
1. Greet warmly and identify the business
2. Listen to what they need
3. Answer questions using the info above
4. If they want to book/quote: collect details systematically
5. Confirm what you've captured
6. Set expectations (callback time, confirmation method, etc.)
7. End politely

HANDLING SILENCE:
- If the caller is silent for 3+ seconds, say: "I'm still here. Take your time."
- If silent for 10+ seconds, ask: "Are you still there?"
- If no response after that, say: "I'll hang up now, but feel free to call back anytime. Have a great day!" and end the call`;
  }

  /**
   * Important rules section
   */
  getRulesSection() {
    const rules = [
      'Always mention minimum pricing if they ask about costs',
      'Be honest about what we do and don\'t offer',
      'Take detailed messages when the owner is unavailable',
      'Confirm phone numbers by repeating them back',
      'Ask about property size for landscaping quotes',
      'End calls politely - thank them for calling'
    ];

    if (this.config.rules) {
      rules.push(...this.config.rules);
    }

    return 'IMPORTANT RULES:\n' + rules.map(r => `- ${r}`).join('\n');
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
   * Get time-appropriate modifier for greeting
   */
  getTimeModifier(timeOfDay) {
    const modifiers = {
      morning: 'Good morning! ',
      afternoon: 'Good afternoon! ',
      evening: 'Good evening! '
    };
    return modifiers[timeOfDay] || '';
  }

  /**
   * Default greetings if none configured
   */
  getDefaultGreetings(timeOfDay) {
    const businessName = this.business.name;
    const assistantName = this.assistant.name;
    
    return [
      `Thanks for calling ${businessName}. This is ${assistantName}. How can I help you today?`,
      `Hello! You've reached ${businessName}. I'm ${assistantName}. What can I do for you?`,
      `${businessName}, this is ${assistantName} speaking. How may I assist you?`,
      `Hi there! ${businessName}. ${assistantName} here. How can I help?`
    ];
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
}

module.exports = PromptEngine;
