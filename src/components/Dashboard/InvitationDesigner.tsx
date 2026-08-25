import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Check, 
  Copy, 
  Eye,
  Sliders
} from 'lucide-react';
import { EventItem, Guest } from '../../types';
import { QRCodeDisplay } from '../QRCodeDisplay';

interface InvitationDesignerProps {
  activeEvent?: EventItem;
  sampleGuest?: Guest;
  onPreviewPublicRSVP: () => void;
}

const THEME_PALETTES = [
  { name: 'Imperial Gold', color: '#D4AF37', bgGradient: 'from-[#0A0A0A] via-[#141414] to-[#1C180B]', border: 'border-[#D4AF37]/40' },
  { name: 'Midnight Onyx', color: '#888888', bgGradient: 'from-[#0A0A0A] via-[#111111] to-[#1A1A1A]', border: 'border-[#333333]' },
  { name: 'Emerald Royale', color: '#4ADE80', bgGradient: 'from-[#0A0A0A] via-[#0E1A12] to-[#122A1C]', border: 'border-[#1E4D30]' },
  { name: 'Crimson Velvet', color: '#F87171', bgGradient: 'from-[#0A0A0A] via-[#1A0E0E] to-[#2B1414]', border: 'border-[#4A2020]' },
  { name: 'Sapphire Night', color: '#60A5FA', bgGradient: 'from-[#0A0A0A] via-[#0D1524] to-[#12223B]', border: 'border-[#1E3A5F]' },
];

