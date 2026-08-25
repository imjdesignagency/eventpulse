import React, { useState, useEffect } from 'react';
import { 
  INITIAL_EVENTS, 
  INITIAL_GUESTS, 
  INITIAL_TEMPLATES, 
  INITIAL_WHATSAPP_CONFIG, 
  INITIAL_WHATSAPP_LOGS 
} from './data/sampleEvents';
import { 
  EventItem, 
  Guest, 
  WhatsAppConfig, 
  WhatsAppTemplate, 
  WhatsAppMessageLog, 
  TicketBooking, 
  TicketTier, 
  WhatsAppDeliveryStatus 
} from './types';
import { Navbar } from './components/Navbar';
import { EventDiscovery } from './components/EventDiscovery';
import { EventDetailModal } from './components/EventDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CreateEventModal } from './components/CreateEventModal';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { GuestListManager } from './components/Dashboard/GuestListManager';
import { InvitationDesigner } from './components/Dashboard/InvitationDesigner';
import { QRScannerModal } from './components/Dashboard/QRScannerModal';
import { WhatsAppGatewayHub } from './components/Dashboard/WhatsAppGatewayHub';
import { GuestRSVPView } from './components/GuestRSVPView';
import { MyTicketsView } from './components/MyTicketsView';
import { useAuth } from './context/AuthContext';
import { AuthScreen } from './components/Auth/AuthScreen';
import { UserProfileModal } from './components/Auth/UserProfileModal';
import { Sparkles } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading: authLoading, userProfile } = useAuth();

  // Main State
  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('ep_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If old mock demo data is detected in storage, purge it for clean production state
        const hasLegacyDemo = parsed.some((e: any) =>
          e.id === 'evt_tech_summit_2026' ||
          e.id === 'evt_gala_charity_2026' ||
          e.id === 'evt_music_fest_2026'
        );
        if (hasLegacyDemo) {
          localStorage.removeItem('ep_events');
          localStorage.removeItem('ep_guests');
          localStorage.removeItem('ep_whatsapp_logs');
          return [];
        }
        return parsed;
      } catch (err) {
        return [];
      }
    }
    return INITIAL_EVENTS;
  });

  const [guests, setGuests] = useState<Guest[]>(() => {
    const saved = localStorage.getItem('ep_guests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasLegacyDemo = parsed.some((g: any) => g.eventId === 'evt_tech_summit_2026');
        if (hasLegacyDemo) return [];
        return parsed;
      } catch {
        return [];
      }
    }
    return INITIAL_GUESTS;
  });

  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>(() => {
    const saved = localStorage.getItem('ep_whatsapp_config');
    return saved ? JSON.parse(saved) : INITIAL_WHATSAPP_CONFIG;
  });

  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>(() => {
    const saved = localStorage.getItem('ep_whatsapp_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppMessageLog[]>(() => {
    const saved = localStorage.getItem('ep_whatsapp_logs');
    return saved ? JSON.parse(saved) : INITIAL_WHATSAPP_LOGS;
  });

  const [bookings, setBookings] = useState<TicketBooking[]>(() => {
    const saved = localStorage.getItem('ep_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<'explore' | 'dashboard' | 'tickets' | 'rsvp_preview'>('explore');
  const [dashboardSubTab, setDashboardSubTab] = useState<'overview' | 'guests' | 'whatsapp' | 'designer' | 'scanner'>('overview');
  const [activeEventId, setActiveEventId] = useState<string>(() => events[0]?.id || '');

  // Modals State
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);
  const [checkoutEventData, setCheckoutEventData] = useState<{
    event: EventItem;
    selectedTiers: { tier: TicketTier; quantity: number }[];
  } | null>(null);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Active RSVP Guest for preview
  const [activeRsvpGuest, setActiveRsvpGuest] = useState<Guest | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('ep_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('ep_guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem('ep_whatsapp_config', JSON.stringify(whatsappConfig));
  }, [whatsappConfig]);

  useEffect(() => {
    localStorage.setItem('ep_whatsapp_templates', JSON.stringify(whatsappTemplates));
  }, [whatsappTemplates]);

  useEffect(() => {
    localStorage.setItem('ep_whatsapp_logs', JSON.stringify(whatsappLogs));
  }, [whatsappLogs]);

  useEffect(() => {
    localStorage.setItem('ep_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Handle URL Hash routes (e.g. #rsvp/CODE or #ticket/CODE)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#rsvp/')) {
        const code = hash.replace('#rsvp/', '').trim();
        const foundGuest = guests.find((g) => g.inviteCode.toUpperCase() === code.toUpperCase());
        if (foundGuest) {
          setActiveRsvpGuest(foundGuest);
          setActiveTab('rsvp_preview');
        }
      } else if (hash.startsWith('#ticket/')) {
        setActiveTab('tickets');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [guests]);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  // Handlers
  const handleCreateEvent = (newEvent: EventItem) => {
    // Attach current user as organizer if available
    const eventWithOrganizer: EventItem = {
      ...newEvent,
      organizerName: userProfile?.displayName || newEvent.organizerName,
      organizerEmail: userProfile?.email || newEvent.organizerEmail,
      organizerPhone: userProfile?.phone || newEvent.organizerPhone,
    };
    setEvents((prev) => [eventWithOrganizer, ...prev]);
    setActiveEventId(newEvent.id);
    setActiveTab('dashboard');
    setDashboardSubTab('overview');
  };

  const handleBookingComplete = (booking: TicketBooking, newGuests: Guest[]) => {
    setBookings((prev) => [booking, ...prev]);
    setGuests((prev) => [...newGuests, ...prev]);

    // Update ticket sold count on event
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === booking.eventId) {
          const updatedTiers = evt.ticketTiers.map((tier) => {
            const bookedItem = booking.items.find((item) => item.tierId === tier.id);
            if (bookedItem) {
              return { ...tier, sold: tier.sold + bookedItem.quantity };
            }
            return tier;
          });
          return { ...evt, ticketTiers: updatedTiers };
        }
        return evt;
      })
    );
  };

  const handleAddGuest = (newGuest: Guest) => {
    setGuests((prev) => [newGuest, ...prev]);
  };

  const handleAddBulkGuests = (newGuests: Guest[]) => {
    setGuests((prev) => [...newGuests, ...prev]);
  };

  const handleUpdateGuest = (updatedGuest: Guest) => {
    setGuests((prev) => prev.map((g) => (g.id === updatedGuest.id ? updatedGuest : g)));
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  const handleUpdateGuestStatuses = (updates: { id: string; status: WhatsAppDeliveryStatus }[]) => {
    setGuests((prev) =>
      prev.map((g) => {
        const update = updates.find((u) => u.id === g.id);
        if (update) {
          return {
            ...g,
            whatsappDeliveryStatus: update.status,
            invitationSentAt: g.invitationSentAt || new Date().toISOString(),
          };
        }
        return g;
      })
    );
  };

  const handleCheckInGuest = (guestId: string) => {
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestId
          ? {
              ...g,
              rsvpStatus: 'checked_in',
              checkInTimestamp: new Date().toISOString(),
            }
          : g
      )
    );
  };

  const handleUpdateRSVP = (
    guestId: string,
    status: 'attending' | 'declined',
    plusGuests: number,
    dietary?: string
  ) => {
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestId
          ? {
              ...g,
              rsvpStatus: status,
              plusGuests,
              dietaryRequirements: dietary,
              rsvpRespondedAt: new Date().toISOString(),
            }
          : g
      )
    );
  };

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#AA8B2E] flex items-center justify-center text-black font-bold animate-pulse shadow-xl shadow-[#D4AF37]/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-brand font-bold text-lg tracking-widest text-[#D4AF37]">EVENTPULSE</h2>
          <p className="text-xs text-[#888888] font-mono">Verifying secure authentication...</p>
        </div>
      </div>
    );
  }

  // Account Gate: Users must create an account or sign in to access any feature!
  if (!isAuthenticated) {
    // If user is accessing a specific direct RSVP link code via hash, allow guest pass response
    if (window.location.hash.startsWith('#rsvp/') && activeRsvpGuest) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] flex flex-col">
          <div className="bg-[#111111] p-3 border-b border-[#222222] text-center text-xs flex items-center justify-center gap-2">
            <span className="text-[#888888]">Viewing private RSVP pass.</span>
            <button
              onClick={() => {
                window.location.hash = '';
                setActiveTab('explore');
              }}
              className="text-[#D4AF37] font-bold hover:underline cursor-pointer"
            >
              Sign In or Create Account to access all features →
            </button>
          </div>
          <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
            <GuestRSVPView
              guest={activeRsvpGuest}
              event={events.find((e) => e.id === activeRsvpGuest.eventId) || activeEvent}
              onUpdateRSVP={handleUpdateRSVP}
              onBackToExplore={() => {
                window.location.hash = '';
                setActiveTab('explore');
              }}
            />
          </main>
        </div>
      );
    }

    return <AuthScreen />;
  }

  const sampleGuest = (activeEvent ? guests.find((g) => g.eventId === activeEvent.id) : null) || guests[0];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dashboardSubTab={dashboardSubTab}
        setDashboardSubTab={setDashboardSubTab}
        onOpenCreateEvent={() => setShowCreateEventModal(true)}
        onOpenScanner={() => setShowScannerModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        whatsappConfig={whatsappConfig}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* VIEW 1: EXPLORE EVENTS */}
        {activeTab === 'explore' && (
          <EventDiscovery
            events={events}
            onSelectEvent={(evt) => setSelectedEventForDetail(evt)}
            onOpenCreateEvent={() => setShowCreateEventModal(true)}
            onBookTickets={(evt) => {
              setCheckoutEventData({
                event: evt,
                selectedTiers: [{ tier: evt.ticketTiers[0], quantity: 1 }],
              });
            }}
          />
        )}

        {/* VIEW 2: ORGANIZER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard Subheader: Event Picker & Subtab Pills */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111] p-4 rounded-2xl border border-[#222222] shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#888888] whitespace-nowrap">
                  Managing Event:
                </span>
                {events.length > 0 ? (
                  <select
                    value={activeEventId}
                    onChange={(e) => setActiveEventId(e.target.value)}
                    className="bg-[#181818] border border-[#2A2A2A] rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer max-w-xs sm:max-w-md truncate"
                  >
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.id} className="bg-[#181818] text-white">
                        {evt.title} ({new Date(evt.date).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    onClick={() => setShowCreateEventModal(true)}
                    className="text-xs font-semibold text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    + Create an event first
                  </button>
                )}
              </div>

              {/* Subtabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'guests', label: `Guests (${activeEvent ? guests.filter((g) => g.eventId === activeEvent.id).length : 0})` },
                  { id: 'whatsapp', label: 'WhatsApp Hub & API' },
                  { id: 'designer', label: 'Invitation Pass Designer' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setDashboardSubTab(sub.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                      dashboardSubTab === sub.id
                        ? 'bg-[#1F1F1F] text-[#D4AF37] border-[#D4AF37]/50 shadow-sm'
                        : 'bg-[#141414] text-[#888888] border-[#222222] hover:text-[#E0E0E0] hover:border-[#333333]'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtab Content */}
            {dashboardSubTab === 'overview' && (
              <DashboardOverview
                activeEvent={activeEvent}
                guests={guests}
                whatsappLogs={whatsappLogs}
                whatsappConfig={whatsappConfig}
                onNavigateSubTab={setDashboardSubTab}
                onOpenScanner={() => setShowScannerModal(true)}
                onOpenWhatsAppBlast={() => setDashboardSubTab('whatsapp')}
                onOpenCreateEvent={() => setShowCreateEventModal(true)}
              />
            )}

            {dashboardSubTab === 'guests' && (
              <GuestListManager
                activeEvent={activeEvent}
                guests={guests}
                whatsappConfig={whatsappConfig}
                whatsappTemplates={whatsappTemplates}
                onAddGuest={handleAddGuest}
                onAddBulkGuests={handleAddBulkGuests}
                onUpdateGuest={handleUpdateGuest}
                onDeleteGuest={handleDeleteGuest}
                onOpenWhatsAppBlast={() => setDashboardSubTab('whatsapp')}
                onPreviewGuestRSVP={(guest) => {
                  setActiveRsvpGuest(guest);
                  setActiveTab('rsvp_preview');
                }}
              />
            )}

            {dashboardSubTab === 'whatsapp' && (
              <WhatsAppGatewayHub
                activeEvent={activeEvent}
                guests={guests}
                whatsappConfig={whatsappConfig}
                whatsappTemplates={whatsappTemplates}
                whatsappLogs={whatsappLogs}
                onUpdateConfig={setWhatsappConfig}
                onUpdateTemplates={setWhatsappTemplates}
                onAddLogs={(newLogs) => setWhatsappLogs((prev) => [...newLogs, ...prev])}
                onUpdateGuestStatuses={handleUpdateGuestStatuses}
              />
            )}

            {dashboardSubTab === 'designer' && (
              <InvitationDesigner
                activeEvent={activeEvent}
                sampleGuest={sampleGuest}
                onPreviewPublicRSVP={() => {
                  setActiveRsvpGuest(sampleGuest);
                  setActiveTab('rsvp_preview');
                }}
              />
            )}
          </div>
        )}

        {/* VIEW 3: MY TICKETS / PASSES */}
        {activeTab === 'tickets' && (
          <MyTicketsView
            events={events}
            guests={guests}
            bookings={bookings}
            onOpenBookings={() => setActiveTab('explore')}
          />
        )}

        {/* VIEW 4: PUBLIC GUEST RSVP & QR PASS VIEW */}
        {activeTab === 'rsvp_preview' && (
          <GuestRSVPView
            guest={activeRsvpGuest || sampleGuest}
            event={events.find((e) => e.id === (activeRsvpGuest?.eventId || sampleGuest.eventId)) || activeEvent}
            onUpdateRSVP={handleUpdateRSVP}
            onBackToExplore={() => setActiveTab('explore')}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0D0D0D] text-[#888888] py-8 border-t border-[#222222] text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-brand font-bold text-[#D4AF37] tracking-wider">TMB EVENTS</span>
            <span>• Integrated Event Management, QR Passes & WhatsApp Messaging Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[#777777]">
            <span className="text-[#A3822B]">Automated Reminders Active</span>
            <span>•</span>
            <span className="text-[#888888]">Instant Door QR Validation</span>
          </div>
        </div>
      </footer>

      {/* MODAL: EVENT DETAIL VIEW & TICKET SELECTOR */}
      {selectedEventForDetail && (
        <EventDetailModal
          event={selectedEventForDetail}
          onClose={() => setSelectedEventForDetail(null)}
          onProceedToCheckout={(evt, selectedTiers) => {
            setSelectedEventForDetail(null);
            setCheckoutEventData({ event: evt, selectedTiers });
          }}
        />
      )}

      {/* MODAL: CHECKOUT & QR ISSUANCE */}
      {checkoutEventData && (
        <CheckoutModal
          event={checkoutEventData.event}
          selectedTiers={checkoutEventData.selectedTiers}
          onClose={() => setCheckoutEventData(null)}
          onBookingComplete={handleBookingComplete}
        />
      )}

      {/* MODAL: CREATE EVENT */}
      {showCreateEventModal && (
        <CreateEventModal
          onClose={() => setShowCreateEventModal(false)}
          onCreateEvent={handleCreateEvent}
        />
      )}

      {/* MODAL: DOOR QR CODE SCANNER */}
      {showScannerModal && (
        <QRScannerModal
          activeEvent={activeEvent}
          guests={guests}
          onClose={() => setShowScannerModal(false)}
          onCheckInGuest={handleCheckInGuest}
        />
      )}

      {/* MODAL: USER PROFILE & ACCOUNT SETTINGS */}
      {showProfileModal && (
        <UserProfileModal
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}

