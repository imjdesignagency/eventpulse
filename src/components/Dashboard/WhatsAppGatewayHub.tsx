import React, { useState } from 'react';
import { 
  Send, 
  Check, 
  CheckCheck, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink, 
  Zap, 
  Copy,
  AlertCircle,
  HelpCircle,
  Key,
  Smartphone,
  Globe
} from 'lucide-react';
import { 
  EventItem, 
  Guest, 
  WhatsAppConfig, 
  WhatsAppTemplate, 
  WhatsAppMessageLog, 
  WhatsAppDeliveryStatus,
  WhatsAppProvider
} from '../../types';
import { interpolateTemplate, sendBatchWhatsApp, generateWhatsAppUrl, testWhatsAppConnection } from '../../services/whatsappService';

interface WhatsAppGatewayHubProps {
  activeEvent?: EventItem;
  guests: Guest[];
  whatsappConfig: WhatsAppConfig;
  whatsappTemplates: WhatsAppTemplate[];
  whatsappLogs: WhatsAppMessageLog[];
  onUpdateConfig: (config: WhatsAppConfig) => void;
  onUpdateTemplates: (templates: WhatsAppTemplate[]) => void;
  onAddLogs: (logs: WhatsAppMessageLog[]) => void;
  onUpdateGuestStatuses: (updates: { id: string; status: WhatsAppDeliveryStatus }[]) => void;
}

