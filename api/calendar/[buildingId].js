import { createClient } from '@supabase/supabase-js';

// Try both env var names — VITE_ prefix is for Vite client, plain is for Vercel serverless
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function escapeIcsText(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function formatIcsDate(dateString) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { buildingId } = req.query;

  console.log('[calendar] Request for building:', buildingId);
  console.log('[calendar] Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING');
  console.log('[calendar] Has service role key:', !!supabaseKey);

  if (!supabaseUrl || !supabaseKey) {
    console.error('[calendar] Missing env vars — SUPABASE_URL:', !!supabaseUrl, 'SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!buildingId) {
    return res.status(400).json({ error: 'Building ID is required' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Fetch building name
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('name')
      .eq('id', buildingId)
      .single();

    console.log('[calendar] Building lookup:', building?.name || 'not found', buildingError?.message || 'ok');

    if (buildingError || !building) {
      return res.status(404).json({ error: 'Building not found' });
    }

    // Fetch all events for this building
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('building_id', buildingId)
      .order('start_time', { ascending: true });

    console.log('[calendar] Events found:', events?.length || 0, eventsError?.message || 'ok');

    if (eventsError) {
      console.error('[calendar] Error fetching events:', eventsError);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    const calName = escapeIcsText(`${building.name} Events`);

    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CommunityHQ//Events//EN',
      `X-WR-CALNAME:${calName}`,
      'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
      'METHOD:PUBLISH',
    ];

    for (const event of events || []) {
      const dtstart = formatIcsDate(event.start_time);
      if (!dtstart) continue;

      // Default end time: +1 hour if no end_time
      let dtend;
      if (event.end_time) {
        dtend = formatIcsDate(event.end_time);
      } else {
        const endDate = new Date(event.start_time);
        endDate.setHours(endDate.getHours() + 1);
        dtend = formatIcsDate(endDate.toISOString());
      }

      const uid = `event-${event.id}@communityhq.space`;

      ics.push('BEGIN:VEVENT');
      ics.push(`UID:${uid}`);
      ics.push(`DTSTART:${dtstart}`);
      if (dtend) ics.push(`DTEND:${dtend}`);
      ics.push(`SUMMARY:${escapeIcsText(event.title)}`);
      if (event.description) {
        ics.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
      }
      if (event.location) {
        ics.push(`LOCATION:${escapeIcsText(event.location)}`);
      }
      if (event.category) {
        ics.push(`CATEGORIES:${escapeIcsText(event.category)}`);
      }
      ics.push('END:VEVENT');
    }

    ics.push('END:VCALENDAR');

    const body = ics.join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(body);
  } catch (err) {
    console.error('[calendar] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
