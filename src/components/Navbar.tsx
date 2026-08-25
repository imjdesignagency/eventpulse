import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Ticket, 
  LayoutDashboard, 
  MessageSquare, 
  PlusCircle, 
  QrCode, 
  ChevronRight,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { WhatsAppConfig } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'explore' | 'dashboard' | 'tickets' | 'rsvp_preview';
  setActiveTab: (tab: 'explore' | 'dashboard' | 'tickets' | 'rsvp_preview') => void;
  dashboardSubTab: 'overview' | 'guests' | 'whatsapp' | 'designer' | 'scanner';
  setDashboardSubTab: (subTab: 'overview' | 'guests' | 'whatsapp' | 'designer' | 'scanner') => void;
  onOpenCreateEvent: () => void;
  onOpenScanner: () => void;
  onOpenProfile: () => void;
  whatsappConfig: WhatsAppConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  setDashboardSubTab,
  onOpenCreateEvent,
  onOpenScanner,
  onOpenProfile,
  whatsappConfig,
}) => {
  const [showGatewayInfo, setShowGatewayInfo] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { userProfile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#222222] text-[#E0E0E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#222222] to-[#141414] border border-[#D4AF37]/40 flex items-center justify-center shadow-lg shadow-black/60 group-hover:border-[#D4AF37] transition-all">
                <Sparkles className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-brand font-bold text-lg tracking-wider text-white group-hover:text-[#D4AF37] transition-colors">
                    TMB EVENTS
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                    VIP
                  </span>
                </div>
                <p className="text-[11px] text-[#888888] font-medium tracking-wide">Elite Events & WhatsApp RSVP</p>
              </div>
            </button>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#141414] p-1.5 rounded-xl border border-[#262626]">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                  : 'text-[#888888] hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Explore Events</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                  : 'text-[#888888] hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Organizer Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'tickets'
                  ? 'bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                  : 'text-[#888888] hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>My Passes</span>
            </button>
          </nav>

          {/* Right Actions: WhatsApp Status + Scanner + Create Button + User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* WhatsApp Gateway Status Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setDashboardSubTab('whatsapp');
                }}
                onMouseEnter={() => setShowGatewayInfo(true)}
                onMouseLeave={() => setShowGatewayInfo(false)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#102418] border border-[#1E4D30] text-[#4ADE80] text-xs font-medium hover:bg-[#153020] transition-colors cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80]"></span>
                </span>
                <MessageSquare className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span className="font-mono text-[11px]">WA API LIVE</span>
              </button>

              {showGatewayInfo && (
                <div className="absolute right-0 top-full mt-2 w-64 p-3.5 bg-[#141414] rounded-xl border border-[#2E2E2E] text-xs text-[#CCCCCC] shadow-2xl z-50 animate-fadeIn">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-white">WhatsApp Gateway</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#102418] text-[#4ADE80] text-[10px] font-mono border border-[#1E4D30]">
                      {whatsappConfig.provider.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[#888888] text-[11px] leading-relaxed">
                    Automated bulk invites, reminders & real-time delivery receipts active.
                  </p>
                  <div className="mt-2 pt-2 border-t border-[#262626] flex items-center justify-between text-[#D4AF37] text-[11px]">
                    <span className="font-mono">Sender: {whatsappConfig.senderPhoneNumber}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Door Scanner Button */}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222222] text-[#E0E0E0] text-xs font-semibold border border-[#2E2E2E] hover:border-[#D4AF37]/50 transition-all cursor-pointer"
              title="Open QR Code Check-in Scanner"
            >
              <QrCode className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">Door Scanner</span>
            </button>

            {/* Create Event CTA */}
            <button
              onClick={onOpenCreateEvent}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] hover:from-[#E5C158] hover:to-[#BFA03B] text-black text-xs sm:text-sm font-bold shadow-md shadow-[#D4AF37]/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span className="hidden sm:inline">Create Event</span>
            </button>

            {/* User Profile Dropdown Pill */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-[#161616] hover:bg-[#202020] border border-[#2E2E2E] hover:border-[#D4AF37]/50 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#D4AF37]/40 bg-[#1D1B13] flex items-center justify-center text-[#D4AF37] text-xs font-bold font-serif">
                  {userProfile?.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userProfile?.displayName?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <span className="text-xs font-semibold text-white max-w-[90px] sm:max-w-[120px] truncate hidden md:inline">
                  {userProfile?.displayName?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#888888]" />
              </button>

              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 p-2 bg-[#141414] rounded-2xl border border-[#2E2E2E] text-xs shadow-2xl z-50 animate-fadeIn space-y-1">
                    <div className="px-3 py-2 border-b border-[#262626] mb-1">
                      <p className="font-bold text-white truncate">{userProfile?.displayName}</p>
                      <p className="text-[11px] text-[#888888] font-mono truncate">{userProfile?.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1D1B13] text-[#D4AF37] border border-[#D4AF37]/30">
                        {userProfile?.role === 'organizer' ? 'VIP Host / Organizer' : 'VIP Attendee'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenProfile();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-white hover:bg-[#1E1E1E] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#D4AF37]" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActiveTab('dashboard');
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-white hover:bg-[#1E1E1E] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" />
                      <span>Organizer Hub</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActiveTab('tickets');
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-white hover:bg-[#1E1E1E] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Ticket className="w-4 h-4 text-[#4ADE80]" />
                      <span>My Pass Wallet</span>
                    </button>

                    <div className="pt-1 border-t border-[#262626]">
                      <button
                        onClick={async () => {
                          setShowUserDropdown(false);
                          await logout();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-[#F87171] hover:bg-[#2B1414] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-[#F87171]" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-[#222222]">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1 text-xs py-1 px-3 rounded-lg font-medium ${
              activeTab === 'explore' ? 'bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/40' : 'text-[#888888]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Explore</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1 text-xs py-1 px-3 rounded-lg font-medium ${
              activeTab === 'dashboard' ? 'bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/40' : 'text-[#888888]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-1 text-xs py-1 px-3 rounded-lg font-medium ${
              activeTab === 'tickets' ? 'bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/40' : 'text-[#888888]'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Passes</span>
          </button>
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1 text-xs py-1 px-3 rounded-lg font-medium text-[#888888] hover:text-[#D4AF37]"
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
};