export const InvitationDesigner: React.FC<InvitationDesignerProps> = ({
  activeEvent,
  sampleGuest,
  onPreviewPublicRSVP,
}) => {
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [greetingText, setGreetingText] = useState('You are cordially invited to attend');
  const [fontStyle, setFontStyle] = useState<'modern' | 'elegant' | 'minimal'>('elegant');
  const [showDressCode, setShowDressCode] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const fallbackEvent: EventItem = activeEvent || {
    id: 'evt_sample',
    title: 'Your Event Title',
    slug: 'your-event',
    tagline: 'An unforgettable evening',
    description: 'Join us for a special occasion.',
    category: 'Technology & AI',
    tags: ['VIP'],
    bannerUrl: '',
    date: new Date().toISOString().split('T')[0],
    time: '07:00 PM',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '11:00 PM',
    locationType: 'venue',
    venueName: 'The Grand Hall',
    address: '123 Luxury Blvd',
    city: 'Metropolis',
    organizerName: 'Event Organizer',
    organizerEmail: 'host@event.com',
    organizerPhone: '+1 555 0199',
    organizerAvatar: '',
    ticketTiers: [{ id: 'tier_vip', name: 'VIP Executive', price: 100, capacity: 100, sold: 0, description: 'VIP', perks: [] }],
    status: 'published',
    featured: true,
    totalCapacity: 200,
    dressCode: 'Black Tie / Evening Attire',
  };

  const fallbackGuest: Guest = sampleGuest || {
    id: 'gst_preview',
    eventId: fallbackEvent.id,
    name: 'Alexander Sterling',
    email: 'alexander@example.com',
    phone: '+1 415 555 0199',
    ticketTierId: 'tier_vip',
    ticketTierName: 'VIP Executive Pass',
    rsvpStatus: 'attending',
    plusGuests: 1,
    tableNumber: 'Table 1',
    inviteCode: 'EVP-VIP-9988',
    qrCodeData: JSON.stringify({ code: 'EVP-VIP-9988', name: 'Alexander Sterling', event: fallbackEvent.title }),
    vip: true,
    whatsappDeliveryStatus: 'read',
    reminderSentCount: 1,
  };

  const currentPalette = THEME_PALETTES[selectedPaletteIndex];

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/#rsvp/${fallbackGuest.inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 text-[#E0E0E0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <span>Invitation & Digital Pass Designer</span>
          </h2>
          <p className="text-xs text-[#888888] font-light">
            Customize the branded luxury invitation card, typography, and QR pass layout that guests see on mobile & WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPreviewPublicRSVP}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-black" />
            <span>Open Live RSVP Webpage</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Design Controls */}
        <div className="lg:col-span-5 bg-[#111111] p-6 rounded-3xl border border-[#222222] shadow-xl space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#888888] pb-2 border-b border-[#262626]">
            <Sliders className="w-4 h-4 text-[#D4AF37]" />
            <span>Branding & Layout Settings</span>
          </div>

          {/* Color Palette Selector */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-[#CCCCCC]">Theme Color Palette</label>
            <div className="grid grid-cols-5 gap-2">
              {THEME_PALETTES.map((palette, idx) => (
                <button
                  key={palette.name}
                  onClick={() => setSelectedPaletteIndex(idx)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    selectedPaletteIndex === idx
                      ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50 bg-[#1D1B13]'
                      : 'border-[#262626] bg-[#161616] hover:bg-[#1E1E1E]'
                  }`}
                  title={palette.name}
                >
                  <div
                    className="w-6 h-6 rounded-full shadow-sm border border-black/30"
                    style={{ backgroundColor: palette.color }}
                  />
                  <span className="text-[10px] font-mono text-[#AAAAAA] truncate w-full text-center">
                    {palette.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography Style */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-[#CCCCCC]">Typography Mood</label>
            <div className="grid grid-cols-3 gap-2">
              {(['modern', 'elegant', 'minimal'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setFontStyle(style)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                    fontStyle === style
                      ? 'border-[#D4AF37] bg-[#1D1B13] text-[#D4AF37] font-bold'
                      : 'border-[#262626] bg-[#161616] text-[#888888] hover:bg-[#1E1E1E]'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Greeting Text */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#CCCCCC]">Custom Greeting Text</label>
            <input
              type="text"
              value={greetingText}
              onChange={(e) => setGreetingText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white text-xs focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 pt-2 border-t border-[#262626]">
            <label className="flex items-center justify-between text-xs font-semibold text-[#CCCCCC] cursor-pointer">
              <span>Display Dress Code on Invitation</span>
              <input
                type="checkbox"
                checked={showDressCode}
                onChange={(e) => setShowDressCode(e.target.checked)}
                className="rounded border-[#333333] bg-[#181818] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
              />
            </label>
          </div>

            {/* Shareable Link Box */}
          <div className="p-4 bg-[#161616] rounded-2xl border border-[#262626] space-y-2">
            <span className="text-[11px] font-mono font-bold text-[#888888] uppercase tracking-wider">
              Shareable RSVP Public Link
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/#rsvp/${fallbackGuest.inviteCode}`}
                className="w-full bg-[#181818] border border-[#2E2E2E] rounded-xl px-3 py-1.5 text-xs font-mono text-[#D4AF37]"
              />
              <button
                onClick={handleCopyInviteLink}
                className="p-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-white border border-[#333333] transition-colors cursor-pointer"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-[#4ADE80]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile / Invitation Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <span className="text-xs font-mono font-bold text-[#888888] uppercase tracking-wider mb-3">
            Live Preview (How Guest Sees Invitation on Screen)
          </span>

          <div
            className={`w-full max-w-md bg-gradient-to-br ${currentPalette.bgGradient} rounded-3xl p-6 sm:p-8 text-white border ${currentPalette.border} shadow-2xl space-y-6 relative overflow-hidden transition-all duration-300`}
          >
            {/* Top Logo / Host */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4AF37]">
                Official VIP Invitation
              </span>
              <p
                className={`text-xs text-[#CCCCCC] ${
                  fontStyle === 'elegant' ? 'italic font-serif' : fontStyle === 'minimal' ? 'font-mono' : ''
                }`}
              >
                {greetingText}
              </p>
              <h3 className="text-xl font-serif font-bold text-white mt-1">
                {fallbackGuest.name}
              </h3>
            </div>

            {/* Event Banner */}
            <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 shadow-lg bg-[#141414]">
              {fallbackEvent.bannerUrl ? (
                <img
                  src={fallbackEvent.bannerUrl}
                  alt={fallbackEvent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#1E1A11] to-[#141414] text-[#D4AF37] font-serif text-lg font-bold">
                  {fallbackEvent.title}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="px-2 py-0.5 rounded bg-[#1D1B13] border border-[#D4AF37]/40 text-[#D4AF37] font-mono text-[10px] font-bold">
                  {fallbackEvent.category}
                </span>
                <h4 className="font-serif font-bold text-white text-sm mt-1 truncate">
                  {fallbackEvent.title}
                </h4>
              </div>
            </div>

            {/* Event Key Details */}
            <div className="space-y-2 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs text-[#CCCCCC]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span>
                  {new Date(fallbackEvent.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  • {fallbackEvent.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span className="truncate">{fallbackEvent.venueName}, {fallbackEvent.city}</span>
              </div>
              {showDressCode && fallbackEvent.dressCode && (
                <div className="flex items-center gap-2 text-[#D4AF37] text-[11px] pt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dress Code: {fallbackEvent.dressCode}</span>
                </div>
              )}
            </div>

            {/* QR Code Pass Preview */}
            <div className="bg-[#0E0E0E] rounded-2xl p-4 text-white border border-[#2E2E2E] flex flex-col items-center text-center shadow-lg">
              <QRCodeDisplay
                data={fallbackGuest.qrCodeData}
                label={fallbackGuest.inviteCode}
                sublabel={`Tier: ${fallbackGuest.ticketTierName}`}
                size={140}
                showActions={false}
              />
              <p className="text-[10px] text-[#777777] mt-2 font-mono">
                Unique encrypted ticket code for express entrance
              </p>
            </div>

            {/* RSVP Button Mock */}
            <div className="pt-2">
              <button
                onClick={onPreviewPublicRSVP}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] text-black font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Respond to RSVP (Attending / Decline)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
