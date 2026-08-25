import React, { useState } from 'react';
import { 
  Ticket, 
  Search, 
  Calendar, 
  MapPin, 
  QrCode, 
  MessageSquare 
} from 'lucide-react';
import { Guest, EventItem, TicketBooking } from '../types';
import { QRCodeDisplay } from './QRCodeDisplay';
import { generateWhatsAppUrl } from '../services/whatsappService';
import { downloadIcsFile } from '../services/calendarService';

interface MyTicketsViewProps {
  events: EventItem[];
  guests: Guest[];
  bookings: TicketBooking[];
  onOpenBookings: () => void;
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({
  events,
  guests,
  bookings,
  onOpenBookings,
}) => {
  const [lookupQuery, setLookupQuery] = useState('');

  // Find matching passes from guest list or bookings
  const matchedGuests = guests.filter((g) => {
    if (!lookupQuery.trim()) return false;
    const q = lookupQuery.toLowerCase().trim();
    return (
      g.inviteCode.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.phone.includes(q) ||
      g.name.toLowerCase().includes(q)
    );
  });

  const getEventForGuest = (eventId: string) => {
    return events.find((e) => e.id === eventId) || events[0];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 text-[#E0E0E0]">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#1C180B] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center mx-auto shadow-lg">
          <Ticket className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Digital Passes & QR Wallet
        </h2>
        <p className="text-xs sm:text-sm text-[#888888] font-light">
          Enter your registered email, phone number, or pass code (e.g. <code>EVP-TECH-7729A</code>) to retrieve your digital passes.
        </p>

        {/* Search input */}
        <div className="relative max-w-md mx-auto mt-4">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search email, phone (+1...), or pass code..."
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#161616] border border-[#2E2E2E] text-white placeholder-[#555555] text-xs focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        {/* Quick sample buttons for testing */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <span className="text-[11px] text-[#666666] font-mono">Quick Test Lookups:</span>
          {guests.slice(0, 3).map((g) => (
            <button
              key={g.id}
              onClick={() => setLookupQuery(g.inviteCode)}
              className="px-2.5 py-1 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#2E2E2E] text-[11px] font-mono text-[#D4AF37] transition-colors cursor-pointer"
            >
              {g.inviteCode} ({g.name.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-6">
        {matchedGuests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchedGuests.map((guest) => {
              const event = getEventForGuest(guest.eventId);
              return (
                <div
                  key={guest.id}
                  className="bg-[#141414] rounded-3xl p-6 text-white border border-[#2E2E2E] shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-[#1D1B13] border border-[#D4AF37]/40 text-[10px] font-mono font-bold text-[#D4AF37] uppercase">
                        {guest.ticketTierName}
                      </span>
                      <span className="text-[11px] font-mono text-[#AAAAAA] font-bold">
                        {guest.inviteCode}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-lg text-white line-clamp-1">{event.title}</h4>
                    <p className="text-xs text-[#888888] font-light">Attendee: <span className="text-white font-medium">{guest.name}</span></p>

                    <div className="space-y-1 pt-2 text-xs text-[#CCCCCC]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          • {event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="truncate">{event.venueName}, {event.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center bg-[#0D0D0D] p-4 rounded-2xl border border-[#262626]">
                    <QRCodeDisplay
                      data={guest.qrCodeData}
                      label={guest.inviteCode}
                      sublabel="Show at door for check-in"
                      size={150}
                      downloadFilename={`ticket-${guest.inviteCode}.png`}
                    />
                  </div>

                  <div className="pt-2 border-t border-[#262626] flex items-center justify-between gap-2">
                    <a
                      href={generateWhatsAppUrl(
                        guest.phone,
                        `Here is my ticket pass for *${event.title}*!\n\n🎫 Code: \`${guest.inviteCode}\`\n👤 Attendee: ${guest.name}\n📍 Venue: ${event.venueName}, ${event.city}\n\nView Pass: ${window.location.origin}/#ticket/${guest.inviteCode}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#102418] hover:bg-[#153020] text-[#4ADE80] border border-[#1E4D30] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => downloadIcsFile(event)}
                        className="px-2.5 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] text-[#CCCCCC] border border-[#2E2E2E] rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Calendar (.ics)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : lookupQuery.trim() ? (
          <div className="py-12 text-center bg-[#111111] rounded-3xl border border-[#222222] p-6 space-y-2">
            <Ticket className="w-10 h-10 text-[#444444] mx-auto" />
            <h4 className="font-serif font-bold text-white">No Tickets Found</h4>
            <p className="text-xs text-[#888888] max-w-sm mx-auto">
              We couldn't find any tickets matching "{lookupQuery}". Please check your spelling or contact the organizer.
            </p>
          </div>
        ) : (
          /* Initial State: List all sample confirmed passes */
          <div className="bg-[#111111] rounded-3xl border border-[#222222] p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-white text-base">Your Active Passes & Invitations</h3>
              <span className="text-xs font-mono text-[#888888]">Confirmed attendees</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guests.slice(0, 4).map((g) => {
                const ev = getEventForGuest(g.eventId);
                return (
                  <div
                    key={g.id}
                    onClick={() => setLookupQuery(g.inviteCode)}
                    className="p-4 bg-[#161616] rounded-2xl border border-[#262626] hover:border-[#D4AF37]/50 transition-all cursor-pointer shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs truncate">{g.name}</span>
                        {g.vip && <span className="px-1.5 py-0.5 rounded bg-[#1D1B13] border border-[#D4AF37]/40 text-[#D4AF37] text-[9px] font-mono font-bold">VIP</span>}
                      </div>
                      <p className="text-xs text-[#888888] truncate mt-0.5 font-light">{ev.title}</p>
                      <p className="text-[11px] font-mono text-[#D4AF37] font-bold mt-1">
                        Code: {g.inviteCode}
                      </p>
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-[#222222] border border-[#333333] text-[#D4AF37] flex items-center justify-center flex-shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
