import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  Share2, 
  Check, 
  Sparkles
} from 'lucide-react';
import { EventItem, TicketTier } from '../types';
import { getGoogleCalendarUrl, downloadIcsFile } from '../services/calendarService';

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  onProceedToCheckout: (event: EventItem, selectedTiers: { tier: TicketTier; quantity: number }[]) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onProceedToCheckout,
}) => {
  if (!event) return null;

  const [tierQuantities, setTierQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    event.ticketTiers.forEach((tier, idx) => {
      initial[tier.id] = idx === 0 ? 1 : 0;
    });
    return initial;
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'agenda' | 'speakers'>('overview');

  const totalTickets = Object.values(tierQuantities).reduce((a: number, b: number) => a + b, 0);
  const totalAmount = event.ticketTiers.reduce((acc, tier) => {
    return acc + (tierQuantities[tier.id] || 0) * tier.price;
  }, 0);

  const updateQuantity = (tierId: string, delta: number) => {
    setTierQuantities((prev) => {
      const current = prev[tierId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [tierId]: next };
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCheckout = () => {
    if (totalTickets === 0) return;
    const selected = event.ticketTiers
      .filter((tier) => (tierQuantities[tier.id] || 0) > 0)
      .map((tier) => ({ tier, quantity: tierQuantities[tier.id] }));
    onProceedToCheckout(event, selected);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative bg-[#111111] w-full max-w-4xl rounded-3xl shadow-2xl border border-[#2A2A2A] overflow-hidden flex flex-col max-h-[92vh] text-[#E0E0E0]">
        {/* Modal Header / Banner */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#0A0A0A] flex-shrink-0">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black text-[#E0E0E0] hover:text-white backdrop-blur-md border border-[#333333] transition-colors cursor-pointer z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top category & share */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#181818]/90 text-[#D4AF37] text-xs font-mono font-bold backdrop-blur-md border border-[#D4AF37]/40">
              {event.category}
            </span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-[#AAAAAA] hover:text-white text-xs font-medium backdrop-blur-md border border-[#333333] transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>

          {/* Banner bottom title */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
              {event.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#AAAAAA] mt-1 line-clamp-1 font-light">
              {event.tagline}
            </p>
          </div>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex items-center gap-4 px-6 border-b border-[#222222] bg-[#0E0E0E] flex-shrink-0 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#888888] hover:text-[#E0E0E0]'
            }`}
          >
            Event Details
          </button>
          {event.agenda && event.agenda.length > 0 && (
            <button
              onClick={() => setActiveTab('agenda')}
              className={`py-3.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'agenda'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#888888] hover:text-[#E0E0E0]'
              }`}
            >
              Schedule & Agenda ({event.agenda.length})
            </button>
          )}
          {event.speakers && event.speakers.length > 0 && (
            <button
              onClick={() => setActiveTab('speakers')}
              className={`py-3.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'speakers'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#888888] hover:text-[#E0E0E0]'
              }`}
            >
              Featured Speakers ({event.speakers.length})
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1 bg-[#111111]">
          {/* Quick Key Facts Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#161616] rounded-2xl border border-[#262626]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#222222] border border-[#333333] flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-mono text-[#777777]">Date & Time</p>
                <p className="text-xs font-bold text-white">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  • {event.time}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#222222] border border-[#333333] flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase font-mono text-[#777777]">Location</p>
                <p className="text-xs font-bold text-white truncate" title={`${event.venueName}, ${event.city}`}>
                  {event.locationType === 'online' ? 'Online Virtual Stream' : `${event.venueName}`}
                </p>
                <p className="text-[10px] text-[#888888] truncate">{event.city}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#222222] border border-[#333333] flex items-center justify-center flex-shrink-0 text-[#4ADE80]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-mono text-[#777777]">Organizer</p>
                <p className="text-xs font-bold text-white">{event.organizerName}</p>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-serif font-bold text-white mb-2">About This Event</h4>
                <p className="text-sm text-[#AAAAAA] leading-relaxed whitespace-pre-line font-light">
                  {event.description}
                </p>
              </div>

              {event.dressCode && (
                <div className="flex items-center gap-2 p-3 bg-[#1C180B] rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] text-xs">
                  <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <span>
                    <strong>Dress Code / Etiquette:</strong> {event.dressCode}
                  </span>
                </div>
              )}

              {/* Add to calendar quick action */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-[#777777] font-mono">Sync to Calendar:</span>
                <a
                  href={getGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222222] text-[#CCCCCC] text-xs font-semibold border border-[#2E2E2E] flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Google Calendar</span>
                </a>
                <button
                  onClick={() => downloadIcsFile(event)}
                  className="px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222222] text-[#CCCCCC] text-xs font-semibold border border-[#2E2E2E] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#AAAAAA]" />
                  <span>Apple / Outlook (.ics)</span>
                </button>
              </div>

              {/* Select Ticket Tier Section */}
              <div className="space-y-4 pt-4 border-t border-[#222222]">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-[#D4AF37]" />
                    <span>Select Ticket Tiers</span>
                  </h4>
                  <span className="text-xs font-mono text-[#888888]">QR digital passes issued immediately</span>
                </div>

                <div className="space-y-3">
                  {event.ticketTiers.map((tier) => {
                    const qty = tierQuantities[tier.id] || 0;
                    const isSoldOut = tier.sold >= tier.capacity;

                    return (
                      <div
                        key={tier.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          qty > 0
                            ? 'border-[#D4AF37] bg-[#191811] shadow-lg shadow-black/40'
                            : 'border-[#262626] bg-[#141414] hover:border-[#333333]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1 max-w-lg">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{tier.name}</span>
                              <span className="text-xs font-serif font-bold text-[#D4AF37]">
                                {tier.price === 0 ? 'Free' : `$${tier.price}`}
                              </span>
                              {isSoldOut && (
                                <span className="px-2 py-0.5 rounded bg-[#2B1B1B] text-[#EF4444] text-[10px] font-mono font-bold border border-[#EF4444]/30">
                                  Sold Out
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#888888]">{tier.description}</p>
                            
                            {/* Perks pills */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {tier.perks.map((perk) => (
                                <span
                                  key={perk}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1B1B1B] border border-[#2E2E2E] text-[10px] font-medium text-[#CCCCCC]"
                                >
                                  <Check className="w-3 h-3 text-[#D4AF37]" />
                                  <span>{perk}</span>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Counter controls */}
                          <div className="flex items-center self-end sm:self-center gap-3">
                            <button
                              disabled={qty <= 0 || isSoldOut}
                              onClick={() => updateQuantity(tier.id, -1)}
                              className="w-8 h-8 rounded-lg border border-[#333333] bg-[#1A1A1A] flex items-center justify-center font-bold text-white hover:bg-[#252525] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-sm text-white">{qty}</span>
                            <button
                              disabled={isSoldOut}
                              onClick={() => updateQuantity(tier.id, 1)}
                              className="w-8 h-8 rounded-lg border border-[#333333] bg-[#1A1A1A] flex items-center justify-center font-bold text-white hover:bg-[#252525] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE & AGENDA */}
          {activeTab === 'agenda' && event.agenda && (
            <div className="space-y-4">
              <h4 className="text-base font-serif font-bold text-white">Event Itinerary & Timeline</h4>
              <div className="relative pl-6 border-l-2 border-[#D4AF37]/30 space-y-6">
                {event.agenda.map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#D4AF37] ring-4 ring-[#111111]" />
                    <div className="bg-[#161616] p-4 rounded-xl border border-[#262626]">
                      <span className="text-xs font-mono font-bold text-[#D4AF37]">{item.time}</span>
                      <h5 className="font-bold text-white text-sm mt-0.5">{item.title}</h5>
                      {item.speaker && (
                        <p className="text-xs font-medium text-[#AA8B2E] mt-1">Speaker: {item.speaker}</p>
                      )}
                      {item.description && (
                        <p className="text-xs text-[#888888] mt-1 font-light">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SPEAKERS */}
          {activeTab === 'speakers' && event.speakers && (
            <div className="space-y-4">
              <h4 className="text-base font-serif font-bold text-white">Keynote & Panel Guests</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.speakers.map((speaker) => (
                  <div
                    key={speaker.id}
                    className="p-4 rounded-2xl border border-[#262626] bg-[#161616] flex items-center gap-3.5"
                  >
                    <img
                      src={speaker.avatar}
                      alt={speaker.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37]/40 shadow-sm"
                    />
                    <div>
                      <h5 className="font-bold text-white text-sm">{speaker.name}</h5>
                      <p className="text-xs text-[#D4AF37] font-semibold">{speaker.role}</p>
                      <p className="text-[11px] text-[#888888]">{speaker.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky Footer / Checkout Bar */}
        <div className="p-4 sm:p-6 bg-[#0D0D0D] text-white border-t border-[#222222] flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            <span className="text-[11px] text-[#777777] uppercase font-mono">
              {totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'} selected
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#D4AF37]">
              {totalAmount === 0 ? 'Free Pass' : `$${totalAmount.toLocaleString()}`}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-[#AAAAAA] hover:text-white text-xs font-bold border border-[#2E2E2E] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={totalTickets === 0}
              onClick={handleCheckout}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] hover:from-[#E5C158] hover:to-[#BFA03B] text-black text-xs sm:text-sm font-bold shadow-lg shadow-[#D4AF37]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-black" />
              <span>Checkout ({totalTickets})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
