import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Download, 
  QrCode, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Check, 
  Trash2, 
  Send, 
  Upload,
  Phone,
  Eye,
  Printer
} from 'lucide-react';
import { Guest, EventItem, RSVPStatus, WhatsAppDeliveryStatus, WhatsAppTemplate, WhatsAppConfig } from '../../types';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { PrintBadgesModal } from './PrintBadgesModal';
import { sendWhatsAppMessage } from '../../services/whatsappService';

interface GuestListManagerProps {
  activeEvent?: EventItem;
  guests: Guest[];
  whatsappConfig: WhatsAppConfig;
  whatsappTemplates: WhatsAppTemplate[];
  onAddGuest: (newGuest: Guest) => void;
  onAddBulkGuests: (newGuests: Guest[]) => void;
  onUpdateGuest: (updatedGuest: Guest) => void;
  onDeleteGuest: (guestId: string) => void;
  onOpenWhatsAppBlast: () => void;
  onPreviewGuestRSVP: (guest: Guest) => void;
}

export const GuestListManager: React.FC<GuestListManagerProps> = ({
  activeEvent,
  guests,
  whatsappConfig,
  whatsappTemplates,
  onAddGuest,
  onAddBulkGuests,
  onUpdateGuest,
  onDeleteGuest,
  onOpenWhatsAppBlast,
  onPreviewGuestRSVP,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RSVPStatus | 'vip'>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | WhatsAppDeliveryStatus>('all');
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  
  // Modals
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showPrintBadgesModal, setShowPrintBadgesModal] = useState(false);
  const [viewingQrGuest, setViewingQrGuest] = useState<Guest | null>(null);
  const [sendingGuestId, setSendingGuestId] = useState<string | null>(null);

  // New Guest Form State
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('+1 ');
  const [newGuestTier, setNewGuestTier] = useState(activeEvent?.ticketTiers[0]?.id || '');
  const [newGuestVip, setNewGuestVip] = useState(false);
  const [newGuestTable, setNewGuestTable] = useState('');
  const [newGuestPlus, setNewGuestPlus] = useState(0);
  const [newGuestNotes, setNewGuestNotes] = useState('');

  // Bulk Import State
  const [bulkCsvText, setBulkCsvText] = useState(
    `Liam Gallagher, +14155550199, liam@oasis.io, VIP, 1\n` +
    `Dr. Maya Lin, +14155558833, maya.lin@design.org, General, 0\n` +
    `Carlos Santos, +34600998877, carlos@madrid.es, General, 0`
  );

  const eventGuests = useMemo(() => {
    if (!activeEvent) return guests;
    return guests.filter((g) => g.eventId === activeEvent.id);
  }, [guests, activeEvent?.id]);

  const filteredGuests = useMemo(() => {
    return eventGuests.filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.phone.includes(searchQuery) ||
        g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.inviteCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'vip'
          ? g.vip
          : g.rsvpStatus === statusFilter;

      const matchesDelivery =
        deliveryFilter === 'all' ? true : g.whatsappDeliveryStatus === deliveryFilter;

      return matchesSearch && matchesStatus && matchesDelivery;
    });
  }, [eventGuests, searchQuery, statusFilter, deliveryFilter]);

  const handleSelectAll = () => {
    if (selectedGuestIds.length === filteredGuests.length) {
      setSelectedGuestIds([]);
    } else {
      setSelectedGuestIds(filteredGuests.map((g) => g.id));
    }
  };

  const toggleSelectGuest = (id: string) => {
    setSelectedGuestIds((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]
    );
  };

  const handleSingleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName || !newGuestPhone || !activeEvent) return;

    const selectedTierObj = activeEvent.ticketTiers.find((t) => t.id === newGuestTier) || activeEvent.ticketTiers[0] || {
      id: 'tier_ga',
      name: 'General Admission',
      price: 0,
      capacity: 100,
      sold: 0,
      description: 'Standard Entry',
      perks: []
    };
    const ticketCode = `EVP-${(activeEvent.slug || 'EVNT').slice(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const qrData = JSON.stringify({
      code: ticketCode,
      name: newGuestName,
      event: activeEvent.title,
      tier: selectedTierObj.name,
      eventId: activeEvent.id,
      vip: newGuestVip,
      table: newGuestTable || undefined,
    });

    const newGuest: Guest = {
      id: `gst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId: activeEvent.id,
      name: newGuestName,
      email: newGuestEmail,
      phone: newGuestPhone,
      ticketTierId: selectedTierObj.id,
      ticketTierName: selectedTierObj.name,
      rsvpStatus: 'pending',
      plusGuests: newGuestPlus,
      notes: newGuestNotes,
      tableNumber: newGuestTable || undefined,
      inviteCode: ticketCode,
      qrCodeData: qrData,
      vip: newGuestVip,
      whatsappDeliveryStatus: 'none',
      reminderSentCount: 0,
    };

    onAddGuest(newGuest);
    setShowAddGuestModal(false);
    // Reset form
    setNewGuestName('');
    setNewGuestEmail('');
    setNewGuestPhone('+1 ');
    setNewGuestNotes('');
    setNewGuestTable('');
  };

  const handleBulkImportSubmit = () => {
    if (!activeEvent) return;
    const lines = bulkCsvText.split('\n').map((l) => l.trim()).filter(Boolean);
    const newGuestsToAdd: Guest[] = [];

    lines.forEach((line) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const name = parts[0];
        const phone = parts[1];
        const email = parts[2] || '';
        const tierNameInput = parts[3] || 'General';
        const plusCount = parseInt(parts[4] || '0', 10) || 0;

        const isVip = tierNameInput.toLowerCase().includes('vip');
        const defaultTier = {
          id: 'tier_ga',
          name: 'General Admission',
          price: 0,
          capacity: 100,
          sold: 0,
          description: 'Standard Entry',
          perks: []
        };
        const matchedTier = activeEvent.ticketTiers.find((t) =>
          isVip ? t.name.toLowerCase().includes('vip') : true
        ) || activeEvent.ticketTiers[0] || defaultTier;

        const ticketCode = `EVP-${(activeEvent.slug || 'EVNT').slice(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const qrData = JSON.stringify({
          code: ticketCode,
          name,
          event: activeEvent.title,
          tier: matchedTier.name,
          eventId: activeEvent.id,
          vip: isVip,
        });

        newGuestsToAdd.push({
          id: `gst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          eventId: activeEvent.id,
          name,
          phone,
          email,
          ticketTierId: matchedTier.id,
          ticketTierName: matchedTier.name,
          rsvpStatus: 'pending',
          plusGuests: plusCount,
          inviteCode: ticketCode,
          qrCodeData: qrData,
          vip: isVip,
          whatsappDeliveryStatus: 'none',
          reminderSentCount: 0,
        });
      }
    });

    if (newGuestsToAdd.length > 0) {
      onAddBulkGuests(newGuestsToAdd);
      setShowBulkImportModal(false);
    }
  };

  const handleQuickSendWhatsApp = async (guest: Guest) => {
    setSendingGuestId(guest.id);
    const template = whatsappTemplates.find((t) => t.category === 'invitation') || whatsappTemplates[0];

    onUpdateGuest({
      ...guest,
      whatsappDeliveryStatus: 'sending',
    });

    await sendWhatsAppMessage(guest, activeEvent, template, whatsappConfig, (status) => {
      onUpdateGuest({
        ...guest,
        whatsappDeliveryStatus: status,
        invitationSentAt: new Date().toISOString(),
      });
    });

    setSendingGuestId(null);
  };

  const handleToggleCheckIn = (guest: Guest) => {
    const isCheckedIn = guest.rsvpStatus === 'checked_in';
    onUpdateGuest({
      ...guest,
      rsvpStatus: isCheckedIn ? 'attending' : 'checked_in',
      checkInTimestamp: isCheckedIn ? undefined : new Date().toISOString(),
    });
  };

  const exportToCsv = () => {
    const headers = ['Name', 'Phone', 'Email', 'Tier', 'RSVP Status', 'VIP', 'Plus Guests', 'Table', 'Ticket Code'];
    const rows = filteredGuests.map((g) => [
      `"${g.name}"`,
      `"${g.phone}"`,
      `"${g.email}"`,
      `"${g.ticketTierName}"`,
      `"${g.rsvpStatus}"`,
      `"${g.vip ? 'Yes' : 'No'}"`,
      g.plusGuests || 0,
      `"${g.tableNumber || ''}"`,
      `"${g.inviteCode}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `guestlist-${activeEvent.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-[#E0E0E0]">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span>Guest List & RSVP Tracking</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1C180B] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold font-mono">
              {eventGuests.length} Total
            </span>
          </h2>
          <p className="text-xs text-[#888888] font-light">
            Manage invitees, monitor WhatsApp delivery states, generate unique QR codes, and check in guests
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddGuestModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#D4AF37]/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>

          <button
            onClick={() => setShowBulkImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#262626] text-[#E0E0E0] border border-[#2E2E2E] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#D4AF37]" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            onClick={() => setShowPrintBadgesModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1E1A11] hover:bg-[#2A2414] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Print printable badges, sheets and placecards"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" />
            <span>Print Badges & Passes</span>
          </button>

          <button
            onClick={exportToCsv}
            className="px-3.5 py-2 rounded-xl bg-[#161616] hover:bg-[#222222] text-[#AAAAAA] hover:text-white border border-[#262626] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-[#888888]" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          <button
            onClick={onOpenWhatsAppBlast}
            className="px-4 py-2 rounded-xl bg-[#102418] hover:bg-[#153020] text-[#4ADE80] border border-[#1E4D30] text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>WhatsApp Campaign</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-[#111111] rounded-2xl border border-[#222222] shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search by name, phone, email, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#161616] rounded-xl border border-[#2E2E2E] text-white text-xs placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {(['all', 'attending', 'checked_in', 'pending', 'declined', 'vip'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                  statusFilter === status
                    ? 'bg-[#1D1B12] text-[#D4AF37] border-[#D4AF37]/50 shadow-sm'
                    : 'bg-[#161616] text-[#888888] border-[#2A2A2A] hover:bg-[#202020]'
                }`}
              >
                {status === 'all'
                  ? 'All'
                  : status === 'checked_in'
                  ? 'Checked-in'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value as any)}
            aria-label="Filter by WhatsApp delivery status"
            className="bg-[#161616] text-[#CCCCCC] text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border border-[#2E2E2E] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#161616]">Any WA Status</option>
            <option value="read" className="bg-[#161616]">Read (Blue Ticks)</option>
            <option value="delivered" className="bg-[#161616]">Delivered</option>
            <option value="sent" className="bg-[#161616]">Sent</option>
            <option value="none" className="bg-[#161616]">Not Sent Yet</option>
            <option value="failed" className="bg-[#161616]">Failed</option>
          </select>
        </div>
      </div>

      {/* Guest List Table */}
      <div className="bg-[#111111] rounded-3xl border border-[#222222] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161616] text-[#888888] font-mono font-bold uppercase tracking-wider border-b border-[#262626]">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedGuestIds.length === filteredGuests.length && filteredGuests.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all guests in the table"
                    className="rounded border-[#333333] bg-[#1A1A1A] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Guest Info</th>
                <th className="py-3.5 px-4">Tier / Table</th>
                <th className="py-3.5 px-4">RSVP Status</th>
                <th className="py-3.5 px-4">WhatsApp Delivery</th>
                <th className="py-3.5 px-4">QR Ticket Code</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#202020] text-[#CCCCCC]">
              {filteredGuests.map((guest) => {
                const isSelected = selectedGuestIds.includes(guest.id);
                const isSendingThis = sendingGuestId === guest.id;

                return (
                  <tr
                    key={guest.id}
                    className={`hover:bg-[#161616] transition-colors ${
                      isSelected ? 'bg-[#1D1B12]/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectGuest(guest.id)}
                        aria-label={`Select guest ${guest.name}`}
                        className="rounded border-[#333333] bg-[#1A1A1A] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                      />
                    </td>

                    {/* Guest Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1F1F1F] border border-[#333333] text-[#D4AF37] font-serif font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {guest.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm">{guest.name}</span>
                            {guest.vip && (
                              <span className="px-1.5 py-0.5 rounded bg-[#1D1B13] border border-[#D4AF37]/40 text-[#D4AF37] font-mono font-bold text-[9px]">
                                VIP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#777777] mt-0.5 font-mono">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#777777]" />
                              {guest.phone}
                            </span>
                            {guest.email && (
                              <span className="hidden sm:inline text-[#777777] truncate max-w-[150px]">
                                • {guest.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tier / Table */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white">{guest.ticketTierName}</span>
                      {guest.tableNumber && (
                        <p className="text-[11px] text-[#D4AF37] font-mono font-medium mt-0.5">
                          Table {guest.tableNumber}
                        </p>
                      )}
                      {guest.plusGuests > 0 && (
                        <p className="text-[10px] text-[#777777]">+{guest.plusGuests} additional guest</p>
                      )}
                    </td>

                    {/* RSVP Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${
                          guest.rsvpStatus === 'attending'
                            ? 'bg-[#102418] text-[#4ADE80] border-[#1E4D30]'
                            : guest.rsvpStatus === 'checked_in'
                            ? 'bg-[#1D1B12] text-[#D4AF37] border-[#D4AF37]/40'
                            : guest.rsvpStatus === 'declined'
                            ? 'bg-[#2B1717] text-[#F87171] border-[#4A2020]'
                            : 'bg-[#1C180B] text-[#D4AF37] border-[#D4AF37]/30'
                        }`}
                      >
                        {guest.rsvpStatus === 'checked_in' && <CheckCircle className="w-3 h-3 text-[#D4AF37]" />}
                        {guest.rsvpStatus === 'attending' && <Check className="w-3 h-3 text-[#4ADE80]" />}
                        {guest.rsvpStatus === 'declined' && <XCircle className="w-3 h-3 text-[#F87171]" />}
                        {guest.rsvpStatus === 'pending' && <Clock className="w-3 h-3 text-[#D4AF37]" />}
                        <span>
                          {guest.rsvpStatus === 'checked_in'
                            ? 'Checked-in'
                            : guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
                        </span>
                      </span>
                      {guest.checkInTimestamp && (
                        <p className="text-[10px] text-[#777777] font-mono mt-0.5">
                          {new Date(guest.checkInTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </td>

                    {/* WhatsApp Status */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                            guest.whatsappDeliveryStatus === 'read'
                              ? 'bg-[#142633] text-[#53BDEB] border-[#1D4A66]'
                              : guest.whatsappDeliveryStatus === 'delivered'
                              ? 'bg-[#102418] text-[#4ADE80] border-[#1E4D30]'
                              : guest.whatsappDeliveryStatus === 'sent'
                              ? 'bg-[#1A1A1A] text-[#D4AF37] border-[#D4AF37]/30'
                              : guest.whatsappDeliveryStatus === 'sending'
                              ? 'bg-[#2A2410] text-[#D4AF37] border-[#D4AF37]/40 animate-pulse'
                              : guest.whatsappDeliveryStatus === 'failed'
                              ? 'bg-[#2B1717] text-[#F87171] border-[#4A2020]'
                              : 'bg-[#1C1C1C] text-[#777777] border-[#2E2E2E]'
                          }`}
                        >
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>
                            {guest.whatsappDeliveryStatus === 'none'
                              ? 'Not Sent'
                              : guest.whatsappDeliveryStatus.toUpperCase()}
                          </span>
                        </span>
                      </div>
                      {guest.invitationSentAt && (
                        <p className="text-[10px] text-[#777777] font-mono mt-0.5">
                          Sent: {new Date(guest.invitationSentAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </td>

                    {/* Ticket Code */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setViewingQrGuest(guest)}
                        className="inline-flex items-center gap-1.5 font-mono text-white hover:text-[#D4AF37] font-bold text-xs bg-[#181818] hover:bg-[#222222] px-2.5 py-1 rounded-lg border border-[#2E2E2E] transition-colors cursor-pointer"
                        title="View & Download QR Pass"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{guest.inviteCode}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick WhatsApp Invite */}
                        <button
                          disabled={isSendingThis}
                          onClick={() => handleQuickSendWhatsApp(guest)}
                          className="p-1.5 rounded-lg bg-[#102418] hover:bg-[#153020] text-[#4ADE80] border border-[#1E4D30] transition-colors cursor-pointer disabled:opacity-50"
                          title="Send/Resend WhatsApp Invite"
                        >
                          <Send className={`w-3.5 h-3.5 ${isSendingThis ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Quick Check-in Toggle */}
                        <button
                          onClick={() => handleToggleCheckIn(guest)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                            guest.rsvpStatus === 'checked_in'
                              ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                              : 'bg-[#181818] hover:bg-[#242424] text-[#CCCCCC] border-[#2E2E2E]'
                          }`}
                          title={guest.rsvpStatus === 'checked_in' ? 'Undo Check-in' : 'Mark Checked In'}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>

                        {/* Preview RSVP Landing Page */}
                        <button
                          onClick={() => onPreviewGuestRSVP(guest)}
                          className="p-1.5 rounded-lg bg-[#181818] hover:bg-[#242424] text-[#D4AF37] border border-[#2E2E2E] transition-colors cursor-pointer"
                          title="Preview Guest RSVP View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteGuest(guest.id)}
                          className="p-1.5 rounded-lg hover:bg-[#2B1717] text-[#777777] hover:text-[#EF4444] border border-transparent hover:border-[#4A2020] transition-colors cursor-pointer"
                          title="Remove Guest"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#666666]">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-white text-sm">No guests found matching filters</p>
                    <p className="text-xs text-[#888888] mt-1">Add attendees or clear your search criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD SINGLE GUEST */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#111111] text-[#E0E0E0] w-full max-w-lg rounded-3xl shadow-2xl border border-[#2A2A2A] overflow-hidden">
            <div className="bg-[#0D0D0D] text-white p-5 flex items-center justify-between border-b border-[#222222]">
              <h3 className="font-serif font-bold text-base text-white">Add New Guest to Event</h3>
              <button
                onClick={() => setShowAddGuestModal(false)}
                className="p-1.5 rounded-full hover:bg-[#1A1A1A] text-[#888888] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSingleAddSubmit} className="p-6 space-y-4 text-xs sm:text-sm bg-[#111111]">
              <div>
                <label className="block font-semibold text-[#CCCCCC] mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Maya Lin"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#CCCCCC] mb-1">WhatsApp Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+14155550199"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white font-mono placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#CCCCCC] mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="maya@example.com"
                    value={newGuestEmail}
                    onChange={(e) => setNewGuestEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#CCCCCC] mb-1">Ticket Tier</label>
                  <select
                    value={newGuestTier}
                    onChange={(e) => setNewGuestTier(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                  >
                    {activeEvent.ticketTiers.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#181818]">
                        {t.name} (${t.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#CCCCCC] mb-1">Table Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Table 4 / Diamond-1"
                    value={newGuestTable}
                    onChange={(e) => setNewGuestTable(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 font-semibold text-[#CCCCCC] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newGuestVip}
                    onChange={(e) => setNewGuestVip(e.target.checked)}
                    className="rounded border-[#333333] bg-[#181818] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                  />
                  <span>VIP Guest Status</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-[#CCCCCC] mb-1">Notes / Dietary</label>
                <input
                  type="text"
                  placeholder="e.g. Keynote speaker, vegan meal"
                  value={newGuestNotes}
                  onChange={(e) => setNewGuestNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#222222] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#262626] text-[#CCCCCC] border border-[#2E2E2E] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] text-black font-bold cursor-pointer"
                >
                  Save & Generate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK CSV / TEXT IMPORT */}
      {showBulkImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#111111] text-[#E0E0E0] w-full max-w-xl rounded-3xl shadow-2xl border border-[#2A2A2A] overflow-hidden">
            <div className="bg-[#0D0D0D] text-white p-5 flex items-center justify-between border-b border-[#222222]">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif font-bold text-base text-white">Bulk Guest Import</h3>
              </div>
              <button
                onClick={() => setShowBulkImportModal(false)}
                className="p-1.5 rounded-full hover:bg-[#1A1A1A] text-[#888888] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm bg-[#111111]">
              <p className="text-[#888888] text-xs leading-relaxed font-light">
                Paste comma-separated rows in format:
                <br />
                <code className="bg-[#181818] border border-[#2E2E2E] px-2 py-0.5 rounded text-[#D4AF37] font-mono">
                  Full Name, Phone (+code), Email (optional), Tier, PlusOnes
                </code>
              </p>

              <textarea
                rows={7}
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                className="w-full font-mono text-xs p-3 rounded-2xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
              />

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#888888] font-mono">
                  {bulkCsvText.split('\n').filter((l) => l.trim()).length} entries detected
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBulkImportModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#262626] text-[#CCCCCC] border border-[#2E2E2E] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkImportSubmit}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] text-black font-bold cursor-pointer"
                  >
                    Import & Generate Unique QR Codes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW & PRINT QR PASS */}
      {viewingQrGuest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#111111] text-[#E0E0E0] w-full max-w-md rounded-3xl shadow-2xl border border-[#2A2A2A] overflow-hidden text-center p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#222222]">
              <span className="font-serif font-bold text-white text-sm">Unique Guest Digital Pass</span>
              <button
                onClick={() => setViewingQrGuest(null)}
                className="p-1 rounded-full hover:bg-[#1A1A1A] text-[#888888] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <QRCodeDisplay
              data={viewingQrGuest.qrCodeData}
              label={viewingQrGuest.inviteCode}
              sublabel={`Attendee: ${viewingQrGuest.name}`}
              size={200}
              downloadFilename={`pass-${viewingQrGuest.inviteCode}.png`}
            />

            <div className="p-3.5 bg-[#161616] rounded-2xl border border-[#262626] text-left text-xs space-y-1">
              <p>
                <strong className="text-white">Event:</strong> <span className="text-[#AAAAAA]">{activeEvent.title}</span>
              </p>
              <p>
                <strong className="text-white">Tier:</strong> <span className="text-[#D4AF37] font-mono">{viewingQrGuest.ticketTierName}</span>
              </p>
              <p>
                <strong className="text-white">Phone:</strong> <span className="text-[#AAAAAA] font-mono">{viewingQrGuest.phone}</span>
              </p>
              {viewingQrGuest.tableNumber && (
                <p>
                  <strong className="text-white">Table:</strong> <span className="text-[#D4AF37] font-mono">{viewingQrGuest.tableNumber}</span>
                </p>
              )}
            </div>

            <button
              onClick={() => setViewingQrGuest(null)}
              className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs rounded-xl cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: BATCH PRINT BADGES & PASSES */}
      {showPrintBadgesModal && (
        <PrintBadgesModal
          activeEvent={activeEvent}
          guests={eventGuests}
          onClose={() => setShowPrintBadgesModal(false)}
        />
      )}
    </div>
  );
};
