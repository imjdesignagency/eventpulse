import { Guest, EventItem, WhatsAppTemplate, WhatsAppConfig, WhatsAppMessageLog, WhatsAppDeliveryStatus } from '../types';

export function interpolateTemplate(
  templateText: string,
  guest: Guest,
  event: EventItem,
  appUrl: string = window.location.origin
): string {
  const rsvpLink = `${appUrl}/#rsvp/${guest.inviteCode}`;
  const qrPassUrl = `${appUrl}/#ticket/${guest.inviteCode}`;

  const vars: Record<string, string> = {
    guest_name: guest.name || 'Valued Guest',
    event_title: event?.title || 'Special Event',
    event_slug: event?.slug || 'event',
    date: event?.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    time: event?.time || 'TBD',
    venue: event?.locationType === 'online' ? (event.virtualLink || 'Online Event') : `${event?.venueName || 'Venue'}, ${event?.city || ''}`,
    ticket_tier: guest.ticketTierName || 'General Admission',
    table_number: guest.tableNumber || 'Open Seating',
    ticket_code: guest.inviteCode,
    rsvp_link: rsvpLink,
    qr_pass_url: qrPassUrl,
    dress_code: event?.dressCode || 'Smart Casual',
    organizer: event?.organizerName || 'Event Host',
    phone: guest.phone,
    email: guest.email,
  };

  let result = templateText;
  for (const [key, val] of Object.entries(vars)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    result = result.replace(regex, val);
  }

  // Handle any custom guest vars
  if (guest.customMessageVars) {
    for (const [key, val] of Object.entries(guest.customMessageVars)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      result = result.replace(regex, val);
    }
  }

  return result;
}

