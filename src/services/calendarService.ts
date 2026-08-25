import { EventItem } from '../types';

export function getGoogleCalendarUrl(event: EventItem): string {
  const startIso = new Date(`${event.date}T${formatTimeTo24(event.time)}`).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endIso = new Date(`${event.endDate || event.date}T${formatTimeTo24(event.endTime || '23:00')}`).toISOString().replace(/-|:|\.\d\d\d/g, '');
  
  const location = event.locationType === 'online' ? (event.virtualLink || 'Online') : `${event.venueName}, ${event.address}, ${event.city}`;
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startIso}/${endIso}`,
    details: `${event.tagline}\n\n${event.description}\n\nOrganized by: ${event.organizerName}`,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(event: EventItem) {
  const startStr = `${event.date.replace(/-/g, '')}T${formatTimeTo24(event.time).replace(/:/g, '')}00`;
  const endStr = `${(event.endDate || event.date).replace(/-/g, '')}T${formatTimeTo24(event.endTime || '23:00').replace(/:/g, '')}00`;
  const location = event.locationType === 'online' ? (event.virtualLink || 'Online Event') : `${event.venueName}, ${event.address}, ${event.city}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventPulse//Event Management Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}-${Date.now()}@eventpulse.io`,
    `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d\d\d/g, '')}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.tagline.replace(/\n/g, '\\n')}`,
    `LOCATION:${location.replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.slug || 'event'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatTimeTo24(timeStr: string): string {
  if (!timeStr) return '09:00:00';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return '09:00:00';
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
}
