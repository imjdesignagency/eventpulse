import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar as CalendarIcon, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Globe, 
  Ticket
} from 'lucide-react';
import { EventItem, EventCategory } from '../types';

interface EventDiscoveryProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onBookTickets: (event: EventItem) => void;
  onOpenCreateEvent?: () => void;
}

const CATEGORIES: ('All' | EventCategory)[] = [
  'All',
  'Technology & AI',
  'Music & Concerts',
  'Gala & Dinners',
  'Business & Networking',
  'Workshops & Education',
  'Festivals & Arts'
];

export const EventDiscovery: React.FC<EventDiscoveryProps> = ({
  events,
  onSelectEvent,
  onBookTickets,
  onOpenCreateEvent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | EventCategory>('All');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [locationTypeFilter, setLocationTypeFilter] = useState<'all' | 'venue' | 'online' | 'hybrid'>('all');

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Search filter
      const matchesSearch =
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;

      // Price filter
      const minPrice = Math.min(...evt.ticketTiers.map((t) => t.price));
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'free' && minPrice === 0) ||
        (priceFilter === 'paid' && minPrice > 0);

      // Location type
      const matchesLocation =
        locationTypeFilter === 'all' || evt.locationType === locationTypeFilter;

      return matchesSearch && matchesCategory && matchesPrice && matchesLocation;
    });
  }, [events, searchQuery, selectedCategory, priceFilter, locationTypeFilter]);

  const featuredEvent = useMemo(() => {
    return events.find((e) => e.featured) || events[0];
  }, [events]);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section with Search Bar */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#141414] via-[#111111] to-[#0A0A0A] border border-[#2A2A2A] text-white p-6 sm:p-10 lg:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-[#AA8B2E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover • RSVP • Experience</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
            Curated Gatherings, Instant QR Passes & WhatsApp RSVP
          </h1>
          <p className="mt-4 text-[#AAAAAA] text-base sm:text-lg leading-relaxed font-light">
            Explore world-class summits, exclusive dinners, keynote conferences, and intimate galas with automated guest messaging.
          </p>

          {/* Search Box */}
          <div className="mt-8 p-2.5 bg-[#181818]/90 backdrop-blur-md rounded-2xl border border-[#2E2E2E] shadow-2xl flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full flex items-center">
              <Search className="absolute left-3.5 w-5 h-5 text-[#888888]" />
              <input
                type="text"
                placeholder="Search by event title, speaker, city, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-transparent text-white placeholder-[#666666] text-sm focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={locationTypeFilter}
                onChange={(e) => setLocationTypeFilter(e.target.value as any)}
                aria-label="Filter by event format"
                className="bg-[#121212] text-[#CCCCCC] text-xs rounded-xl px-3 py-3 border border-[#2E2E2E] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                <option value="all">Any Format</option>
                <option value="venue">In-Person</option>
                <option value="online">Virtual / Online</option>
                <option value="hybrid">Hybrid</option>
              </select>

              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                aria-label="Filter by event price"
                className="bg-[#121212] text-[#CCCCCC] text-xs rounded-xl px-3 py-3 border border-[#2E2E2E] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                <option value="all">Any Price</option>
                <option value="free">Free Only</option>
                <option value="paid">Paid Only</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Spotlight Banner (if exists) */}
      {featuredEvent && !searchQuery && selectedCategory === 'All' && (
        <section className="bg-[#111111] rounded-3xl border border-[#222222] shadow-2xl overflow-hidden transition-all hover:border-[#D4AF37]/40">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[420px]">
              <img
                src={featuredEvent.bannerUrl}
                alt={featuredEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider shadow-lg">
                  ★ Premier Spotlight
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
                  {featuredEvent.category}
                </p>
                <h3 className="text-xl sm:text-3xl font-serif font-bold mt-1 text-white">
                  {featuredEvent.title}
                </h3>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#141414]">
              <div className="space-y-4">
                <p className="text-sm text-[#AAAAAA] line-clamp-3 leading-relaxed">
                  {featuredEvent.description}
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-[#CCCCCC] font-medium">
                    <CalendarIcon className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span>
                      {new Date(featuredEvent.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      • {featuredEvent.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-[#CCCCCC] font-medium">
                    <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span className="line-clamp-1">
                      {featuredEvent.venueName}, {featuredEvent.city}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-[#CCCCCC] font-medium">
                    <Users className="w-4 h-4 text-[#4ADE80] flex-shrink-0" />
                    <span>
                      {featuredEvent.ticketTiers.reduce((acc, t) => acc + t.sold, 0)} registered / {featuredEvent.totalCapacity} capacity
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {featuredEvent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-[#1D1D1D] border border-[#2A2A2A] text-[#D4AF37] text-[11px] font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[#242424] mt-6 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-[#888888] font-mono uppercase tracking-wider">Starts From</span>
                  <p className="text-2xl font-serif font-bold text-[#D4AF37]">
                    {Math.min(...featuredEvent.ticketTiers.map((t) => t.price)) === 0
                      ? 'Free Pass'
                      : `$${Math.min(...featuredEvent.ticketTiers.map((t) => t.price))}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectEvent(featuredEvent)}
                    className="px-4 py-2.5 rounded-xl bg-[#1D1D1D] hover:bg-[#262626] text-[#E0E0E0] text-xs font-semibold border border-[#2E2E2E] transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onBookTickets(featuredEvent)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] hover:from-[#E5C158] hover:to-[#BFA03B] text-black text-xs font-bold shadow-lg shadow-[#D4AF37]/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Ticket className="w-4 h-4 text-black" />
                    <span>Book Tickets</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter Pills */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
            <span>Explore Categories</span>
          </h2>
          <span className="text-xs font-mono text-[#888888]">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} listed
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-[#1F1F1F] text-[#D4AF37] border-[#D4AF37]/60 shadow-md'
                  : 'bg-[#141414] text-[#888888] border-[#222222] hover:bg-[#1A1A1A] hover:text-[#CCCCCC]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Events Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => {
          const minPrice = Math.min(...evt.ticketTiers.map((t) => t.price));
          const totalSold = evt.ticketTiers.reduce((a, b) => a + b.sold, 0);
          const percentFull = Math.min(100, Math.round((totalSold / evt.totalCapacity) * 100));

          return (
            <div
              key={evt.id}
              className="group bg-[#111111] rounded-2xl border border-[#222222] shadow-xl hover:border-[#D4AF37]/40 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Event Image */}
              <div className="relative aspect-video w-full overflow-hidden bg-[#161616]">
                <img
                  src={evt.bannerUrl}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0A0A0A]/85 backdrop-blur-md text-[#D4AF37] text-[11px] font-mono border border-[#D4AF37]/30">
                    {evt.category}
                  </span>
                </div>

                {/* Location Pill */}
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0A0A0A]/85 backdrop-blur-md text-white text-[11px] font-medium shadow-sm flex items-center gap-1 border border-[#2A2A2A]">
                    {evt.locationType === 'online' ? (
                      <>
                        <Globe className="w-3 h-3 text-[#53BDEB]" />
                        <span>Online</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3 text-[#D4AF37]" />
                        <span>{evt.city}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Date overlay */}
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>
                      {new Date(evt.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-[#888888]">• {evt.time}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-white text-lg leading-snug group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-[#888888] mt-1.5 line-clamp-2 leading-relaxed font-light">
                    {evt.tagline || evt.description}
                  </p>
                </div>

                {/* Capacity progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#888888] font-mono">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#666666]" />
                      <span>Capacity</span>
                    </span>
                    <span>{totalSold} / {evt.totalCapacity} ({percentFull}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1E1E1E] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percentFull > 85 ? 'bg-[#EF4444]' : 'bg-[#D4AF37]'
                      }`}
                      style={{ width: `${percentFull}%` }}
                    />
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3.5 border-t border-[#222222] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#666666] uppercase font-mono tracking-wider">Passes from</span>
                    <p className="text-lg font-serif font-bold text-[#D4AF37]">
                      {minPrice === 0 ? 'Free' : `$${minPrice}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectEvent(evt)}
                      className="p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-[#AAAAAA] hover:text-white border border-[#2E2E2E] transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onBookTickets(evt)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] hover:from-[#E5C158] hover:to-[#BFA03B] text-black text-xs font-bold shadow-md shadow-[#D4AF37]/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5 text-black" />
                      <span>Book</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && events.length > 0 && (
          <div className="col-span-full py-16 text-center bg-[#111111] rounded-2xl border border-[#222222] p-8">
            <Search className="w-12 h-12 text-[#444444] mx-auto mb-3" />
            <h4 className="text-lg font-serif font-bold text-white">No events matched your search</h4>
            <p className="text-xs text-[#888888] mt-1 max-w-md mx-auto">
              Try adjusting your search query, clearing category filters, or selecting a different event format.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setPriceFilter('all');
                setLocationTypeFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-[#D4AF37] text-black rounded-xl text-xs font-bold hover:bg-[#E5C158] transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {events.length === 0 && (
          <div className="col-span-full py-16 text-center bg-[#111111] rounded-3xl border border-[#222222] p-8 sm:p-12 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#1D1B13] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mx-auto shadow-lg shadow-[#D4AF37]/10">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-serif font-bold text-white">Ready for Real Data</h4>
            <p className="text-sm text-[#888888] max-w-md mx-auto font-light leading-relaxed">
              All demo events have been removed. Publish your real live event to issue QR tickets, manage guests, and connect WhatsApp messaging.
            </p>
            {onOpenCreateEvent && (
              <div className="pt-2">
                <button
                  onClick={onOpenCreateEvent}
                  className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] text-black rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-[#D4AF37]/20 hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Ticket className="w-4 h-4 text-black" />
                  <span>Create Your First Event</span>
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
