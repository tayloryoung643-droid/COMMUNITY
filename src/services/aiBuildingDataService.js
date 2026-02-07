import { supabase } from '../lib/supabase'

/**
 * AI Building Data Service
 *
 * Fetches ALL building data for the AI Assistant to have complete context.
 * This data is fetched fresh on each AI query to ensure accuracy.
 */

/**
 * Fetch ALL building data for AI context
 * @param {string} buildingId - Building UUID
 * @returns {Promise<Object>} Complete building data for AI context
 */
export async function fetchAllBuildingData(buildingId) {
  if (!buildingId) {
    console.warn('[aiBuildingDataService] No buildingId provided')
    return null
  }

  console.log('[aiBuildingDataService] Fetching ALL data for buildingId:', buildingId)

  try {
    // Fetch all data in parallel for performance
    const [
      buildingResult,
      residentsResult,
      packagesResult,
      eventsResult,
      messagesResult,
      faqsResult,
      bulletinResult,
      communityPostsResult,
      elevatorBookingsResult,
    ] = await Promise.all([
      // 1. Building Info
      fetchBuildingInfo(buildingId),

      // 2. All Residents
      fetchAllResidents(buildingId),

      // 3. All Packages
      fetchAllPackages(buildingId),

      // 4. All Events
      fetchAllEvents(buildingId),

      // 5. All Messages
      fetchAllMessages(buildingId),

      // 6. All FAQs
      fetchAllFaqs(buildingId),

      // 7. All Bulletin Listings
      fetchAllBulletinListings(buildingId),

      // 8. Community Posts
      fetchAllCommunityPosts(buildingId),

      // 9. Elevator Bookings
      fetchElevatorBookings(buildingId),
    ])

    // Debug logging
    console.log('[aiBuildingDataService] Fetched data summary:')
    console.log('  - Building:', buildingResult?.name || 'Not found')
    console.log('  - Residents:', residentsResult?.length || 0)
    console.log('  - Packages:', packagesResult?.length || 0)
    console.log('  - Events:', eventsResult?.length || 0)
    console.log('  - Messages:', messagesResult?.length || 0)
    console.log('  - FAQs:', faqsResult?.length || 0)
    console.log('  - Bulletin listings:', bulletinResult?.length || 0)
    console.log('  - Community posts:', communityPostsResult?.length || 0)

    // Log all residents for debugging
    if (residentsResult && residentsResult.length > 0) {
      console.log('[aiBuildingDataService] ALL Residents:')
      residentsResult.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.full_name} - Unit ${r.unit_number} - ${r.email}`)
      })
    }

    return {
      building: buildingResult,
      residents: residentsResult,
      packages: packagesResult,
      events: eventsResult,
      messages: messagesResult,
      faqs: faqsResult,
      bulletinListings: bulletinResult,
      communityPosts: communityPostsResult,
      elevatorBookings: elevatorBookingsResult,
      fetchedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('[aiBuildingDataService] Error fetching data:', error)
    return null
  }
}

/**
 * Fetch building information
 */
async function fetchBuildingInfo(buildingId) {
  try {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', buildingId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[aiBuildingDataService] Error fetching building:', error)
    return null
  }
}

/**
 * Fetch ALL residents with full details
 */
async function fetchAllResidents(buildingId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, phone, unit_number, role, created_at, is_verified, avatar_url')
      .eq('building_id', buildingId)
      .eq('role', 'resident')
      .order('unit_number', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[aiBuildingDataService] Error fetching residents:', error)
    return []
  }
}

/**
 * Fetch ALL packages (pending and picked up)
 */
async function fetchAllPackages(buildingId) {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false })
      .limit(100) // Last 100 packages for context

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[aiBuildingDataService] Error fetching packages:', error)
    return []
  }
}

/**
 * Fetch ALL events (upcoming and past)
 */
async function fetchAllEvents(buildingId) {
  try {
    // Fetch events
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('building_id', buildingId)
      .order('start_time', { ascending: true })

    if (error) throw error
    if (!events || events.length === 0) return []

    // Fetch RSVP counts for each event
    const eventIds = events.map(e => e.id)
    const { data: rsvps } = await supabase
      .from('event_rsvps')
      .select('event_id, status')
      .in('event_id', eventIds)

    // Count RSVPs by event
    const rsvpCounts = {}
    ;(rsvps || []).forEach(rsvp => {
      if (!rsvpCounts[rsvp.event_id]) {
        rsvpCounts[rsvp.event_id] = { going: 0, maybe: 0, total: 0 }
      }
      if (rsvp.status === 'going') rsvpCounts[rsvp.event_id].going++
      if (rsvp.status === 'maybe') rsvpCounts[rsvp.event_id].maybe++
      rsvpCounts[rsvp.event_id].total++
    })

    // Attach RSVP counts to events
    return events.map(event => ({
      ...event,
      rsvp_count: rsvpCounts[event.id]?.going || 0,
      rsvp_maybe: rsvpCounts[event.id]?.maybe || 0,
    }))
  } catch (error) {
    console.error('[aiBuildingDataService] Error fetching events:', error)
    return []
  }
}

/**
 * Fetch ALL messages
 */
async function fetchAllMessages(buildingId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:from_user_id(full_name, unit_number), recipient:to_user_id(full_name, unit_number)')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false })
      .limit(50) // Last 50 messages for context

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[aiBuildingDataService] Error fetching messages:', error)
    return []
  }
}

/**
 * Fetch ALL FAQs
 */
async function fetchAllFaqs(buildingId) {
  try {
    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .eq('building_id', buildingId)
      .order('category', { ascending: true })
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[aiBuildingDataService] Error fetching FAQs:', error)
    return []
  }
}

/**
 * Fetch ALL bulletin listings
 */
async function fetchAllBulletinListings(buildingId) {
  try {
    const { data, error } = await supabase
      .from('bulletin_listings')
      .select('*, author:author_id(full_name, unit_number)')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[aiBuildingDataService] Error fetching bulletin listings:', error)
    return []
  }
}

/**
 * Fetch ALL community posts
 */
async function fetchAllCommunityPosts(buildingId) {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, author:author_id(full_name, unit_number)')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[aiBuildingDataService] Error fetching community posts:', error)
    return []
  }
}

/**
 * Fetch elevator bookings
 */
async function fetchElevatorBookings(buildingId) {
  try {
    const { data, error } = await supabase
      .from('elevator_bookings')
      .select('*, user:user_id(full_name, unit_number)')
      .eq('building_id', buildingId)
      .order('start_time', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    // Table might not exist
    return []
  }
}

/**
 * Format building data into a string for AI context
 * @param {Object} data - Building data from fetchAllBuildingData
 * @param {Object} manager - Manager info
 * @returns {string} Formatted context string for AI
 */
export function formatBuildingDataForAI(data, manager) {
  if (!data) return ''

  const { building, residents, packages, events, messages, faqs, bulletinListings, communityPosts, elevatorBookings } = data

  let context = `
=== COMPLETE BUILDING DATA (Real-time as of ${new Date().toLocaleString()}) ===

BUILDING INFORMATION:
- Name: ${building?.name || 'Unknown'}
- Address: ${building?.address || 'Not specified'}
- Total Units: ${building?.total_units || 'Unknown'}
- Total Floors: ${building?.total_floors || 'Unknown'}
- Access Code: ${building?.access_code || 'Not set'}
- Manager: ${manager?.name || 'Unknown'}
`

  // Residents Section - LIST ALL RESIDENTS
  context += `
RESIDENTS (${residents.length} total joined the building):
`
  if (residents.length === 0) {
    context += '- No residents have joined yet\n'
  } else {
    // Group by verified status
    const verified = residents.filter(r => r.is_verified)
    const unverified = residents.filter(r => !r.is_verified)

    context += `- Verified: ${verified.length}, Pending verification: ${unverified.length}\n`

    // COMPLETE LIST OF ALL RESIDENTS
    context += '\n*** COMPLETE LIST OF ALL RESIDENTS ***\n'
    residents.forEach((r, index) => {
      const joinDate = new Date(r.created_at).toLocaleDateString()
      context += `${index + 1}. ${r.full_name || 'Unknown'} - Unit ${r.unit_number || 'TBD'} - Email: ${r.email || 'N/A'} - Joined: ${joinDate}${r.is_verified ? ' [verified]' : ' [pending]'}\n`
    })

    // Also show sorted by join date (newest first)
    const sortedByDate = [...residents].sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    )

    context += '\nResidents by Join Date (newest first):\n'
    sortedByDate.forEach((r, index) => {
      const joinDate = new Date(r.created_at).toLocaleDateString()
      context += `${index + 1}. ${r.full_name || 'Unknown'} (Unit ${r.unit_number || 'TBD'}) - joined ${joinDate}\n`
    })
  }

  // Packages Section
  const pendingPackages = packages.filter(p => p.status === 'pending')
  const pickedUpPackages = packages.filter(p => p.status === 'picked_up')
  const overdueThreshold = Date.now() - (48 * 60 * 60 * 1000)
  const overduePackages = pendingPackages.filter(p =>
    new Date(p.created_at || p.arrival_date).getTime() < overdueThreshold
  )

  context += `
PACKAGES:
- Total pending: ${pendingPackages.length}
- Overdue (48+ hours): ${overduePackages.length}
- Recently picked up: ${pickedUpPackages.length}
`

  if (pendingPackages.length > 0) {
    context += '\nPending Packages:\n'
    pendingPackages.forEach(p => {
      const arrivalDate = new Date(p.created_at || p.arrival_date).toLocaleDateString()
      const isOverdue = new Date(p.created_at || p.arrival_date).getTime() < overdueThreshold
      context += `  - Unit ${p.unit_number || 'Unknown'}: ${p.carrier || 'Unknown carrier'}${p.tracking_number ? ` (#${p.tracking_number})` : ''} - arrived ${arrivalDate}${isOverdue ? ' [OVERDUE]' : ''}\n`
    })
  }

  // Events Section
  const now = new Date()
  const upcomingEvents = events.filter(e => new Date(e.start_time) >= now)
  const pastEvents = events.filter(e => new Date(e.start_time) < now)

  context += `
EVENTS:
- Upcoming events: ${upcomingEvents.length}
- Past events: ${pastEvents.length}
`

  if (upcomingEvents.length > 0) {
    context += '\nUpcoming Events:\n'
    upcomingEvents.slice(0, 10).forEach(e => {
      const eventDate = new Date(e.start_time)
      const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      const timeStr = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      context += `  - ${e.title}: ${dateStr} at ${timeStr}${e.location ? ` (${e.location})` : ''} - ${e.rsvp_count || 0} RSVPs\n`
    })
  }

  // Messages Section
  const unreadMessages = messages.filter(m => !m.is_read)

  context += `
MESSAGES:
- Unread messages: ${unreadMessages.length}
- Recent messages: ${messages.length}
`

  if (unreadMessages.length > 0) {
    context += '\nUnread Messages:\n'
    unreadMessages.slice(0, 5).forEach(m => {
      const date = new Date(m.created_at).toLocaleString()
      const sender = m.sender?.full_name || 'Unknown'
      const unit = m.sender?.unit_number ? ` (Unit ${m.sender.unit_number})` : ''
      context += `  - From ${sender}${unit} (${date}): "${m.content?.substring(0, 100)}${m.content?.length > 100 ? '...' : ''}"\n`
    })
  }

  // FAQs Section
  if (faqs.length > 0) {
    context += `
BUILDING FAQs (${faqs.length} items):
`
    const categories = [...new Set(faqs.map(f => f.category))]
    categories.forEach(cat => {
      const catFaqs = faqs.filter(f => f.category === cat)
      context += `\n${cat}:\n`
      catFaqs.forEach(f => {
        context += `  Q: ${f.question}\n`
        context += `  A: ${f.answer}\n\n`
      })
    })
  }

  // Bulletin Board Section
  if (bulletinListings.length > 0) {
    const activeListings = bulletinListings.filter(l => l.status === 'active')
    context += `
BULLETIN BOARD LISTINGS (${activeListings.length} active):
`
    activeListings.slice(0, 10).forEach(l => {
      const author = l.author?.full_name || 'Anonymous'
      const unit = l.author?.unit_number ? ` (Unit ${l.author.unit_number})` : ''
      context += `  - ${l.title || 'Untitled'} by ${author}${unit}: ${l.description?.substring(0, 100) || 'No description'}${l.price ? ` - $${l.price}` : ''}\n`
    })
  }

  // Community Posts Section
  if (communityPosts.length > 0) {
    context += `
RECENT COMMUNITY POSTS (${communityPosts.length}):
`
    communityPosts.slice(0, 5).forEach(p => {
      const author = p.author?.full_name || 'Anonymous'
      const date = new Date(p.created_at).toLocaleDateString()
      context += `  - ${author} (${date}): "${p.content?.substring(0, 100)}${p.content?.length > 100 ? '...' : ''}"\n`
    })
  }

  // Elevator Bookings Section
  if (elevatorBookings.length > 0) {
    const futureBookings = elevatorBookings.filter(b => new Date(b.start_time) >= now)
    if (futureBookings.length > 0) {
      context += `
UPCOMING ELEVATOR BOOKINGS (${futureBookings.length}):
`
      futureBookings.slice(0, 5).forEach(b => {
        const date = new Date(b.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        const startTime = new Date(b.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        const endTime = new Date(b.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        const user = b.user?.full_name || 'Unknown'
        const unit = b.user?.unit_number ? ` (Unit ${b.user.unit_number})` : ''
        context += `  - ${date}, ${startTime}-${endTime}: ${user}${unit}${b.purpose ? ` - ${b.purpose}` : ''}\n`
      })
    }
  }

  return context
}
