import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle, 
  Ticket, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck
} from 'lucide-react';
import { EventItem, TicketTier, TicketBooking, Guest } from '../types';
import { QRCodeDisplay } from './QRCodeDisplay';
import { generateWhatsAppUrl } from '../services/whatsappService';
import { downloadIcsFile, getGoogleCalendarUrl } from '../services/calendarService';

interface CheckoutModalProps {
  event: EventItem;
  selectedTiers: { tier: TicketTier; quantity: number }[];
  onClose: () => void;
  onBookingComplete: (booking: TicketBooking, newGuests: Guest[]) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  event,
  selectedTiers,
  onClose,
  onBookingComplete,
}) => {
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('+1 ');
  const [attendeeNames, setAttendeeNames] = useState<string[]>(() => {
    const names: string[] = [];
    selectedTiers.forEach((st) => {
      for (let i = 0; i < st.quantity; i++) {
        names.push('');
      }
    });
    return names;
  });

  const [dietaryPrefs, setDietaryPrefs] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<TicketBooking | null>(null);
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);

  const totalTickets = selectedTiers.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalAmount = selectedTiers.reduce((acc, curr) => acc + curr.tier.price * curr.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail || !buyerPhone) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const orderNumber = `EVP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const generatedTickets: TicketBooking['tickets'] = [];
      const newGuests: Guest[] = [];

      let attendeeIdx = 0;
      selectedTiers.forEach((st) => {
        for (let i = 0; i < st.quantity; i++) {
          const guestName = attendeeNames[attendeeIdx]?.trim() || (attendeeIdx === 0 ? buyerName : `Guest ${attendeeIdx + 1} of ${buyerName}`);
          const ticketCode = `EVP-${event.slug.slice(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

          const qrPayload = JSON.stringify({
            code: ticketCode,
            name: guestName,
            event: event.title,
            tier: st.tier.name,
            eventId: event.id,
            vip: st.tier.name.toLowerCase().includes('vip'),
            issuedAt: new Date().toISOString(),
          });

          generatedTickets.push({
            ticketCode,
            guestName,
            tierName: st.tier.name,
            qrData: qrPayload,
          });

          newGuests.push({
            id: `gst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            eventId: event.id,
            name: guestName,
            email: attendeeIdx === 0 ? buyerEmail : `attendee_${attendeeIdx}@guest.io`,
            phone: buyerPhone,
            ticketTierId: st.tier.id,
            ticketTierName: st.tier.name,
            rsvpStatus: 'attending',
            plusGuests: 0,
            dietaryRequirements: dietaryPrefs,
            inviteCode: ticketCode,
            qrCodeData: qrPayload,
            vip: st.tier.name.toLowerCase().includes('vip'),
            invitationSentAt: new Date().toISOString(),
            rsvpRespondedAt: new Date().toISOString(),
            whatsappDeliveryStatus: 'none',
            reminderSentCount: 0,
          });

          attendeeIdx++;
        }
      });

      const booking: TicketBooking = {
        id: `book_${Date.now()}`,
        orderNumber,
        eventId: event.id,
        buyerName,
        buyerEmail,
        buyerPhone,
        bookingDate: new Date().toISOString(),
        items: selectedTiers.map((st) => ({
          tierId: st.tier.id,
          tierName: st.tier.name,
          quantity: st.quantity,
          unitPrice: st.tier.price,
        })),
        totalAmount,
        paymentStatus: totalAmount === 0 ? 'free' : 'paid',
        tickets: generatedTickets,
      };

      setConfirmedBooking(booking);
      setIsSubmitting(false);
      onBookingComplete(booking, newGuests);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#AA8B2E', '#4ADE80', '#FFFFFF'],
        });
      } catch {
        // Confetti fallback
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative bg-[#111111] text-[#E0E0E0] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#2A2A2A] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0D0D0D] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C180B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                {confirmedBooking ? '🎉 Pass Issued & Confirmed' : 'Complete Ticket Reservation'}
              </h3>
              <p className="text-xs text-[#888888] truncate max-w-md">{event.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#1A1A1A] hover:bg-[#262626] text-[#AAAAAA] hover:text-white border border-[#2E2E2E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#111111]">
          {!confirmedBooking ? (
            /* STEP 1: CHECKOUT FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Summary Pill */}
              <div className="p-4 bg-[#161616] rounded-2xl border border-[#262626] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#888888] border-b border-[#262626] pb-2">
                  <span>Selected Ticket Tier(s)</span>
                  <span>Subtotal</span>
                </div>
                {selectedTiers.map((st) => (
                  <div key={st.tier.id} className="flex items-center justify-between text-xs text-[#CCCCCC]">
                    <div>
                      <span className="font-semibold text-white">{st.tier.name}</span>
                      <span className="text-[#777777]"> × {st.quantity}</span>
                    </div>
                    <span className="font-serif font-bold text-[#D4AF37]">
                      {st.tier.price === 0 ? 'Free' : `$${st.tier.price * st.quantity}`}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm font-bold text-white pt-2 border-t border-[#262626]">
                  <span>Total Amount Due:</span>
                  <span className="text-[#D4AF37] font-serif font-bold text-base">
                    {totalAmount === 0 ? 'COMPLIMENTARY' : `$${totalAmount.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Primary Contact Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#888888]">
                  Primary Contact Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#CCCCCC] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] text-sm focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#CCCCCC] mb-1">
                      Email Address (For e-Ticket) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] text-sm focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CCCCCC] mb-1">
                    WhatsApp Phone Number (For instant QR pass & reminder delivery) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white font-mono placeholder-[#555555] text-sm focus:border-[#D4AF37] focus:outline-none"
                  />
                  <p className="text-[11px] text-[#777777] mt-1 font-light">
                    Includes country code (e.g. +1, +44, +234, +91) for instant WhatsApp dispatch.
                  </p>
                </div>
              </div>

              {/* Attendee Names (if more than 1 ticket) */}
              {totalTickets > 1 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#888888]">
                    Attendee Names for Badges
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attendeeNames.map((name, idx) => (
                      <div key={idx}>
                        <label className="block text-[11px] text-[#888888] mb-1">
                          Ticket #{idx + 1} Name {idx === 0 ? '(Primary)' : ''}
                        </label>
                        <input
                          type="text"
                          placeholder={idx === 0 ? (buyerName || 'Attendee 1') : `Attendee ${idx + 1}`}
                          value={name}
                          onChange={(e) => {
                            const updated = [...attendeeNames];
                            updated[idx] = e.target.value;
                            setAttendeeNames(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] text-xs focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietary / Special Notes */}
              <div>
                <label className="block text-xs font-medium text-[#CCCCCC] mb-1">
                  Dietary Preferences / Accessibility Requests (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vegetarian, Wheelchair access, Halal, etc."
                  value={dietaryPrefs}
                  onChange={(e) => setDietaryPrefs(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] hover:from-[#E5C158] hover:to-[#BFA03B] text-black font-bold text-sm shadow-xl shadow-[#D4AF37]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Generating Unique QR Passes...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>
                        Confirm & Issue {totalTickets} Digital QR Pass{totalTickets > 1 ? 'es' : ''}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: CONFIRMED BOOKING & DIGITAL PASSES */
            <div className="space-y-6 animate-fadeIn">
              {/* Order Success Banner */}
              <div className="p-4 bg-[#102418] rounded-2xl border border-[#1E4D30] flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#1A3D27] text-[#4ADE80] border border-[#2B633F] flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-sm">
                    Registration Confirmed • Order #{confirmedBooking.orderNumber}
                  </h4>
                  <p className="text-xs text-[#8CE3A8]">
                    Pass delivered to <strong>{confirmedBooking.buyerEmail}</strong>
                  </p>
                </div>
              </div>

              {/* Ticket Switcher (if multiple) */}
              {confirmedBooking.tickets.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {confirmedBooking.tickets.map((t, idx) => (
                    <button
                      key={t.ticketCode}
                      onClick={() => setActiveTicketIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all border ${
                        activeTicketIndex === idx
                          ? 'bg-[#222222] text-[#D4AF37] border-[#D4AF37]/50 shadow-sm'
                          : 'bg-[#181818] text-[#888888] border-[#2A2A2A] hover:bg-[#202020]'
                      }`}
                    >
                      Ticket #{idx + 1} ({t.guestName.split(' ')[0]})
                    </button>
                  ))}
                </div>
              )}

              {/* Digital Luxury Ticket Card */}
              {confirmedBooking.tickets[activeTicketIndex] && (
                <div className="bg-[#141414] rounded-3xl p-6 text-white border border-[#2E2E2E] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#1D1B13] border border-[#D4AF37]/40 text-[11px] font-mono font-bold text-[#D4AF37] uppercase">
                        {confirmedBooking.tickets[activeTicketIndex].tierName}
                      </span>
                      <h4 className="font-serif font-bold text-lg sm:text-xl text-white mt-1">
                        {event.title}
                      </h4>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-[#777777] uppercase font-mono">Attendee Name</p>
                      <p className="font-bold text-sm text-white">
                        {confirmedBooking.tickets[activeTicketIndex].guestName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 my-6 items-center">
                    <div className="sm:col-span-6 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-[#CCCCCC]">
                        <Calendar className="w-4 h-4 text-[#D4AF37]" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          • {event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#CCCCCC]">
                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                        <span>{event.venueName}, {event.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#CCCCCC] font-mono">
                        <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
                        <span>Code: {confirmedBooking.tickets[activeTicketIndex].ticketCode}</span>
                      </div>
                    </div>

                    <div className="sm:col-span-6 flex justify-center">
                      <QRCodeDisplay
                        data={confirmedBooking.tickets[activeTicketIndex].qrData}
                        label={confirmedBooking.tickets[activeTicketIndex].ticketCode}
                        sublabel="Present at door for express check-in"
                        size={170}
                        downloadFilename={`ticket-${confirmedBooking.tickets[activeTicketIndex].ticketCode}.png`}
                      />
                    </div>
                  </div>

                  {/* Actions inside Pass Card */}
                  <div className="pt-4 border-t border-[#262626] flex flex-wrap items-center justify-between gap-3">
                    <a
                      href={generateWhatsAppUrl(
                        confirmedBooking.buyerPhone,
                        `Here is my entry pass for *${event.title}*!\n\n🎫 *Ticket Code:* \`${confirmedBooking.tickets[activeTicketIndex].ticketCode}\`\n👤 *Attendee:* ${confirmedBooking.tickets[activeTicketIndex].guestName}\n📅 *Date:* ${event.date} at ${event.time}\n📍 *Venue:* ${event.venueName}, ${event.city}\n\nView Digital Pass: ${window.location.origin}/#ticket/${confirmedBooking.tickets[activeTicketIndex].ticketCode}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-[#122A1C] hover:bg-[#1A3D28] text-[#4ADE80] border border-[#2B633F] text-xs font-bold flex items-center gap-2 transition-all shadow-md"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Pass to WhatsApp</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadIcsFile(event)}
                        className="px-3 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-[#CCCCCC] text-xs font-medium border border-[#2E2E2E] transition-colors cursor-pointer"
                      >
                        Calendar (.ics)
                      </button>
                      <a
                        href={getGoogleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-[#CCCCCC] text-xs font-medium border border-[#2E2E2E] transition-colors"
                      >
                        Google Cal
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
