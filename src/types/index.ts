export type LocationType = 'venue' | 'online' | 'hybrid';

export type EventCategory = 
  | 'Technology & AI'
  | 'Music & Concerts'
  | 'Business & Networking'
  | 'Gala & Dinners'
  | 'Workshops & Education'
  | 'Sports & Wellness'
  | 'Festivals & Arts';

export interface TicketTier {
  id: string;
  name: string;
  price: number; // 0 for free
  capacity: number;
  sold: number;
  description: string;
  perks: string[];
}

export interface EventSpeaker {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
}

export interface EventAgendaItem {
  time: string;
  title: string;
  speaker?: string;
  description?: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: EventCategory;
  tags: string[];
  bannerUrl: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  endDate: string;
  endTime: string;
  locationType: LocationType;
  venueName: string;
  address: string;
  city: string;
  virtualLink?: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  organizerAvatar: string;
  ticketTiers: TicketTier[];
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  featured: boolean;
  totalCapacity: number;
  dressCode?: string;
  speakers?: EventSpeaker[];
  agenda?: EventAgendaItem[];
}

export type RSVPStatus = 
  | 'pending'
  | 'invited'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'attending'
  | 'declined'
  | 'checked_in';

export type WhatsAppDeliveryStatus = 
  | 'none'
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string; // e.g. +1234567890
  ticketTierId: string;
  ticketTierName: string;
  rsvpStatus: RSVPStatus;
  plusGuests: number;
  dietaryRequirements?: string;
  notes?: string;
  inviteCode: string;
  qrCodeData: string;
  tableNumber?: string;
  vip: boolean;
  invitationSentAt?: string;
  rsvpRespondedAt?: string;
  checkInTimestamp?: string;
  whatsappDeliveryStatus: WhatsAppDeliveryStatus;
  whatsappError?: string;
  reminderSentCount: number;
  customMessageVars?: Record<string, string>;
}

export type WhatsAppProvider = 
  | 'whatsapp_cloud_api'
  | 'twilio'
  | 'ultramsg'
  | 'evolution_api'
  | 'custom_gateway'
  | 'simulator';

export interface WhatsAppConfig {
  provider: WhatsAppProvider;
  apiUrl: string;
  apiToken: string;
  phoneNumberId?: string; // Meta WhatsApp Cloud API Phone Number ID
  wabaId?: string; // Meta WhatsApp Business Account ID
  accountSid?: string; // Twilio Account SID
  instanceId?: string; // UltraMsg or Evolution API Instance ID
  senderPhoneNumber: string;
  senderName: string;
  webhookSecret: string;
  rateLimitPerMinute: number;
  autoRetryOnFail: boolean;
  autoRemindersEnabled: boolean;
  reminderHoursBefore: number[]; // e.g. [48, 24, 2]
  statusSimulationSpeed: 'fast' | 'realistic' | 'instant';
  isConnected: boolean;
  lastTestedAt?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'invitation' | 'reminder' | 'qr_pass' | 'update' | 'thank_you';
  bodyText: string;
  headerMediaUrl?: string;
  footerText?: string;
  includeQrButton: boolean;
  quickReplyOptions?: string[];
}

export interface WhatsAppMessageLog {
  id: string;
  guestId: string;
  guestName: string;
  phone: string;
  eventId: string;
  eventTitle: string;
  templateCategory: string;
  messageContent: string;
  status: WhatsAppDeliveryStatus;
  timestamp: string;
  deliveredAt?: string;
  readAt?: string;
  responseCode?: number;
  responseBody?: string;
  error?: string;
}

export interface TicketBooking {
  id: string;
  orderNumber: string;
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  bookingDate: string;
  items: {
    tierId: string;
    tierName: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  paymentStatus: 'paid' | 'free';
  tickets: {
    ticketCode: string;
    guestName: string;
    tierName: string;
    qrData: string;
  }[];
}

export interface InvitationDesign {
  themeColor: string;
  fontStyle: 'modern' | 'elegant' | 'playful' | 'minimal';
  cardBackground: string;
  showCoverImage: boolean;
  customGreeting: string;
  instructions: string;
  showDressCode: boolean;
  showAgenda: boolean;
}

export type UserRole = 'organizer' | 'attendee' | 'vip_manager' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  company?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  bio?: string;
  notificationPreferences?: {
    emailUpdates: boolean;
    whatsappAlerts: boolean;
    smsReceipts: boolean;
  };
}

