import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  MapPin, 
  Sparkles, 
  QrCode, 
  MessageSquare, 
  ArrowLeft
} from 'lucide-react';
import { Guest, EventItem } from '../types';
import { QRCodeDisplay } from './QRCodeDisplay';
import { getGoogleCalendarUrl, downloadIcsFile } from '../services/calendarService';
import { generateWhatsAppUrl } from '../services/whatsappService';

interface GuestRSVPViewProps {
  guest: Guest;
  event: EventItem;
  onUpdateRSVP: (guestId: string, status: 'attending' | 'declined', plusGuests: number, dietary?: string) => void;
  onBackToExplore: () => void;
}

export const GuestRSVPView: React.FC<GuestRSVPViewProps> = ({
  guest,
  event,
  onUpdateRSVP,
  onBackToExplore,
}) => {
  const [selectedResponse, setSelectedResponse] = useState<'attending' | 'declined' | null>(
    guest.rsvpStatus === 'attending' || guest.rsvpStatus === 'checked_in'
      ? 'attending'
      : guest.rsvpStatus === 'declined'
      ? 'declined'
      : null
  );

  const [plusCount, setPlusCount] = useState(guest.plusGuests || 0);
  const [dietaryNotes, setDietaryNotes] = useState(guest.dietaryRequirements || '');

  const handleConfirmRSVP = (status: 'attending' | 'declined') => {
    setSelectedResponse(status);
    onUpdateRSVP(guest.id, status, status === 'attending' ? plusCount : 0, dietaryNotes);

    if (status === 'attending') {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#AA8B2E', '#4ADE80', '#FFFFFF'],
        });
      } catch {
        // Confetti fallback
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-3 sm:px-6 space-y-6 animate-fadeIn pb-16">
      {/* Top back button */}
      <button
        onClick={onBackToExplore}
        className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#888888] hover:text-[#D4AF37] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Marketplace</span>
      </button>

      {/* Main Invitation Card */}
      <div className="bg-[#111111] text-[#E0E0E0] rounded-3xl border border-[#2A2A2A] shadow-2xl overflow-hidden">
        {/* Banner */}
        <div className="relative aspect-video sm:aspect-[21/9] w-full overflow-hidden bg-[#0A0A0A]">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full bg-[#181818]/90 backdrop-blur-md text-[#D4AF37] font-mono text-xs font-bold shadow-md border border-[#D4AF37]/40">
              {event.category}
            </span>
          </div>

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#D4AF37]">
              Personal Invitation
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold leading-tight text-white mt-0.5">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Invitation Welcome Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-[#111111]">
          {/* Personalized Salutation */}
          <div className="p-4 bg-[#191811] rounded-2xl border border-[#D4AF37]/30 space-y-1">
            <div className="flex items-center gap-2 text-[#D4AF37] font-serif font-bold text-base">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Dear {guest.name},</span>
            </div>
            <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed font-light">
              You are cordially invited to join us as our honored guest for this premier gathering. Please confirm your RSVP below to unlock your digital QR entry pass.
            </p>
          </div>

          {/* Key Facts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-[#161616] rounded-2xl border border-[#262626] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#222222] text-[#D4AF37] border border-[#333333] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#777777]">Date & Time</span>
                <p className="font-bold text-white">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  • {event.time}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#161616] rounded-2xl border border-[#262626] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#222222] text-[#D4AF37] border border-[#333333] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-mono text-[#777777]">Location</span>
                <p className="font-bold text-white truncate" title={`${event.venueName}, ${event.city}`}>
                  {event.locationType === 'online' ? 'Virtual Stream' : event.venueName}
                </p>
                <p className="text-[10px] text-[#888888] truncate">{event.city}</p>
              </div>
            </div>
          </div>

          {event.dressCode && (
            <div className="p-3 bg-[#1C180B] rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span>
                <strong>Attire / Dress Code:</strong> {event.dressCode}
              </span>
            </div>
          )}

          {/* RSVP Selection Box */}
          <div className="space-y-4 pt-4 border-t border-[#222222]">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#888888]">
              Will you be attending?
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleConfirmRSVP('attending')}
                className={`p-4 rounded-2xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  selectedResponse === 'attending'
                    ? 'border-[#4ADE80] bg-[#102418] text-[#4ADE80] shadow-lg shadow-black/40 ring-1 ring-[#4ADE80]/30'
                    : 'border-[#2A2A2A] hover:border-[#3A3A3A] text-[#CCCCCC] bg-[#161616]'
                }`}
              >
                <CheckCircle className={`w-6 h-6 ${selectedResponse === 'attending' ? 'text-[#4ADE80]' : 'text-[#666666]'}`} />
                <span>Yes, I will attend 🎉</span>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmRSVP('declined')}
                className={`p-4 rounded-2xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  selectedResponse === 'declined'
                    ? 'border-[#EF4444] bg-[#2B1717] text-[#F87171] shadow-lg shadow-black/40 ring-1 ring-[#EF4444]/30'
                    : 'border-[#2A2A2A] hover:border-[#3A3A3A] text-[#CCCCCC] bg-[#161616]'
                }`}
              >
                <XCircle className={`w-6 h-6 ${selectedResponse === 'declined' ? 'text-[#EF4444]' : 'text-[#666666]'}`} />
                <span>Can't make it 😔</span>
              </button>
            </div>

            {/* Additional guest details if attending */}
            {selectedResponse === 'attending' && (
              <div className="p-4 bg-[#161616] rounded-2xl border border-[#262626] space-y-4 animate-fadeIn text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#CCCCCC]">Bringing a Plus-One Guest?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(0, plusCount - 1);
                        setPlusCount(next);
                        onUpdateRSVP(guest.id, 'attending', next, dietaryNotes);
                      }}
                      className="w-7 h-7 rounded-lg border border-[#333333] bg-[#1A1A1A] text-white font-bold flex items-center justify-center cursor-pointer hover:bg-[#252525]"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-mono font-bold text-white">{plusCount}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.min(3, plusCount + 1);
                        setPlusCount(next);
                        onUpdateRSVP(guest.id, 'attending', next, dietaryNotes);
                      }}
                      className="w-7 h-7 rounded-lg border border-[#333333] bg-[#1A1A1A] text-white font-bold flex items-center justify-center cursor-pointer hover:bg-[#252525]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#CCCCCC] mb-1">
                    Dietary Requirements / Allergies (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vegetarian, Gluten-Free, Nut allergy"
                    value={dietaryNotes}
                    onChange={(e) => {
                      setDietaryNotes(e.target.value);
                      onUpdateRSVP(guest.id, 'attending', plusCount, e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-[#1A1A1A] rounded-xl border border-[#2E2E2E] text-white text-xs placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* UNLOCKED DIGITAL QR PASS (Only when attending) */}
          {selectedResponse === 'attending' && (
            <div className="pt-6 border-t border-[#222222] space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#D4AF37]" />
                  <span>Your Official Digital QR Entry Pass</span>
                </h4>
                <span className="px-2.5 py-0.5 rounded bg-[#102418] text-[#4ADE80] font-mono font-bold text-[10px] uppercase border border-[#1E4D30]">
                  Confirmed
                </span>
              </div>

              <div className="bg-[#141414] rounded-3xl p-6 text-white border border-[#2E2E2E] shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-[#D4AF37]">
                      {guest.ticketTierName}
                    </span>
                    <h5 className="font-serif font-bold text-white text-base mt-0.5">{guest.name}</h5>
                  </div>
                  {guest.tableNumber && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-[#777777] font-mono">Table</span>
                      <p className="font-bold text-sm text-[#D4AF37]">{guest.tableNumber}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center my-6">
                  <QRCodeDisplay
                    data={guest.qrCodeData}
                    label={guest.inviteCode}
                    sublabel="Show code on arrival at registration"
                    size={180}
                    downloadFilename={`ticket-${guest.inviteCode}.png`}
                  />
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-[#262626] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <a
                    href={generateWhatsAppUrl(
                      guest.phone,
                      `Here is my confirmed RSVP pass for *${event.title}*!\n\n🎫 Code: \`${guest.inviteCode}\`\n📍 Venue: ${event.venueName}, ${event.city}\n\nView Pass: ${window.location.origin}/#ticket/${guest.inviteCode}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-[#102418] hover:bg-[#153020] text-[#4ADE80] border border-[#1E4D30] rounded-xl font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Pass Link</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadIcsFile(event)}
                      className="px-3 py-2 bg-[#1A1A1A] hover:bg-[#252525] text-[#CCCCCC] border border-[#2E2E2E] rounded-xl font-semibold transition-colors cursor-pointer"
                    >
                      Calendar (.ics)
                    </button>
                    <a
                      href={getGoogleCalendarUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-[#1A1A1A] hover:bg-[#252525] text-[#CCCCCC] border border-[#2E2E2E] rounded-xl font-semibold transition-colors"
                    >
                      Google Cal
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