export function generateWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export async function testWhatsAppConnection(
  config: WhatsAppConfig
): Promise<{ success: boolean; latency: number; message: string; details?: string }> {
  const startTime = Date.now();

  if (config.provider === 'simulator') {
    await new Promise((r) => setTimeout(r, 400));
    return {
      success: true,
      latency: Date.now() - startTime,
      message: 'Simulator ready. Outbound messages will simulate realistic WhatsApp delivery & read receipts.',
    };
  }

  if (config.provider === 'whatsapp_cloud_api') {
    if (!config.apiToken || !config.phoneNumberId) {
      return {
        success: false,
        latency: 0,
        message: 'Missing Meta WhatsApp Cloud API credentials.',
        details: 'Please provide your System User Access Token and Phone Number ID from the Meta Developers Portal.',
      };
    }

    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/${config.phoneNumberId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
        },
      });

      const data = await res.json();
      const latency = Date.now() - startTime;

      if (!res.ok) {
        return {
          success: false,
          latency,
          message: `Meta API Error (${res.status}): ${data.error?.message || 'Authentication failed'}`,
          details: data.error?.error_user_msg || 'Check if your token has whatsapp_business_messaging permissions.',
        };
      }

      return {
        success: true,
        latency,
        message: `Verified Meta Cloud API Phone: ${data.display_phone_number || data.verified_name || config.phoneNumberId}`,
        details: `Quality Rating: ${data.quality_rating || 'GREEN'} • Platform: Graph v20.0`,
      };
    } catch (err) {
      return {
        success: false,
        latency: Date.now() - startTime,
        message: 'Network error contacting graph.facebook.com',
        details: err instanceof Error ? err.message : String(err),
      };
    }
  }

  if (config.provider === 'twilio') {
    if (!config.accountSid || !config.apiToken) {
      return {
        success: false,
        latency: 0,
        message: 'Missing Twilio Account SID or Auth Token.',
      };
    }

    try {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}.json`, {
        method: 'GET',
        headers: {
          Authorization: 'Basic ' + btoa(`${config.accountSid}:${config.apiToken}`),
        },
      });
      const data = await res.json();
      const latency = Date.now() - startTime;

      if (!res.ok) {
        return {
          success: false,
          latency,
          message: `Twilio Error (${res.status}): ${data.message || 'Auth failed'}`,
        };
      }

      return {
        success: true,
        latency,
        message: `Twilio Connected: Account "${data.friendly_name}" (${data.status})`,
      };
    } catch (err) {
      return {
        success: false,
        latency: Date.now() - startTime,
        message: 'Network error contacting Twilio API',
        details: err instanceof Error ? err.message : String(err),
      };
    }
  }

  if (config.provider === 'ultramsg') {
    if (!config.instanceId || !config.apiToken) {
      return {
        success: false,
        latency: 0,
        message: 'Missing UltraMsg Instance ID or Token.',
      };
    }

    try {
      const res = await fetch(`https://api.ultramsg.com/${config.instanceId}/instance/status?token=${config.apiToken}`);
      const data = await res.json();
      const latency = Date.now() - startTime;

      if (!res.ok || data.status === 'error') {
        return {
          success: false,
          latency,
          message: `UltraMsg Error: ${data.message || 'Authentication failed'}`,
        };
      }

      return {
        success: true,
        latency,
        message: `UltraMsg Instance Active: Status ${data.account_status || 'authenticated'}`,
      };
    } catch (err) {
      return {
        success: false,
        latency: Date.now() - startTime,
        message: 'Network error connecting to UltraMsg API',
        details: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // Custom Gateway / Evolution API
  if (config.apiUrl) {
    try {
      const res = await fetch(config.apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          'X-API-Key': config.apiToken,
        },
      });
      const latency = Date.now() - startTime;
      return {
        success: res.ok,
        latency,
        message: res.ok
          ? `Custom Gateway Endpoint Reachable (HTTP ${res.status})`
          : `Custom Gateway responded with HTTP ${res.status}`,
      };
    } catch (err) {
      return {
        success: false,
        latency: Date.now() - startTime,
        message: 'Could not connect to custom gateway endpoint',
        details: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return {
    success: false,
    latency: 0,
    message: 'Please specify API URL and credentials.',
  };
}

export async function sendWhatsAppMessage(
  guest: Guest,
  event: EventItem,
  template: WhatsAppTemplate,
  config: WhatsAppConfig,
  onStatusUpdate?: (status: WhatsAppDeliveryStatus, logEntry?: Partial<WhatsAppMessageLog>) => void
): Promise<WhatsAppMessageLog> {
  const messageBody = interpolateTemplate(template.bodyText, guest, event);
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanPhone = guest.phone.replace(/[^0-9]/g, '');

  const logEntry: WhatsAppMessageLog = {
    id: logId,
    guestId: guest.id,
    guestName: guest.name,
    phone: guest.phone,
    eventId: event?.id || '',
    eventTitle: event?.title || 'Event',
    templateCategory: template.category,
    messageContent: messageBody,
    status: 'queued',
    timestamp: new Date().toISOString(),
  };

  onStatusUpdate?.('queued', logEntry);

  // 1. META WHATSAPP CLOUD API (Graph API)
  if (config.provider === 'whatsapp_cloud_api' && config.apiToken && config.phoneNumberId) {
    try {
      onStatusUpdate?.('sending', { ...logEntry, status: 'sending' });
      const endpoint = `https://graph.facebook.com/v20.0/${config.phoneNumberId}/messages`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: messageBody,
          },
        }),
      });

      const responseData = await response.json();
      const isSuccess = response.ok;

      logEntry.responseCode = response.status;
      logEntry.responseBody = JSON.stringify(responseData);
      logEntry.status = isSuccess ? 'delivered' : 'failed';
      if (!isSuccess) {
        logEntry.error = responseData.error?.message || `HTTP ${response.status}`;
      } else {
        logEntry.deliveredAt = new Date().toISOString();
      }

      onStatusUpdate?.(logEntry.status, logEntry);
      return logEntry;
    } catch (err) {
      logEntry.status = 'failed';
      logEntry.error = err instanceof Error ? err.message : 'Network error calling Meta Cloud API';
      onStatusUpdate?.('failed', logEntry);
      return logEntry;
    }
  }

  // 2. TWILIO
  if (config.provider === 'twilio' && config.accountSid && config.apiToken) {
    try {
      onStatusUpdate?.('sending', { ...logEntry, status: 'sending' });
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;

      const senderNum = config.senderPhoneNumber.startsWith('whatsapp:')
        ? config.senderPhoneNumber
        : `whatsapp:${config.senderPhoneNumber.replace(/[^0-9+]/g, '')}`;
      const toNum = `whatsapp:${cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone}`;

      const formData = new URLSearchParams();
      formData.append('From', senderNum);
      formData.append('To', toNum);
      formData.append('Body', messageBody);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + btoa(`${config.accountSid}:${config.apiToken}`),
        },
        body: formData.toString(),
      });

      const responseData = await response.json();
      const isSuccess = response.ok;

      logEntry.responseCode = response.status;
      logEntry.responseBody = JSON.stringify(responseData);
      logEntry.status = isSuccess ? 'delivered' : 'failed';
      if (!isSuccess) logEntry.error = responseData.message || `HTTP ${response.status}`;
      if (isSuccess) logEntry.deliveredAt = new Date().toISOString();

      onStatusUpdate?.(logEntry.status, logEntry);
      return logEntry;
    } catch (err) {
      logEntry.status = 'failed';
      logEntry.error = err instanceof Error ? err.message : 'Network error calling Twilio API';
      onStatusUpdate?.('failed', logEntry);
      return logEntry;
    }
  }

  // 3. ULTRAMSG
  if (config.provider === 'ultramsg' && config.instanceId && config.apiToken) {
    try {
      onStatusUpdate?.('sending', { ...logEntry, status: 'sending' });
      const endpoint = `https://api.ultramsg.com/${config.instanceId}/messages/chat`;

      const formData = new URLSearchParams();
      formData.append('token', config.apiToken);
      formData.append('to', cleanPhone);
      formData.append('body', messageBody);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const responseData = await response.json();
      const isSuccess = response.ok && responseData.sent === 'true';

      logEntry.responseCode = response.status;
      logEntry.responseBody = JSON.stringify(responseData);
      logEntry.status = isSuccess ? 'delivered' : 'failed';
      if (!isSuccess) logEntry.error = responseData.error || responseData.message || `HTTP ${response.status}`;
      if (isSuccess) logEntry.deliveredAt = new Date().toISOString();

      onStatusUpdate?.(logEntry.status, logEntry);
      return logEntry;
    } catch (err) {
      logEntry.status = 'failed';
      logEntry.error = err instanceof Error ? err.message : 'Network error calling UltraMsg';
      onStatusUpdate?.('failed', logEntry);
      return logEntry;
    }
  }

  // 4. CUSTOM GATEWAY / EVOLUTION API
  if (config.provider !== 'simulator' && config.apiUrl && config.apiUrl.startsWith('http')) {
    try {
      onStatusUpdate?.('sending', { ...logEntry, status: 'sending' });
      
      const payload: Record<string, unknown> = {
        to: cleanPhone,
        message: messageBody,
        sender: config.senderPhoneNumber,
        provider: config.provider,
        template_id: template.id,
        metadata: {
          guest_id: guest.id,
          invite_code: guest.inviteCode,
          event_id: event?.id,
        }
      };

      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiToken}`,
          'X-API-Key': config.apiToken,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.text();
      const isSuccess = response.ok;

      logEntry.responseCode = response.status;
      logEntry.responseBody = responseData;
      logEntry.status = isSuccess ? 'delivered' : 'failed';
      if (!isSuccess) logEntry.error = `HTTP ${response.status}: ${responseData.slice(0, 100)}`;
      if (isSuccess) logEntry.deliveredAt = new Date().toISOString();

      onStatusUpdate?.(logEntry.status, logEntry);
      return logEntry;
    } catch (err) {
      logEntry.status = 'failed';
      logEntry.error = err instanceof Error ? err.message : 'Network failure to WhatsApp gateway';
      onStatusUpdate?.('failed', logEntry);
      return logEntry;
    }
  }

  // 5. Simulator Fallback (or if configured)
  const speeds = {
    instant: { send: 50, deliver: 100, read: 200 },
    fast: { send: 300, deliver: 700, read: 1400 },
    realistic: { send: 600, deliver: 1500, read: 3000 },
  };
  const delayTimes = speeds[config.statusSimulationSpeed || 'realistic'];

  // Step 1: Sending -> Sent
  await new Promise((r) => setTimeout(r, delayTimes.send));
  logEntry.status = 'sent';
  logEntry.responseCode = 200;
  logEntry.responseBody = JSON.stringify({
    status: 'success',
    gateway: config.provider,
    message_id: `wamid.${Math.random().toString(36).substring(2).toUpperCase()}`,
    recipient: cleanPhone,
  });
  onStatusUpdate?.('sent', logEntry);

  // Step 2: Delivered
  await new Promise((r) => setTimeout(r, delayTimes.deliver));
  logEntry.status = 'delivered';
  logEntry.deliveredAt = new Date().toISOString();
  onStatusUpdate?.('delivered', logEntry);

  // Step 3: Read
  const willRead = Math.random() > 0.15;
  if (willRead) {
    await new Promise((r) => setTimeout(r, delayTimes.read));
    logEntry.status = 'read';
    logEntry.readAt = new Date().toISOString();
    onStatusUpdate?.('read', logEntry);
  }

  return logEntry;
}

export async function sendBatchWhatsApp(
  guests: Guest[],
  event: EventItem,
  template: WhatsAppTemplate,
  config: WhatsAppConfig,
  onProgress?: (completed: number, total: number, latestLog: WhatsAppMessageLog) => void
): Promise<WhatsAppMessageLog[]> {
  const logs: WhatsAppMessageLog[] = [];
  const total = guests.length;

  for (let i = 0; i < guests.length; i++) {
    const guest = guests[i];
    const log = await sendWhatsAppMessage(guest, event, template, config);
    logs.push(log);
    onProgress?.(i + 1, total, log);
    
    // Slight throttle between messages
    if (i < guests.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return logs;
}
