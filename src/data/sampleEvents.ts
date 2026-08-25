import { EventItem, Guest, WhatsAppTemplate, WhatsAppConfig, WhatsAppMessageLog } from '../types';

export const INITIAL_WHATSAPP_CONFIG: WhatsAppConfig = {
  provider: 'whatsapp_cloud_api',
  apiUrl: 'https://graph.facebook.com/v20.0',
  apiToken: '',
  phoneNumberId: '',
  wabaId: '',
  accountSid: '',
  instanceId: '',
  senderPhoneNumber: '',
  senderName: 'TMB Events Concierge',
  webhookSecret: '',
  rateLimitPerMinute: 60,
  autoRetryOnFail: true,
  autoRemindersEnabled: true,
  reminderHoursBefore: [48, 24, 2],
  statusSimulationSpeed: 'realistic',
  isConnected: false,
};

export const INITIAL_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl_invitation_vip',
    name: '🌟 Official VIP Event Invitation & RSVP',
    category: 'invitation',
    bodyText: `Hello *{{guest_name}}*! 🎟️✨\n\nYou are cordially invited to *{{event_title}}*.\n\n📅 *Date:* {{date}} at {{time}}\n📍 *Venue:* {{venue}}\n🎟️ *Ticket Tier:* {{ticket_tier}}\n🪑 *Table Assignment:* {{table_number}}\n\nPlease confirm your attendance by clicking your unique RSVP link below to claim your personalized QR entry pass:\n👉 {{rsvp_link}}\n\nWe look forward to welcoming you!`,
    footerText: 'TMB Events Automated VIP Gateway',
    includeQrButton: true,
    quickReplyOptions: ['Attending ✅', 'Can\'t make it ❌', 'Need directions 🗺️'],
  },
  {
    id: 'tpl_qr_pass',
    name: '📲 Instant QR Entry Ticket Pass',
    category: 'qr_pass',
    bodyText: `Hi *{{guest_name}}*! Here is your official entry pass for *{{event_title}}*.\n\n🎫 *Ticket Code:* \`{{ticket_code}}\`\n📍 *Location:* {{venue}}\n⏰ *Doors Open:* {{time}}\n\nPresent this digital QR badge at the registration desk for instant express check-in:\n👉 {{qr_pass_url}}\n\nSee you there!`,
    footerText: 'Show this code at the door for scanning',
    includeQrButton: true,
  },
  {
    id: 'tpl_reminder_24h',
    name: '⏰ 24-Hour Event Reminder',
    category: 'reminder',
    bodyText: `Friendly reminder, *{{guest_name}}*! ⏳\n\n*{{event_title}}* is happening tomorrow at *{{time}}*!\n\n📍 *Venue:* {{venue}}\n🚗 *Parking:* Complimentary valet available at Main Entrance.\n👔 *Dress Code:* {{dress_code}}\n\nView your live schedule & digital ticket here:\n👉 {{qr_pass_url}}`,
    footerText: 'Need help? Reply to this message directly.',
    includeQrButton: false,
    quickReplyOptions: ['Got it! 👍', 'View Agenda 📋'],
  },
  {
    id: 'tpl_day_of_update',
    name: '🚀 Day-of-Event Welcome & Express Check-In',
    category: 'update',
    bodyText: `Today is the day, *{{guest_name}}*! 🎉\n\nRegistration for *{{event_title}}* opens in 2 hours at *{{venue}}*.\n\n⚡ Have your digital QR pass ready on your screen for fast door scanning:\n👉 {{qr_pass_url}}\n\nEnjoy the event!`,
    footerText: 'TMB Events Live Concierge',
    includeQrButton: true,
  },
  {
    id: 'tpl_thank_you',
    name: '💝 Post-Event Thank You & Gallery',
    category: 'thank_you',
    bodyText: `Thank you for attending *{{event_title}}*, *{{guest_name}}*! 🎊\n\nWe hope you had a fantastic time. High-resolution photos, keynote slides, and presentation decks are now live:\n👉 {{qr_pass_url}}\n\nWe'd love to hear your feedback!`,
    footerText: 'Thank you for being part of our community',
    includeQrButton: false,
  }
];

// Clean slate: 0 demo events, 0 demo guests, 0 demo logs
export const INITIAL_EVENTS: EventItem[] = [];
export const INITIAL_GUESTS: Guest[] = [];
export const INITIAL_WHATSAPP_LOGS: WhatsAppMessageLog[] = [];
