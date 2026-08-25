import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Volume2, 
  VolumeX, 
  Camera
} from 'lucide-react';
import { EventItem, Guest } from '../../types';
import { soundEffects } from '../../services/audioService';

interface QRScannerModalProps {
  activeEvent: EventItem;
  guests: Guest[];
  onClose: () => void;
  onCheckInGuest: (guestId: string) => void;
}

type ScanResultType = 'success' | 'already_checked_in' | 'invalid' | null;

interface ScanResultDetails {
  type: ScanResultType;
  guest?: Guest;
  message: string;
  timestamp: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  activeEvent,
  guests,
  onClose,
  onCheckInGuest,
}) => {
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResultDetails | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResultDetails[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const eventGuests = guests.filter((g) => g.eventId === activeEvent.id);
  const checkedInCount = eventGuests.filter((g) => g.rsvpStatus === 'checked_in').length;
  const attendingCount = eventGuests.filter((g) => g.rsvpStatus === 'attending' || g.rsvpStatus === 'checked_in').length;

  useEffect(() => {
    soundEffects.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  const handleProcessCode = (rawCode: string) => {
    if (!rawCode) return;
    const cleanCode = rawCode.trim().toUpperCase();

    // Look for matching guest by inviteCode or inside JSON qrData
    const matched = eventGuests.find((g) => {
      if (g.inviteCode.toUpperCase() === cleanCode) return true;
      try {
        const parsed = JSON.parse(g.qrCodeData);
        return parsed.code?.toUpperCase() === cleanCode;
      } catch {
        return false;
      }
    });

    if (!matched) {
      soundEffects.playError();
      const res: ScanResultDetails = {
        type: 'invalid',
        message: `Invalid or unrecognized ticket code: "${cleanCode}"`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setScanResult(res);
      setRecentScans((prev) => [res, ...prev.slice(0, 9)]);
      return;
    }

    if (matched.rsvpStatus === 'checked_in') {
      soundEffects.playWarning();
      const res: ScanResultDetails = {
        type: 'already_checked_in',
        guest: matched,
        message: `Already Checked-In previously at ${
          matched.checkInTimestamp ? new Date(matched.checkInTimestamp).toLocaleTimeString() : 'earlier'
        }`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setScanResult(res);
      setRecentScans((prev) => [res, ...prev.slice(0, 9)]);
      return;
    }

    // Valid check-in!
    soundEffects.playSuccess();
    onCheckInGuest(matched.id);

    const res: ScanResultDetails = {
      type: 'success',
      guest: matched,
      message: `Verified! Welcome to ${activeEvent.title}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setScanResult(res);
    setRecentScans((prev) => [res, ...prev.slice(0, 9)]);
    setManualCodeInput('');
  };

  const handleStartCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      setCameraError('Camera access denied or not available in this browser environment. Use the code scanner simulator below.');
      setCameraActive(false);
    }
  };

  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative bg-[#111111] text-[#E0E0E0] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#2A2A2A] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0D0D0D] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#AA8B2E] flex items-center justify-center text-black font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">Live Door Entry & QR Scanner</h3>
              <p className="text-xs text-[#888888] font-mono">
                {activeEvent.title} • {checkedInCount} of {attendingCount} Checked In
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl transition-colors cursor-pointer border border-[#2E2E2E] ${
                soundEnabled ? 'bg-[#1D1B13] text-[#D4AF37]' : 'bg-[#181818] text-[#666666]'
              }`}
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                handleStopCamera();
                onClose();
              }}
              className="p-2 rounded-full bg-[#181818] hover:bg-[#252525] text-[#888888] hover:text-white border border-[#2E2E2E] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm bg-[#111111]">
          {/* Active Result Alert Banner */}
          {scanResult && (
            <div
              className={`p-4 rounded-2xl border transition-all animate-fadeIn ${
                scanResult.type === 'success'
                  ? 'bg-[#102418] border-[#1E4D30] text-[#4ADE80]'
                  : scanResult.type === 'already_checked_in'
                  ? 'bg-[#2A2410] border-[#D4AF37]/50 text-[#D4AF37]'
                  : 'bg-[#2B1717] border-[#4A2020] text-[#F87171]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {scanResult.type === 'success' && (
                    <div className="w-10 h-10 rounded-xl bg-[#153020] text-[#4ADE80] border border-[#1E4D30] flex items-center justify-center flex-shrink-0 shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                  {scanResult.type === 'already_checked_in' && (
                    <div className="w-10 h-10 rounded-xl bg-[#1D1B13] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0 shadow-md">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  )}
                  {scanResult.type === 'invalid' && (
                    <div className="w-10 h-10 rounded-xl bg-[#3B1A1A] text-[#F87171] border border-[#4A2020] flex items-center justify-center flex-shrink-0 shadow-md">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <h4 className="font-serif font-bold text-sm sm:text-base">
                      {scanResult.type === 'success'
                        ? '✅ VALID ENTRY — CHECKED IN'
                        : scanResult.type === 'already_checked_in'
                        ? '⚠️ ALREADY CHECKED IN (DUPLICATE TICKET)'
                        : '❌ INVALID TICKET CODE'}
                    </h4>
                    <p className="text-xs mt-0.5 opacity-90 font-light">{scanResult.message}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono opacity-70">{scanResult.timestamp}</span>
              </div>

              {scanResult.guest && (
                <div className="mt-3 pt-3 border-t border-current/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="opacity-70 text-[10px] uppercase font-mono">Attendee</span>
                    <p className="font-bold text-white">{scanResult.guest.name}</p>
                  </div>
                  <div>
                    <span className="opacity-70 text-[10px] uppercase font-mono">Tier</span>
                    <p className="font-bold text-white">{scanResult.guest.ticketTierName}</p>
                  </div>
                  <div>
                    <span className="opacity-70 text-[10px] uppercase font-mono">VIP Status</span>
                    <p className="font-bold text-[#D4AF37]">{scanResult.guest.vip ? '🌟 VIP Guest' : 'Standard'}</p>
                  </div>
                  <div>
                    <span className="opacity-70 text-[10px] uppercase font-mono">Table / Seat</span>
                    <p className="font-bold text-white">{scanResult.guest.tableNumber || 'General Seating'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scanner Viewport & Manual Simulation Input */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Camera Feed / Scan Overlay */}
            <div className="md:col-span-6 flex flex-col items-center justify-center bg-[#0A0A0A] rounded-3xl p-6 text-white min-h-[260px] relative overflow-hidden border border-[#222222]">
              {cameraActive ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <video ref={videoRef} className="w-full h-48 object-cover rounded-2xl" />
                  <div className="absolute inset-0 border-2 border-[#D4AF37]/60 rounded-2xl pointer-events-none flex items-center justify-center">
                    <div className="w-32 h-32 border-2 border-[#D4AF37] rounded-lg animate-pulse" />
                  </div>
                  <button
                    onClick={handleStopCamera}
                    className="mt-3 px-3 py-1 bg-[#EF4444] text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Stop Camera
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#2E2E2E] flex items-center justify-center mx-auto text-[#D4AF37]">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-white text-sm">Optical Camera Scanner</h4>
                    <p className="text-xs text-[#888888] mt-1 font-light">Scan physical paper badges or smartphone screens</p>
                  </div>
                  <button
                    onClick={handleStartCamera}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] hover:from-[#E5C158] text-black rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Enable Camera Feed
                  </button>
                  {cameraError && (
                    <p className="text-[11px] text-[#F87171] max-w-xs mx-auto">{cameraError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Right: Quick Code Simulator & Fast Check-In Input */}
            <div className="md:col-span-6 space-y-4">
              <div className="space-y-2">
                <label className="block font-semibold text-[#CCCCCC] text-xs uppercase font-mono">
                  Manual Code Entry or Barcode Gun Input
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type or paste code: EVP-AI-7729A..."
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleProcessCode(manualCodeInput);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white text-xs font-mono placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                  />
                  <button
                    onClick={() => handleProcessCode(manualCodeInput)}
                    className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold rounded-xl text-xs whitespace-nowrap cursor-pointer"
                  >
                    Scan
                  </button>
                </div>
              </div>

              {/* Quick 1-Click Test Codes for attendees in event */}
              <div className="space-y-2 pt-2 border-t border-[#262626]">
                <span className="text-[11px] font-mono font-bold text-[#888888] uppercase tracking-wider">
                  Quick-Test Guest Tickets (Click to simulate scan):
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {eventGuests.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleProcessCode(g.inviteCode)}
                      className={`w-full p-2 rounded-xl text-left border flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        g.rsvpStatus === 'checked_in'
                          ? 'bg-[#141414] border-[#222222] text-[#666666]'
                          : 'bg-[#181818] border-[#2A2A2A] hover:border-[#D4AF37] text-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="font-bold truncate">{g.name}</span>
                        <span className="text-[10px] font-mono text-[#888888] ml-1.5">({g.inviteCode})</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          g.rsvpStatus === 'checked_in'
                            ? 'bg-[#202020] text-[#777777] border-[#333333]'
                            : 'bg-[#102418] text-[#4ADE80] border-[#1E4D30]'
                        }`}
                      >
                        {g.rsvpStatus === 'checked_in' ? 'Checked' : 'Scan'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Scans Live Stream */}
          <div className="space-y-2.5 pt-4 border-t border-[#262626]">
            <h4 className="text-xs font-mono font-bold text-[#888888] uppercase tracking-wider">
              Recent Door Scanner Activity Log
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {recentScans.map((scan, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-[#161616] rounded-xl border border-[#262626] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    {scan.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />}
                    {scan.type === 'already_checked_in' && <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />}
                    {scan.type === 'invalid' && <XCircle className="w-4 h-4 text-[#F87171]" />}
                    <span className="font-semibold text-white">
                      {scan.guest ? scan.guest.name : 'Unknown code'}
                    </span>
                    <span className="text-[11px] text-[#888888] truncate max-w-xs font-light">{scan.message}</span>
                  </div>
                  <span className="text-[10px] text-[#777777] font-mono">{scan.timestamp}</span>
                </div>
              ))}

              {recentScans.length === 0 && (
                <p className="text-xs text-[#666666] py-2">No tickets scanned yet this session.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
