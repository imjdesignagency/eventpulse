import React from 'react';
import { 
  CheckCircle2, 
  QrCode, 
  Send, 
  Sparkles,
  ArrowUpRight,
  MessageSquare,
  Ticket,
  PlusCircle,
  Calendar
} from 'lucide-react';
import { EventItem, Guest, WhatsAppMessageLog, WhatsAppConfig } from '../../types';

interface DashboardOverviewProps {
  activeEvent?: EventItem;
  guests: Guest[];
  whatsappLogs: WhatsAppMessageLog[];
  whatsappConfig: WhatsAppConfig;
  onNavigateSubTab: (subTab: 'guests' | 'whatsapp' | 'designer' | 'scanner') => void;
  onOpenScanner: () => void;
  onOpenWhatsAppBlast: () => void;
  onOpenCreateEvent?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  activeEvent,
  guests,
  whatsappLogs,
  whatsappConfig,
  onNavigateSubTab,
  onOpenScanner,
  onOpenWhatsAppBlast,
  onOpenCreateEvent,
}) => {
  if (!activeEvent) {
    return (
      <div className="bg-[#111111] rounded-3xl p-8 sm:p-12 border border-[#222222] shadow-2xl text-center space-y-6 max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-3xl bg-[#1D1B13] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mx-auto shadow-lg shadow-[#D4AF37]/10">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-white">No Active Events Yet</h2>
          <p className="text-sm text-[#888888] font-light max-w-md mx-auto leading-relaxed">
            All demo events have been cleared. Create your first real event to manage guest lists, issue VIP QR passes, and dispatch automated WhatsApp RSVP messages.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onOpenCreateEvent && (
            <button
              onClick={onOpenCreateEvent}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 hover:scale-105 transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Your First Event</span>
            </button>
          )}
          <button
            onClick={() => onNavigateSubTab('whatsapp')}
            className="px-5 py-3 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-[#D4AF37] border border-[#D4AF37]/30 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Configure WhatsApp API</span>
          </button>
        </div>
      </div>
    );
  }

  const eventGuests = guests.filter((g) => g.eventId === activeEvent.id);
  const totalInvited = eventGuests.length;
  const attendingGuests = eventGuests.filter((g) => g.rsvpStatus === 'attending' || g.rsvpStatus === 'checked_in');
  const checkedInGuests = eventGuests.filter((g) => g.rsvpStatus === 'checked_in');
  const pendingGuests = eventGuests.filter((g) => g.rsvpStatus === 'pending' || g.rsvpStatus === 'invited');
  const declinedGuests = eventGuests.filter((g) => g.rsvpStatus === 'declined');

  const totalPlusGuests = attendingGuests.reduce((a, b) => a + (b.plusGuests || 0), 0);
  const totalAttendeesExpected = attendingGuests.length + totalPlusGuests;

  const deliveredLogs = whatsappLogs.filter(
    (l) => l.eventId === activeEvent.id && (l.status === 'delivered' || l.status === 'read')
  );
  const readLogs = whatsappLogs.filter(
    (l) => l.eventId === activeEvent.id && l.status === 'read'
  );
  const totalSentLogs = whatsappLogs.filter((l) => l.eventId === activeEvent.id);
  const deliveryRate = totalSentLogs.length > 0 
    ? Math.round((deliveredLogs.length / totalSentLogs.length) * 100) 
    : 100;

  const totalRevenue = activeEvent.ticketTiers.reduce((acc, tier) => acc + tier.sold * tier.price, 0);

  return (
    <div className="space-y-8 text-[#E0E0E0]">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-[#141414] via-[#111111] to-[#0A0A0A] rounded-3xl p-6 sm:p-8 text-white border border-[#2A2A2A] shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D1B12] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Management Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {activeEvent.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#888888] font-light">
            {new Date(activeEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} • {activeEvent.time} • {activeEvent.venueName}, {activeEvent.city}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenWhatsAppBlast}
            className="px-4 py-2.5 rounded-xl bg-[#102418] hover:bg-[#153020] text-[#4ADE80] border border-[#1E4D30] text-xs sm:text-sm font-bold shadow-lg shadow-black/40 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>WhatsApp Bulk Blast</span>
          </button>

          <button
            onClick={onOpenScanner}
            className="px-4 py-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] text-[#E0E0E0] border border-[#333333] text-xs sm:text-sm font-bold shadow-lg shadow-black/40 flex items-center gap-2 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#D4AF37]" />
            <span>Door QR Scanner</span>
          </button>

          <button
            onClick={() => onNavigateSubTab('designer')}
            className="px-4 py-2.5 rounded-xl bg-[#1F1F1F] hover:bg-[#282828] text-[#D4AF37] text-xs sm:text-sm font-semibold border border-[#D4AF37]/30 transition-colors cursor-pointer"
          >
            Pass Designer
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: RSVPs Confirmed */}
        <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222] shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#888888] uppercase tracking-wider">RSVP Confirmed</span>
            <div className="w-9 h-9 rounded-xl bg-[#102418] border border-[#1E4D30] text-[#4ADE80] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-white">{attendingGuests.length}</span>
            <span className="text-xs text-[#888888]">
              (+{totalPlusGuests} +1s = {totalAttendeesExpected})
            </span>
          </div>
          <div className="text-xs text-[#777777] flex items-center gap-1.5 font-mono">
            <span className="font-semibold text-[#4ADE80]">
              {totalInvited > 0 ? Math.round((attendingGuests.length / totalInvited) * 100) : 0}%
            </span>
            <span>acceptance rate</span>
          </div>
        </div>

        {/* Metric 2: Live Door Check-Ins */}
        <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222] shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#888888] uppercase tracking-wider">Checked-In At Door</span>
            <div className="w-9 h-9 rounded-xl bg-[#1D1B13] border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-white">{checkedInGuests.length}</span>
            <span className="text-xs text-[#888888]">/ {totalAttendeesExpected || totalInvited} expected</span>
          </div>
          <div className="text-xs text-[#777777] flex items-center gap-1.5 font-mono">
            <span className="font-semibold text-[#D4AF37]">
              {attendingGuests.length > 0 ? Math.round((checkedInGuests.length / attendingGuests.length) * 100) : 0}%
            </span>
            <span>on-site attendance</span>
          </div>
        </div>

        {/* Metric 3: WhatsApp Delivery Rate */}
        <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222] shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#888888] uppercase tracking-wider">WhatsApp Delivery</span>
            <div className="w-9 h-9 rounded-xl bg-[#0F222F] border border-[#1B435C] text-[#53BDEB] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-white">{deliveryRate}%</span>
            <span className="text-xs text-[#888888]">({readLogs.length} read)</span>
          </div>
          <div className="text-xs text-[#777777] flex items-center gap-1.5 font-mono">
            <span className="font-semibold text-[#53BDEB]">{totalSentLogs.length} messages</span>
            <span>logged</span>
          </div>
        </div>

        {/* Metric 4: Ticket Revenue */}
        <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222] shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#888888] uppercase tracking-wider">Gross Ticket Sales</span>
            <div className="w-9 h-9 rounded-xl bg-[#261E0A] border border-[#6B5014] text-[#EAB308] flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#D4AF37]">
              ${totalRevenue.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-[#777777] flex items-center gap-1.5 font-mono">
            <span className="font-semibold text-white">
              {activeEvent.ticketTiers.reduce((a, b) => a + b.sold, 0)} passes
            </span>
            <span>sold</span>
          </div>
        </div>
      </div>
    </div>
  );
};
