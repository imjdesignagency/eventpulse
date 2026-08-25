import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  RefreshCw
} from 'lucide-react';
import { EventItem, EventCategory, LocationType, TicketTier } from '../types';

interface CreateEventModalProps {
  onClose: () => void;
  onCreateEvent: (newEvent: EventItem) => void;
}

const CATEGORIES: EventCategory[] = [
  'Technology & AI',
  'Music & Concerts',
  'Business & Networking',
  'Gala & Dinners',
  'Workshops & Education',
  'Sports & Wellness',
  'Festivals & Arts'
];

const PRESET_BANNERS = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1600&q=80',
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  onClose,
  onCreateEvent,
}) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Technology & AI');
  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0]);
  const [bannerTab, setBannerTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [bannerFileName, setBannerFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, SVG, etc.)');
      return;
    }

    setIsUploading(true);
    setBannerFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      // Process & optimize image dimension if large
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
            setBannerUrl(optimizedDataUrl);
            setIsUploading(false);
            return;
          }
        }
        setBannerUrl(result);
        setIsUploading(false);
      };
      img.onerror = () => {
        setBannerUrl(result);
        setIsUploading(false);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  const [date, setDate] = useState('2026-10-15');
  const [time, setTime] = useState('10:00 AM');
  const [endDate, setEndDate] = useState('2026-10-15');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [locationType, setLocationType] = useState<LocationType>('venue');
  const [venueName, setVenueName] = useState('Grand Tech Convention Center');
  const [address, setAddress] = useState('100 Waterfront Plaza');
  const [city, setCity] = useState('San Francisco, CA');
  const [virtualLink, setVirtualLink] = useState('');
  const [organizerName, setOrganizerName] = useState('Global Events Guild');
  const [organizerEmail, setOrganizerEmail] = useState('hello@eventsguild.org');
  const [organizerPhone, setOrganizerPhone] = useState('+1 (555) 019-2834');
  const [dressCode, setDressCode] = useState('Black Tie / Sophisticated');
  const [tags, setTags] = useState('Innovation, Summit, Networking');

  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    {
      id: `tier_${Date.now()}_1`,
      name: 'General Admission',
      price: 99,
      capacity: 200,
      sold: 0,
      description: 'Standard full event access and refreshments.',
      perks: ['Event Access', 'Welcome Coffee', 'Digital Badge']
    },
    {
      id: `tier_${Date.now()}_2`,
      name: 'VIP All-Access',
      price: 249,
      capacity: 50,
      sold: 0,
      description: 'VIP lounge access, front-row seating, and speaker dinner.',
      perks: ['VIP Lounge', 'Speaker Dinner', 'Express QR Check-in', 'Priority Seating']
    }
  ]);

  const addTicketTier = () => {
    setTicketTiers((prev) => [
      ...prev,
      {
        id: `tier_${Date.now()}_${prev.length + 1}`,
        name: 'New Tier Pass',
        price: 0,
        capacity: 100,
        sold: 0,
        description: 'Tier description goes here.',
        perks: ['Standard Entry']
      }
    ]);
  };

  const removeTier = (id: string) => {
    if (ticketTiers.length <= 1) return;
    setTicketTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTier = (id: string, field: keyof TicketTier, value: any) => {
    setTicketTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const totalCap = ticketTiers.reduce((a, b) => a + (Number(b.capacity) || 0), 0);

    const newEvent: EventItem = {
      id: `evt_${Date.now()}`,
      title,
      slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
      tagline: tagline || title,
      description: description || 'Join us for this premier gathering.',
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      bannerUrl,
      date,
      time,
      endDate: endDate || date,
      endTime: endTime || '06:00 PM',
      locationType,
      venueName: locationType === 'online' ? 'Online' : venueName,
      address: locationType === 'online' ? '' : address,
      city: locationType === 'online' ? 'Virtual' : city,
      virtualLink: locationType !== 'venue' ? virtualLink : undefined,
      organizerName,
      organizerEmail,
      organizerPhone,
      organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      status: 'published',
      featured: true,
      totalCapacity: totalCap || 250,
      dressCode,
      ticketTiers,
      agenda: [
        { time: '09:00 AM', title: 'Check-in & Welcome Reception' },
        { time: '10:30 AM', title: 'Main Keynote Session' },
        { time: '01:00 PM', title: 'Networking Lunch' }
      ]
    };

    onCreateEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative bg-[#111111] text-[#E0E0E0] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#2A2A2A] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#0D0D0D] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D1B12] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Create New Event & RSVP Hub</h3>
              <p className="text-xs text-[#888888]">Configure event details, ticket tiers & WhatsApp gateway</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#1A1A1A] hover:bg-[#262626] text-[#AAAAAA] hover:text-white border border-[#2E2E2E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm bg-[#111111]">
          {/* Basic Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#888888] flex items-center gap-1.5">
              <span>1. Basic Information</span>
            </h4>

            <div>
              <label className="block font-semibold text-[#CCCCCC] mb-1">Event Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. NextGen FinTech Forum & VIP Networking Gala 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#CCCCCC] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#181818] text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#CCCCCC] mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Where visionary founders and investors meet"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#CCCCCC] mb-1">Full Description</label>
              <textarea
                rows={3}
                placeholder="Describe your event, highlights, dress code, guest speakers, and unique experiences..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none font-light"
              />
            </div>

            {/* Event Cover Banner Selector & Uploader */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-[#CCCCCC]">Event Cover Banner</label>
                <div className="flex items-center gap-1 bg-[#161616] p-1 rounded-xl border border-[#2A2A2A]">
                  <button
                    type="button"
                    onClick={() => setBannerTab('upload')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      bannerTab === 'upload'
                        ? 'bg-[#D4AF37] text-black font-semibold shadow-sm'
                        : 'text-[#999999] hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerTab('preset')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      bannerTab === 'preset'
                        ? 'bg-[#D4AF37] text-black font-semibold shadow-sm'
                        : 'text-[#999999] hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerTab('url')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      bannerTab === 'url'
                        ? 'bg-[#D4AF37] text-black font-semibold shadow-sm'
                        : 'text-[#999999] hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    URL
                  </button>
                </div>
              </div>

              {/* Upload Tab View */}
              {bannerTab === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group ${
                      isDragging
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.01]'
                        : 'border-[#333333] hover:border-[#D4AF37]/60 bg-[#151515] hover:bg-[#181818]'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#1F1D15] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
                        {isUploading ? (
                          <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
                        ) : (
                          <Upload className="w-6 h-6 text-[#D4AF37]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          <span className="text-[#D4AF37] font-semibold">Click to upload banner</span> or drag and drop
                        </p>
                        <p className="text-xs text-[#777777] mt-0.5">
                          PNG, JPG, WebP, SVG (Recommended 1920×1080 or 16:9 ratio)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Presets Tab View */}
              {bannerTab === 'preset' && (
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_BANNERS.map((banner, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setBannerUrl(banner);
                        setBannerFileName('');
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer ${
                        bannerUrl === banner
                          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={banner} alt={`Banner ${i}`} className="w-full h-full object-cover" />
                      {bannerUrl === banner && (
                        <div className="absolute inset-0 bg-[#D4AF37]/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-black drop-shadow font-bold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* URL Tab View */}
              {bannerTab === 'url' && (
                <div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={bannerUrl}
                    onChange={(e) => {
                      setBannerUrl(e.target.value);
                      setBannerFileName('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white text-xs placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                  <p className="text-[11px] text-[#777777] mt-1">Direct image URL will be loaded live across tickets and passes.</p>
                </div>
              )}

              {/* Live Banner Preview Card */}
              {bannerUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-[#2A2A2A] bg-[#0A0A0A] aspect-[21/9] sm:aspect-[24/9] shadow-lg group">
                  <img
                    src={bannerUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-mono uppercase tracking-wider">
                        Active Banner
                      </span>
                      {bannerFileName && (
                        <span className="text-[11px] text-white/90 truncate max-w-[200px]">
                          {bannerFileName}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black text-white hover:text-[#D4AF37] border border-white/20 text-xs font-medium backdrop-blur-md transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date & Location */}
          <div className="space-y-4 pt-4 border-t border-[#222222]">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#888888]">
              2. Date, Time & Venue
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#CCCCCC] mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#CCCCCC] mb-1">Start Time *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 09:00 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#CCCCCC] mb-1">Event Format</label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as LocationType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  <option value="venue" className="bg-[#181818] text-white">In-Person Venue</option>
                  <option value="online" className="bg-[#181818] text-white">Virtual / Online Only</option>
                  <option value="hybrid" className="bg-[#181818] text-white">Hybrid (Both)</option>
                </select>
              </div>

              {locationType !== 'online' ? (
                <>
                  <div>
                    <label className="block font-semibold text-[#CCCCCC] mb-1">Venue Name</label>
                    <input
                      type="text"
                      placeholder="e.g. The Glasshouse Arena"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#CCCCCC] mb-1">City / Region</label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, CA"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#CCCCCC] mb-1">Virtual Stream / Meet Link</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/xyz or https://stream.eventpulse.io/..."
                    value={virtualLink}
                    onChange={(e) => setVirtualLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Ticket Tiers Section */}
          <div className="space-y-4 pt-4 border-t border-[#222222]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#888888]">
                3. Ticket Tiers & Pricing
              </h4>
              <button
                type="button"
                onClick={addTicketTier}
                className="flex items-center gap-1 text-xs font-mono font-bold text-[#D4AF37] hover:text-[#E5C158] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-3">
              {ticketTiers.map((tier, idx) => (
                <div
                  key={tier.id}
                  className="p-4 bg-[#161616] rounded-2xl border border-[#262626] space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-white text-xs">Tier #{idx + 1}</span>
                    {ticketTiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTier(tier.id)}
                        className="text-[#EF4444] hover:text-[#F87171] p-1 cursor-pointer"
                        title="Delete Tier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#888888] mb-1">Tier Name *</label>
                      <input
                        type="text"
                        required
                        value={tier.name}
                        onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] text-white focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#888888] mb-1">Price ($) (0 = Free)</label>
                      <input
                        type="number"
                        min="0"
                        value={tier.price}
                        onChange={(e) => updateTier(tier.id, 'price', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#888888] mb-1">Max Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={tier.capacity}
                        onChange={(e) => updateTier(tier.id, 'capacity', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Organizer Details */}
          <div className="space-y-4 pt-4 border-t border-[#222222]">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#888888]">
              4. Organizer & WhatsApp Broadcast Sender
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#888888] mb-1">Organizer Name</label>
                <input
                  type="text"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#888888] mb-1">Organizer Email</label>
                <input
                  type="email"
                  value={organizerEmail}
                  onChange={(e) => setOrganizerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#888888] mb-1">Sender WhatsApp Phone</label>
                <input
                  type="tel"
                  value={organizerPhone}
                  onChange={(e) => setOrganizerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[#222222] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#262626] text-[#CCCCCC] border border-[#2E2E2E] font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] hover:from-[#E5C158] hover:to-[#BFA03B] text-black font-bold shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Publish Event & Open RSVP</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
