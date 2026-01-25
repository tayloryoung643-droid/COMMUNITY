// Supabase Edge Function: generate-home-brief
// Deploy with: supabase functions deploy generate-home-brief
//
// This function generates a personalized home brief for a resident.
// It fetches building activity data and uses AI to create context-aware messaging.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HomeBrief {
  home_context: {
    line1: string
    line2: string | null
  }
  momentum: {
    joiners_7d: number
    line: string | null
  }
  card_ranking: string[]
  generated_at: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the JWT and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get request body
    const { building_id } = await req.json()

    if (!building_id) {
      return new Response(
        JSON.stringify({ error: 'Missing building_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch all building signals in parallel
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const next30d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const [
      packagesResult,
      eventsResult,
      postsResult,
      bulletinResult,
      joinersResult,
      engagementResult
    ] = await Promise.all([
      // Packages for this building (pending)
      supabase
        .from('packages')
        .select('id, carrier, status, created_at')
        .eq('building_id', building_id)
        .eq('status', 'pending'),

      // Events (today and upcoming 30 days)
      supabase
        .from('events')
        .select('id, title, start_time, category')
        .eq('building_id', building_id)
        .gte('start_time', today)
        .lte('start_time', next30d)
        .order('start_time', { ascending: true }),

      // Community posts (last 24h)
      supabase
        .from('posts')
        .select('id, type, created_at')
        .eq('building_id', building_id)
        .gte('created_at', last24h),

      // Bulletin board items (last 7 days and active)
      supabase
        .from('listings')
        .select('id, category, created_at')
        .eq('building_id', building_id)
        .gte('created_at', last7d),

      // New joiners count via RPC (aggregated only, no user identifiers)
      supabase
        .rpc('get_building_joiner_counts', { p_building_id: building_id })
        .single(),

      // User's recent engagement (last 30 days)
      supabase
        .from('engagement_events')
        .select('event_type, entity_type, topic, created_at')
        .eq('user_id', user.id)
        .eq('building_id', building_id)
        .gte('created_at', last7d)
        .order('created_at', { ascending: false })
        .limit(100)
    ])

    // Extract joiner counts from RPC result (safe fallback if RPC fails)
    const joiners7d = joinersResult.data?.joiners_last_7d_count || 0
    const joiners24h = joinersResult.data?.joiners_last_24h_count || 0

    // Build activity summary
    const activity = {
      packages_pending: packagesResult.data?.length || 0,
      events_today: eventsResult.data?.filter(e => e.start_time?.startsWith(today)).length || 0,
      events_this_week: eventsResult.data?.length || 0,
      posts_last_24h: postsResult.data?.length || 0,
      bulletin_items_7d: bulletinResult.data?.length || 0,
      joiners_last_24h: joiners24h,
      joiners_last_7d: joiners7d
    }

    // Generate context lines (line1 only - momentum handled separately)
    const contextLines = generateContextLines(activity)

    // Generate momentum line (only if joiners > 0)
    const momentumLine = joiners7d > 0
      ? `${joiners7d} new resident${joiners7d === 1 ? '' : 's'} joined this week.`
      : null

    // Calculate card ranking based on activity and engagement
    const cardRanking = calculateCardRanking(activity, engagementResult.data || [])

    // Build the brief with momentum object
    const brief: HomeBrief = {
      home_context: {
        line1: contextLines.line1,
        line2: contextLines.line2
      },
      momentum: {
        joiners_7d: joiners7d,
        line: momentumLine
      },
      card_ranking: cardRanking,
      generated_at: now
    }

    // Save the brief to the database
    const { error: saveError } = await supabase.rpc('save_home_brief', {
      p_user_id: user.id,
      p_building_id: building_id,
      p_brief_json: brief
    })

    if (saveError) {
      console.error('Failed to save brief:', saveError)
    }

    return new Response(
      JSON.stringify(brief),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateContextLines(activity: Record<string, number>): { line1: string; line2: string | null } {
  const parts: string[] = []

  // Build activity-based line
  if (activity.events_today > 0) {
    parts.push(`${activity.events_today} event${activity.events_today > 1 ? 's' : ''} today`)
  }

  if (activity.packages_pending > 0) {
    parts.push(`${activity.packages_pending} package${activity.packages_pending > 1 ? 's' : ''} waiting`)
  }

  if (activity.posts_last_24h > 0) {
    parts.push(`${activity.posts_last_24h} new post${activity.posts_last_24h > 1 ? 's' : ''} from neighbors`)
  }

  if (activity.bulletin_items_7d > 0 && parts.length < 2) {
    parts.push(`${activity.bulletin_items_7d} new listing${activity.bulletin_items_7d > 1 ? 's' : ''} this week`)
  }

  let line1: string
  if (parts.length === 0) {
    const quietLines = [
      'A peaceful day in the building.',
      'Nothing urgent today. Enjoy the calm.',
      'All quiet on the home front.'
    ]
    line1 = quietLines[Math.floor(Math.random() * quietLines.length)]
  } else if (parts.length === 1) {
    line1 = parts[0] + '.'
  } else {
    line1 = parts.slice(0, 2).join(' · ')
  }

  // Build momentum line (joiners)
  let line2: string | null = null
  if (activity.joiners_last_7d > 0) {
    line2 = `${activity.joiners_last_7d} new resident${activity.joiners_last_7d > 1 ? 's' : ''} joined this week.`
  }

  return { line1, line2 }
}

function calculateCardRanking(
  activity: Record<string, number>,
  engagement: Array<{ event_type: string; entity_type: string | null }>
): string[] {
  // Default ranking
  const ranking = ['packages', 'events', 'community', 'bulletin']

  // Score each card type based on activity and engagement
  const scores: Record<string, number> = {
    packages: activity.packages_pending * 10,
    events: activity.events_today * 8 + activity.events_this_week * 2,
    community: activity.posts_last_24h * 5,
    bulletin: activity.bulletin_items_7d * 3
  }

  // Boost based on user engagement patterns
  engagement.forEach(e => {
    if (e.entity_type === 'package' || e.event_type === 'package_open') scores.packages += 2
    if (e.entity_type === 'event' || e.event_type === 'event_rsvp') scores.events += 2
    if (e.entity_type === 'post' || e.event_type === 'post_open') scores.community += 2
    if (e.entity_type === 'bulletin' || e.event_type === 'bulletin_open') scores.bulletin += 2
  })

  // Sort by score descending
  return ranking.sort((a, b) => scores[b] - scores[a])
}