export const WhatsAppGatewayHub: React.FC<WhatsAppGatewayHubProps> = ({
  activeEvent,
  guests,
  whatsappConfig,
  whatsappTemplates,
  whatsappLogs,
  onUpdateConfig,
  onUpdateTemplates,
  onAddLogs,
  onUpdateGuestStatuses,
}) => {
  const [activeTab, setActiveTab] = useState<'campaign' | 'config' | 'templates' | 'logs'>('config');

  // Campaign State
  const [selectedTemplateId, setSelectedTemplateId] = useState(whatsappTemplates[0]?.id || 'tpl_invitation_vip');
  const [targetAudience, setTargetAudience] = useState<'all' | 'pending' | 'attending' | 'vip' | 'unsent'>('all');
  const [isBlasting, setIsBlasting] = useState(false);
  const [blastProgress, setBlastProgress] = useState({ completed: 0, total: 0 });
  const [previewGuestIndex, setPreviewGuestIndex] = useState(0);

  // Gateway Config State
  const [configForm, setConfigForm] = useState<WhatsAppConfig>(whatsappConfig);
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; latency: number; message: string; details?: string } | null>(null);
  const [saveConfigSuccess, setSaveConfigSuccess] = useState(false);

  // Template Editing State
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate>(whatsappTemplates[0] || {
    id: 'tpl_default',
    name: 'Standard Invitation',
    category: 'invitation',
    bodyText: 'Hello {{guest_name}}! You are invited to {{event_title}}. RSVP: {{rsvp_link}}',
    includeQrButton: true,
  });
  const [saveTemplateSuccess, setSaveTemplateSuccess] = useState(false);

  const eventGuests = activeEvent ? guests.filter((g) => g.eventId === activeEvent.id) : guests;

  // Target Guests for campaign
  const targetGuests = eventGuests.filter((g) => {
    if (targetAudience === 'pending') return g.rsvpStatus === 'pending' || g.rsvpStatus === 'invited';
    if (targetAudience === 'attending') return g.rsvpStatus === 'attending' || g.rsvpStatus === 'checked_in';
    if (targetAudience === 'vip') return g.vip;
    if (targetAudience === 'unsent') return g.whatsappDeliveryStatus === 'none' || g.whatsappDeliveryStatus === 'failed';
    return true;
  });

  const selectedTemplate = whatsappTemplates.find((t) => t.id === selectedTemplateId) || whatsappTemplates[0] || editingTemplate;
  const samplePreviewGuest: Guest = targetGuests[previewGuestIndex] || eventGuests[0] || {
    id: 'sample',
    eventId: activeEvent?.id || 'event',
    name: 'Alex Rivera',
    phone: configForm.senderPhoneNumber || '+1234567890',
    email: 'alex@example.com',
    ticketTierId: 'tier_ga',
    ticketTierName: 'VIP Pass',
    rsvpStatus: 'pending',
    plusGuests: 1,
    inviteCode: 'EVP-SAMPLE-99',
    qrCodeData: '{}',
    vip: true,
    tableNumber: 'Table 1',
    whatsappDeliveryStatus: 'none',
    reminderSentCount: 0,
  };

  const defaultEvent: EventItem = activeEvent || {
    id: 'evt_sample',
    title: 'Your Event Title',
    slug: 'your-event',
    tagline: 'Event Tagline',
    description: 'Event Description',
    category: 'Technology & AI',
    tags: ['VIP'],
    bannerUrl: '',
    date: new Date().toISOString().split('T')[0],
    time: '07:00 PM',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '11:00 PM',
    locationType: 'venue',
    venueName: 'The Grand Hall',
    address: '123 Luxury Blvd',
    city: 'Metropolis',
    organizerName: 'Event Organizer',
    organizerEmail: 'host@event.com',
    organizerPhone: configForm.senderPhoneNumber,
    organizerAvatar: '',
    ticketTiers: [],
    status: 'published',
    featured: true,
    totalCapacity: 200,
  };

  const previewMessageText = interpolateTemplate(selectedTemplate.bodyText, samplePreviewGuest, defaultEvent);

  // Test Connection Ping with Real API Caller
  const handleTestConnection = async () => {
    setTestingPing(true);
    setPingResult(null);

    const result = await testWhatsAppConnection(configForm);
    setPingResult(result);
    setTestingPing(false);

    if (result.success) {
      const updated = {
        ...configForm,
        isConnected: true,
        lastTestedAt: new Date().toISOString(),
      };
      setConfigForm(updated);
      onUpdateConfig(updated);
    }
  };

  const handleSaveConfig = () => {
    onUpdateConfig(configForm);
    setSaveConfigSuccess(true);
    setTimeout(() => setSaveConfigSuccess(false), 2500);
  };

  // Launch Bulk WhatsApp Blast
  const handleStartCampaign = async () => {
    if (targetGuests.length === 0 || !activeEvent) return;
    setIsBlasting(true);
    setBlastProgress({ completed: 0, total: targetGuests.length });

    const newLogs: WhatsAppMessageLog[] = [];
    const guestStatusUpdates: { id: string; status: WhatsAppDeliveryStatus }[] = [];

    await sendBatchWhatsApp(
      targetGuests,
      activeEvent,
      selectedTemplate,
      configForm,
      (completed, total, latestLog) => {
        setBlastProgress({ completed, total });
        newLogs.push(latestLog);
        guestStatusUpdates.push({ id: latestLog.guestId, status: latestLog.status });
      }
    );

    onAddLogs(newLogs);
    onUpdateGuestStatuses(guestStatusUpdates);
    setIsBlasting(false);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = whatsappTemplates.map((t) => (t.id === editingTemplate.id ? editingTemplate : t));
    onUpdateTemplates(updated);
    setSaveTemplateSuccess(true);
    setTimeout(() => setSaveTemplateSuccess(false), 2000);
  };

  const insertVariable = (varName: string) => {
    setEditingTemplate((prev) => ({
      ...prev,
      bodyText: prev.bodyText + ` {{${varName}}}`,
    }));
  };

  return (
    <div className="space-y-6 text-[#E0E0E0]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-serif font-bold text-white">WhatsApp API & Gateway Hub</h2>
            <span
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                configForm.isConnected
                  ? 'bg-[#102418] text-[#4ADE80] border-[#1E4D30]'
                  : 'bg-[#2B1717] text-[#F87171] border-[#4A2020]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${configForm.isConnected ? 'bg-[#4ADE80] animate-pulse' : 'bg-[#F87171]'}`} />
              <span>{configForm.isConnected ? 'Gateway Connected' : 'Configuration Required'}</span>
            </span>
          </div>
          <p className="text-xs text-[#888888] font-light mt-0.5">
            Configure real WhatsApp API credentials (Meta Cloud API, Twilio, UltraMsg, Evolution API, Custom REST API) and send invitations with scannable QR passes.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-[#161616] p-1 rounded-xl border border-[#2E2E2E] text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'config' ? 'bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm' : 'text-[#888888] hover:text-white'
            }`}
          >
            API Credentials
          </button>

          <button
            onClick={() => setActiveTab('campaign')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'campaign' ? 'bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm' : 'text-[#888888] hover:text-white'
            }`}
          >
            Bulk Dispatch
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'templates' ? 'bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm' : 'text-[#888888] hover:text-white'
            }`}
          >
            Templates
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'logs' ? 'bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm' : 'text-[#888888] hover:text-white'
            }`}
          >
            Live Logs ({whatsappLogs.length})
          </button>
        </div>
      </div>

      {/* TAB 1: API CREDENTIALS & GATEWAY CONFIG */}
      {activeTab === 'config' && (
        <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#222222] shadow-xl max-w-4xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
            <div>
              <h3 className="font-serif font-bold text-base text-white">Live WhatsApp Gateway Credentials</h3>
              <p className="text-xs text-[#888888] font-light">Select your service provider and insert your live API keys</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingPing}
                className="px-4 py-2 rounded-xl bg-[#1E1A11] hover:bg-[#282215] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
                <span>{testingPing ? 'Verifying API...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] text-black font-bold text-xs shadow-md cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>

          {saveConfigSuccess && (
            <div className="p-3.5 rounded-2xl bg-[#102418] border border-[#1E4D30] text-[#4ADE80] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>WhatsApp API configurations updated and saved securely!</span>
            </div>
          )}

          {pingResult && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-fadeIn ${
                pingResult.success
                  ? 'bg-[#102418] border-[#1E4D30] text-[#4ADE80]'
                  : 'bg-[#2B1717] border-[#4A2020] text-[#F87171]'
              }`}
            >
              {pingResult.success ? (
                <ShieldCheck className="w-5 h-5 text-[#4ADE80] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#F87171] flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-0.5">
                <p className="font-bold font-mono">
                  {pingResult.success ? `Connection Successful (${pingResult.latency}ms)` : 'Connection Test Failed'}
                </p>
                <p className="opacity-90 font-light">{pingResult.message}</p>
                {pingResult.details && (
                  <p className="text-[11px] font-mono opacity-75 pt-1">{pingResult.details}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-5 text-xs sm:text-sm">
            {/* Gateway Provider Selector */}
            <div>
              <label className="block font-semibold text-[#CCCCCC] mb-1.5">WhatsApp Provider Protocol</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'whatsapp_cloud_api' as WhatsAppProvider,
                    name: 'Meta Cloud API',
                    desc: 'Official WhatsApp Business Cloud (Graph v20.0)',
                  },
                  {
                    id: 'twilio' as WhatsAppProvider,
                    name: 'Twilio WhatsApp',
                    desc: 'Programmable SMS & WhatsApp messaging',
                  },
                  {
                    id: 'ultramsg' as WhatsAppProvider,
                    name: 'UltraMsg Gateway',
                    desc: 'WhatsApp REST API & Instance Bot',
                  },
                  {
                    id: 'evolution_api' as WhatsAppProvider,
                    name: 'Evolution / Baileys',
                    desc: 'Self-hosted open-source WhatsApp gateway',
                  },
                  {
                    id: 'custom_gateway' as WhatsAppProvider,
                    name: 'Custom REST Endpoint',
                    desc: 'Forward payloads to your custom API / Webhook',
                  },
                  {
                    id: 'simulator' as WhatsAppProvider,
                    name: 'Sandbox Simulator',
                    desc: 'Local testing with realistic delivery receipts',
                  },
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setConfigForm({ ...configForm, provider: prov.id })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      configForm.provider === prov.id
                        ? 'border-[#D4AF37] bg-[#1D1B13] text-[#D4AF37]'
                        : 'border-[#262626] bg-[#161616] hover:bg-[#1C1C1C] text-[#AAAAAA]'
                    }`}
                  >
                    <div className="font-bold text-white text-xs">{prov.name}</div>
                    <div className="text-[11px] text-[#777777] mt-0.5 font-light">{prov.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Provider Specific Input Fields */}
            {configForm.provider === 'whatsapp_cloud_api' && (
              <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] font-mono">
                  <Key className="w-4 h-4" />
                  <span>Meta WhatsApp Cloud API Configuration</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Phone Number ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 109823485712938"
                      value={configForm.phoneNumberId || ''}
                      onChange={(e) => setConfigForm({ ...configForm, phoneNumberId: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white font-mono text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#777777] mt-1 block">From Meta Developers App Dashboard</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">WhatsApp Business Account ID (WABA ID)</label>
                    <input
                      type="text"
                      placeholder="e.g. 293847291029384"
                      value={configForm.wabaId || ''}
                      onChange={(e) => setConfigForm({ ...configForm, wabaId: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white font-mono text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Permanent System User Access Token (Bearer)</label>
                  <input
                    type="password"
                    placeholder="EAA..."
                    value={configForm.apiToken}
                    onChange={(e) => setConfigForm({ ...configForm, apiToken: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white font-mono text-xs focus:border-[#D4AF37] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#777777] mt-1 block">Requires `whatsapp_business_messaging` and `whatsapp_business_management` permissions</span>
                </div>
              </div>
            )}

            {configForm.provider === 'twilio' && (
              <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] font-mono">
                  <Smartphone className="w-4 h-4" />
                  <span>Twilio WhatsApp Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Account SID</label>
                    <input
                      type="text"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={configForm.accountSid || ''}
                      onChange={(e) => setConfigForm({ ...configForm, accountSid: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white font-mono text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Auth Token / Secret</label>
                    <input
                      type="password"
                      placeholder="Your Twilio Auth Token"
                      value={configForm.apiToken}
                      onChange={(e) => setConfigForm({ ...configForm, apiToken: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white font-mono text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {configForm.provider === 'ultramsg' && (
              <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] font-mono">
                  <Key className="w-4 h-4" />
                  <span>UltraMsg Instance Settings</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Instance ID</label>
                    <input
                      type="text"
                      placeholder="instance12345"
                      value={configForm.instanceId || ''}
                      onChange={(e) => setConfigForm({ ...configForm, instanceId: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white font-mono text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Instance Token</label>
                    <input
                      type="password"
                      placeholder="UltraMsg Token"
                      value={configForm.apiToken}
                      onChange={(e) => setConfigForm({ ...configForm, apiToken: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white font-mono text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {(configForm.provider === 'custom_gateway' || configForm.provider === 'evolution_api') && (
              <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] font-mono">
                  <Globe className="w-4 h-4" />
                  <span>Custom Endpoint API</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">API Endpoint URL</label>
                  <input
                    type="url"
                    placeholder="https://your-api-gateway.com/v1/whatsapp/send"
                    value={configForm.apiUrl}
                    onChange={(e) => setConfigForm({ ...configForm, apiUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white font-mono text-xs focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">API Key / Bearer Secret</label>
                  <input
                    type="password"
                    placeholder="Secret Key"
                    value={configForm.apiToken}
                    onChange={(e) => setConfigForm({ ...configForm, apiToken: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white font-mono text-xs focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Sender Identity Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#CCCCCC] mb-1">Sender WhatsApp Phone Number</label>
                <input
                  type="text"
                  placeholder="+14155552671"
                  value={configForm.senderPhoneNumber}
                  onChange={(e) => setConfigForm({ ...configForm, senderPhoneNumber: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white font-mono text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#CCCCCC] mb-1">Sender Brand Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Luminary Events VIP Concierge"
                  value={configForm.senderName}
                  onChange={(e) => setConfigForm({ ...configForm, senderName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            {/* Inbound Webhook Callback URL */}
            <div className="p-4 bg-[#161616] rounded-2xl border border-[#262626] space-y-2">
              <span className="text-xs font-bold text-white font-mono">Inbound Status & Delivery Webhook URL</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/api/webhooks/whatsapp`}
                  className="w-full bg-[#181818] border border-[#2E2E2E] rounded-xl p-2 font-mono text-xs text-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/whatsapp`)
                  }
                  className="p-2 bg-[#222222] hover:bg-[#2A2A2A] text-white border border-[#333333] rounded-xl cursor-pointer"
                  title="Copy Webhook URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-[#888888] font-light">
                Paste this webhook into your Meta App or Gateway console to receive real-time delivery and read confirmations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BULK CAMPAIGN DISPATCHER */}
      {activeTab === 'campaign' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-[#111111] p-6 rounded-3xl border border-[#222222] shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#888888]">
                1. Target Audience & Template
              </span>
              <span className="text-xs font-bold text-[#D4AF37] font-mono">
                {targetGuests.length} Guests Targeted
              </span>
            </div>

            {/* Target Audience Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#CCCCCC]">Target Audience Filter</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'All Guests', count: eventGuests.length },
                  { id: 'pending', label: 'Pending RSVPs', count: eventGuests.filter((g) => g.rsvpStatus === 'pending').length },
                  { id: 'attending', label: 'Confirmed Attendees', count: eventGuests.filter((g) => g.rsvpStatus === 'attending').length },
                  { id: 'vip', label: 'VIP Guests Only', count: eventGuests.filter((g) => g.vip).length },
                  { id: 'unsent', label: 'Unsent Messages', count: eventGuests.filter((g) => g.whatsappDeliveryStatus === 'none').length },
                ].map((aud) => (
                  <button
                    key={aud.id}
                    onClick={() => setTargetAudience(aud.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      targetAudience === aud.id
                        ? 'border-[#D4AF37] bg-[#1D1B13] text-[#D4AF37] font-bold shadow-sm'
                        : 'border-[#262626] bg-[#161616] hover:bg-[#1E1E1E] text-[#AAAAAA]'
                    }`}
                  >
                    <div className="text-xs">{aud.label}</div>
                    <div className="text-lg font-mono font-bold mt-0.5 text-white">{aud.count}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#CCCCCC]">Select WhatsApp Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#2E2E2E] bg-[#181818] text-white text-xs font-medium focus:border-[#D4AF37] focus:outline-none cursor-pointer"
              >
                {whatsappTemplates.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#181818]">
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Automated Reminders Engine Switch */}
            <div className="p-4 bg-[#161616] rounded-2xl border border-[#262626] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-bold text-white">Automated Reminder Engine</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configForm.autoRemindersEnabled}
                    onChange={(e) =>
                      onUpdateConfig({ ...configForm, autoRemindersEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4ADE80]"></div>
                </label>
              </div>
              <p className="text-[11px] text-[#888888] font-light">
                Automatically triggers personalized WhatsApp reminders 48h, 24h, and 2h before the event begins.
              </p>
            </div>

            {/* Progress Bar when Blasting */}
            {isBlasting && (
              <div className="p-4 bg-[#1D1B13] rounded-2xl border border-[#D4AF37]/40 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-bold text-[#D4AF37]">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching WhatsApp Bulk Queue via {configForm.provider}...</span>
                  </span>
                  <span className="font-mono">
                    {blastProgress.completed} / {blastProgress.total} (
                    {Math.round((blastProgress.completed / blastProgress.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-[#2A2410] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D4AF37] h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(blastProgress.completed / blastProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#262626] flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-[#777777] uppercase font-mono">Gateway Protocol</span>
                <p className="text-xs font-mono font-bold text-white uppercase">{configForm.provider}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={generateWhatsAppUrl(samplePreviewGuest.phone, previewMessageText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-[#CCCCCC] border border-[#2E2E2E] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Direct Chat Test</span>
                </a>

                <button
                  disabled={isBlasting || targetGuests.length === 0}
                  onClick={handleStartCampaign}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] text-black font-bold text-xs sm:text-sm shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isBlasting
                      ? 'Sending Invites...'
                      : `Dispatch to ${targetGuests.length} Guest${targetGuests.length === 1 ? '' : 's'}`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Phone Simulator */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-sm mb-2 px-1 text-xs">
              <span className="font-mono font-bold text-[#888888] uppercase tracking-wider">Live WhatsApp Phone Preview</span>
              {targetGuests.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewGuestIndex((prev) => Math.max(0, prev - 1))}
                    disabled={previewGuestIndex === 0}
                    className="px-2 py-0.5 bg-[#1E1E1E] text-white border border-[#333333] rounded disabled:opacity-30 cursor-pointer"
                  >
                    ←
                  </button>
                  <span className="font-mono text-[11px] text-[#AAAAAA]">
                    {previewGuestIndex + 1}/{targetGuests.length}
                  </span>
                  <button
                    onClick={() => setPreviewGuestIndex((prev) => Math.min(targetGuests.length - 1, prev + 1))}
                    disabled={previewGuestIndex === targetGuests.length - 1}
                    className="px-2 py-0.5 bg-[#1E1E1E] text-white border border-[#333333] rounded disabled:opacity-30 cursor-pointer"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {/* Smartphone Shell */}
            <div className="w-full max-w-sm bg-[#050505] rounded-[38px] p-3 shadow-2xl border-4 border-[#222222] text-white">
              <div className="w-24 h-4 bg-[#141414] rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#050505] border border-[#2A2A2A]" />
              </div>

              <div className="bg-[#0b141a] rounded-[28px] overflow-hidden flex flex-col h-[520px]">
                <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-slate-700/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#AA8B2E] flex items-center justify-center text-black font-serif font-bold text-xs">
                      EP
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-white leading-none">
                          {configForm.senderName || 'Event Gateway'}
                        </span>
                        <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                      </div>
                      <span className="text-[10px] text-[#4ADE80]">Official WhatsApp API</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#0b141a]">
                  <div className="ml-auto max-w-[90%] bg-[#005c4b] rounded-2xl rounded-tr-none p-3.5 text-white shadow-md text-xs space-y-2 leading-relaxed">
                    <div className="whitespace-pre-line text-[11px]">
                      {previewMessageText}
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-emerald-200/80 pt-1 border-t border-emerald-600/50">
                      <span>{selectedTemplate.footerText || 'EventPulse Gateway'}</span>
                      <div className="flex items-center gap-1">
                        <span>10:42 AM</span>
                        <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#888888]">
              Select Template to Edit
            </span>

            <div className="space-y-2">
              {whatsappTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setEditingTemplate(t)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    editingTemplate.id === t.id
                      ? 'border-[#D4AF37] bg-[#1D1B13] text-[#D4AF37] shadow-sm'
                      : 'border-[#262626] bg-[#141414] hover:bg-[#1A1A1A] text-[#CCCCCC]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{t.name}</span>
                    <span className="px-2 py-0.5 rounded bg-[#1F1F1F] text-[#D4AF37] border border-[#333333] text-[10px] font-mono uppercase font-bold">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888888] line-clamp-2 mt-1 font-light">{t.bodyText}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-[#111111] p-6 rounded-3xl border border-[#222222] shadow-xl space-y-4">
            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                <div>
                  <h3 className="font-serif font-bold text-sm text-white">Editing: {editingTemplate.name}</h3>
                  <p className="text-xs text-[#888888] font-light">Use variable chips to personalize text per attendee</p>
                </div>
                {saveTemplateSuccess && (
                  <span className="px-3 py-1 rounded-full bg-[#102418] text-[#4ADE80] border border-[#1E4D30] text-xs font-mono font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Template Name</label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2E2E2E] text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Variable Injector Chips */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#CCCCCC]">
                  Insert Variables:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'guest_name',
                    'event_title',
                    'date',
                    'time',
                    'venue',
                    'ticket_tier',
                    'table_number',
                    'ticket_code',
                    'rsvp_link',
                    'qr_pass_url',
                    'dress_code',
                  ].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-2.5 py-1 rounded-lg bg-[#1D1B13] hover:bg-[#282415] text-[#D4AF37] font-mono text-[11px] font-bold border border-[#D4AF37]/40 transition-colors cursor-pointer"
                    >
                      +{`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Message Body</label>
                <textarea
                  rows={8}
                  value={editingTemplate.bodyText}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, bodyText: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-[#181818] border border-[#2E2E2E] text-white font-mono text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#262626] flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8B2E] text-black font-bold text-xs shadow-md cursor-pointer"
                >
                  Save Changes to Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-[#111111] rounded-3xl border border-[#222222] shadow-xl overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
            <div>
              <h3 className="font-serif font-bold text-base text-white">Live WhatsApp Message Log Stream</h3>
              <p className="text-xs text-[#888888] font-light">
                Outbound invitations, tickets, reminder delivery receipts
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#D4AF37]">
              {whatsappLogs.length} Total Transmissions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161616] text-[#888888] font-mono font-bold uppercase tracking-wider border-b border-[#262626]">
                <tr>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Event & Type</th>
                  <th className="py-3 px-4">Message Content Preview</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sent At</th>
                  <th className="py-3 px-4">Delivered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202020] text-[#CCCCCC]">
                {whatsappLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#161616] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{log.guestName}</div>
                      <div className="text-[10px] text-[#777777] font-mono">{log.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white truncate max-w-[140px]">{log.eventTitle}</div>
                      <div className="text-[10px] text-[#D4AF37] font-mono uppercase font-semibold">{log.templateCategory}</div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-[11px] text-[#888888] line-clamp-2 max-w-xs font-light">{log.messageContent}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono border ${
                          log.status === 'read'
                            ? 'bg-[#142633] text-[#53BDEB] border-[#1D4A66]'
                            : log.status === 'delivered'
                            ? 'bg-[#102418] text-[#4ADE80] border-[#1E4D30]'
                            : log.status === 'sent'
                            ? 'bg-[#1A1A1A] text-[#D4AF37] border-[#D4AF37]/30'
                            : 'bg-[#1C1C1C] text-[#888888] border-[#333333]'
                        }`}
                      >
                        {log.status === 'read' ? <CheckCheck className="w-3 h-3 text-[#53BDEB]" /> : null}
                        {log.status === 'delivered' ? <CheckCheck className="w-3 h-3 text-[#4ADE80]" /> : null}
                        {log.status === 'sent' ? <Check className="w-3 h-3 text-[#D4AF37]" /> : null}
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#888888] font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-[#888888] font-mono text-[10px]">
                      {log.deliveredAt ? new Date(log.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
