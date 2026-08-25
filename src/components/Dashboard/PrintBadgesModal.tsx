import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Sparkles, 
  CheckSquare, 
  Square, 
  Layers,
  LayoutGrid,
  FileText
} from 'lucide-react';
import { EventItem, Guest } from '../../types';
import { QRCodeDisplay } from '../QRCodeDisplay';

interface PrintBadgesModalProps {
  activeEvent: EventItem;
  guests: Guest[];
  onClose: () => void;
}

export const PrintBadgesModal: React.FC<PrintBadgesModalProps> = ({
  activeEvent,
  guests,
  onClose,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [layoutMode, setLayoutMode] = useState<'badges' | 'table_tents' | 'wristbands'>('badges');
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>(() => guests.map((g) => g.id));

  const filteredGuests = guests.filter((g) => {
    if (selectedTier === 'all') return true;
    if (selectedTier === 'vip') return g.vip;
    return g.ticketTierId === selectedTier;
  });

  const handleToggleSelectAll = () => {
    if (selectedGuestIds.length === filteredGuests.length) {
      setSelectedGuestIds([]);
    } else {
      setSelectedGuestIds(filteredGuests.map((g) => g.id));
    }
  };

  const handleToggleGuest = (id: string) => {
    setSelectedGuestIds((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]
    );
  };

  const printableList = filteredGuests.filter((g) => selectedGuestIds.includes(g.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative bg-[#111111] text-[#E0E0E0] w-full max-w-5xl rounded-3xl shadow-2xl border border-[#2A2A2A] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#0D0D0D] p-5 sm:p-6 flex items-center justify-between border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#AA8B2E] flex items-center justify-center text-black font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                Print Physical QR Badges & Passes
              </h3>
              <p className="text-xs text-[#888888] font-mono">
                {activeEvent.title} • {printableList.length} of {guests.length} ready to print
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={printableList.length === 0}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print Now (PDF / Paper)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#181818] hover:bg-[#252525] text-[#888888] hover:text-white border border-[#2E2E2E] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-[#141414] border-b border-[#222222] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#888888] font-mono text-[11px] uppercase">Format:</span>
            <div className="flex bg-[#1A1A1A] p-1 rounded-xl border border-[#2A2A2A]">
              <button
                onClick={() => setLayoutMode('badges')}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                  layoutMode === 'badges'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                Lanyard Badges (4x3")
              </button>
              <button
                onClick={() => setLayoutMode('table_tents')}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                  layoutMode === 'table_tents'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                Table Placecards
              </button>
              <button
                onClick={() => setLayoutMode('wristbands')}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                  layoutMode === 'wristbands'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                Compact QR Slips
              </button>
            </div>

            <div className="h-4 w-px bg-[#333333] mx-1" />

            <span className="text-[#888888] font-mono text-[11px] uppercase">Filter Tier:</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-[#181818] border border-[#2E2E2E] text-white rounded-xl px-3 py-1.5 text-xs focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all">All Tiers ({guests.length})</option>
              <option value="vip">VIP Only ({guests.filter((g) => g.vip).length})</option>
              {activeEvent.ticketTiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} ({guests.filter((g) => g.ticketTierId === tier.id).length})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 text-[#D4AF37] hover:underline font-mono text-xs cursor-pointer"
            >
              {selectedGuestIds.length === filteredGuests.length ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>Select All ({filteredGuests.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Printable Grid Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#0D0D0D] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {printableList.map((guest) => (
              <div
                key={guest.id}
                className={`relative rounded-2xl border transition-all p-4 flex flex-col justify-between ${
                  layoutMode === 'badges'
                    ? 'bg-gradient-to-b from-[#181818] to-[#121212] border-[#2E2E2E] shadow-lg min-h-[300px]'
                    : layoutMode === 'table_tents'
                    ? 'bg-[#181818] border-[#333333] min-h-[240px]'
                    : 'bg-[#141414] border-[#262626] min-h-[160px]'
                }`}
              >
                {/* Checkbox selector */}
                <button
                  onClick={() => handleToggleGuest(guest.id)}
                  className="absolute top-3 right-3 text-[#666666] hover:text-[#D4AF37] cursor-pointer"
                  title="Toggle Inclusion"
                >
                  <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                </button>

                {/* Badge Top Header */}
                <div className="text-center pb-2 border-b border-[#262626]">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>EVENTPULSE PASS</span>
                  </div>
                  <h4 className="text-xs font-serif font-bold text-white truncate mt-0.5">
                    {activeEvent.title}
                  </h4>
                </div>

                {/* Attendee Name & Tier */}
                <div className="text-center py-2 space-y-0.5">
                  <h3 className="font-serif font-bold text-base text-white truncate">
                    {guest.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1D1B13] border border-[#D4AF37]/40 text-[#D4AF37] font-bold">
                      {guest.ticketTierName}
                    </span>
                    {guest.vip && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3B2910] text-[#FBBF24] border border-[#F59E0B]/40 font-bold">
                        ★ VIP
                      </span>
                    )}
                  </div>
                  {guest.tableNumber && (
                    <p className="text-[10px] font-mono text-[#888888] pt-1">
                      Table / Seat: <strong className="text-white">{guest.tableNumber}</strong>
                    </p>
                  )}
                </div>

                {/* Centered High Contrast Printable QR Code */}
                <div className="flex flex-col items-center justify-center py-1">
                  <QRCodeDisplay
                    data={guest.qrCodeData}
                    size={layoutMode === 'wristbands' ? 90 : 130}
                    showActions={false}
                  />
                  <span className="text-[10px] font-mono font-bold text-[#D4AF37] tracking-wider uppercase mt-1.5">
                    {guest.inviteCode}
                  </span>
                </div>

                {/* Badge Footer */}
                <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-[9px] font-mono text-[#666666]">
                  <span>{activeEvent.city}</span>
                  <span>{new Date(activeEvent.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {printableList.length === 0 && (
            <div className="text-center py-12 text-[#666666] space-y-2">
              <FileText className="w-10 h-10 mx-auto text-[#444444]" />
              <p className="text-xs">No guests selected matching current filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
