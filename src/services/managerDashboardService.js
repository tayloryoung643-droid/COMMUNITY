import { supabase } from '../lib/supabase'

/**
 * Manager Dashboard Service
 *
 * This service implements a demo gate pattern:
 * - Demo users get hardcoded demo data (unchanged from before)
 * - Real users get data from Supabase based on their building_id
 */

// ============================================================
// DEMO MODE DETECTION
// ============================================================

/**
 * Determines if a user should see demo data
 * Uses explicit checks - not localStorage or route-based
 */
export function getIsDemoUser(userProfile, isDemoMode) {
  // Check the isDemoMode flag from AuthContext (set during loginAsDemo)
  if (isDemoMode === true) return true

  // Check the is_demo field on the user profile (from database)
  if (userProfile?.is_demo === true) return true

  // Check for known demo user IDs
  const DEMO_USER_IDS = ['demo-manager-id', 'demo-resident-id']
  if (userProfile?.id && DEMO_USER_IDS.includes(userProfile.id)) return true

  return false
}

// ============================================================
// DEMO DATA - Exact same data as before, just moved here
// ============================================================

export function loadDemoDashboardData() {
  return {
    building: {
      id: 'demo-building-id',
      name: 'The Paramount',
      code: 'PARA123',
      address: '123 Demo Street, San Francisco, CA 94102',
      totalUnits: 50,
      totalFloors: 12,
    },
    manager: {
      id: 'demo-manager-id',
      name: 'Taylor Young',
      email: 'taylor@paramount.com',
    },
    stats: {
      residentsJoined: 34,
      totalResidents: 50,
      packagesPending: 12,
      packagesOverdue: 3,
      eventsThisWeek: 3,
      nextEvent: 'Wine Social',
      unreadMessages: 2,
      newMessagesToday: 1,
    },
    recentActivity: [
      {
        id: 1,
        text: 'Sarah from 1201 joined the app',
        time: '2 min ago',
        type: 'resident_joined',
        color: 'green',
        navTarget: 'residents',
        detail: 'Sarah Mitchell - Unit 1201'
      },
      {
        id: 2,
        text: 'New package logged for Unit 805',
        time: '15 min ago',
        type: 'package',
        color: 'blue',
        navTarget: 'packages',
        detail: 'Amazon package - Michael Chen'
      },
      {
        id: 3,
        text: 'Message from Unit 402',
        time: '1 hour ago',
        type: 'message',
        color: 'purple',
        navTarget: 'messages',
        detail: 'Question about parking permit'
      },
      {
        id: 4,
        text: '5 RSVPs for Wine & Cheese Social',
        time: '2 hours ago',
        type: 'event_rsvp',
        color: 'pink',
        navTarget: 'calendar',
        detail: 'Total 18 attendees'
      },
      {
        id: 5,
        text: 'Maintenance request resolved - Unit 1102',
        time: '3 hours ago',
        type: 'maintenance',
        color: 'green',
        navTarget: 'messages',
        detail: 'Plumbing issue fixed'
      }
    ],
    upcomingEvents: [
      {
        id: 1,
        title: 'Wine & Cheese Social',
        date: 'Friday, Jan 17',
        time: '7:00 PM',
        location: 'Rooftop Lounge',
        rsvps: 18
      },
      {
        id: 2,
        title: 'Building Maintenance',
        date: 'Saturday, Jan 18',
        time: '9:00 AM - 12:00 PM',
        location: 'All Common Areas',
        type: 'maintenance'
      },
      {
        id: 3,
        title: 'Yoga in the Park',
        date: 'Sunday, Jan 19',
        time: '10:00 AM',
        location: 'Courtyard',
        rsvps: 8
      }
    ],
    notifications: [
      { id: 1, type: 'message', title: 'New message from Sarah Mitchell', subtitle: 'Unit 1201', time: '2 min ago', unread: true },
      { id: 2, type: 'package', title: 'Package logged for Unit 805', subtitle: 'Amazon - Large box', time: '15 min ago', unread: true },
      { id: 3, type: 'elevator', title: 'Alex Rivera requested elevator booking', subtitle: 'Moving out - Jan 20', time: '1 hour ago', unread: true },
      { id: 4, type: 'event', title: '5 new RSVPs for Wine & Cheese Social', subtitle: 'Total: 18 attendees', time: '2 hours ago', unread: false },
      { id: 5, type: 'maintenance', title: 'Maintenance request from Unit 402', subtitle: 'Plumbing issue', time: '3 hours ago', unread: false },
      { id: 6, type: 'resident', title: 'New resident joined', subtitle: 'Sarah from Unit 1201', time: '4 hours ago', unread: false }
    ],
    isLoaded: true,
    isEmpty: false,
  }
}

// ============================================================
// REAL DATA LOADING - Fetches from Supabase
// ============================================================

/**
 * Load real dashboard data for an authenticated manager
 */
export async function loadRealDashboardData(userId) {
  // Log for debugging (dev only)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Dashboard] Loading real data for userId:', userId)
  }

  try {
    // First, get the user's profile with their building
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*, buildings(*)')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('[Dashboard] Error loading user profile:', userError)
      return { isLoaded: true, isEmpty: true, error: userError.message }
    }

    // Check if user has a building association
    if (!userProfile?.building_id || !userProfile?.buildings) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Dashboard] User has no building association')
      }
      return {
        isLoaded: true,
        isEmpty: true,
        building: null,
        manager: {
          id: userProfile.id,
          name: userProfile.full_name || 'Property Manager',
          email: userProfile.email,
        },
      }
    }

    const buildingId = userProfile.building_id
    const building = userProfile.buildings

    if (process.env.NODE_ENV === 'development') {
      console.log('[Dashboard] Resolved buildingId:', buildingId)
    }

    // Fetch all dashboard data in parallel
    const [
      residentsResult,
      packagesResult,
      eventsResult,
      messagesResult,
    ] = await Promise.all([
      // Get residents count
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('building_id', buildingId)
        .eq('role', 'resident'),

      // Get pending packages
      supabase
        .from('packages')
        .select('*')
        .eq('building_id', buildingId)
        .eq('status', 'pending'),

      // Get upcoming events (next 7 days)
      supabase
        .from('events')
        .select('*')
        .eq('building_id', buildingId)
        .gte('date', new Date().toISOString().split('T')[0])
        .lte('date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(5),

      // Get unread messages
      supabase
        .from('messages')
        .select('*')
        .eq('building_id', buildingId)
        .eq('is_read', false),
    ])

    // Calculate stats
    const residentsJoined = residentsResult.count || 0
    const totalResidents = building.total_units || 50
    const pendingPackages = packagesResult.data || []
    const upcomingEvents = eventsResult.data || []
    const unreadMessages = messagesResult.data || []

    // Calculate overdue packages (older than 48 hours)
    const overdueThreshold = Date.now() - (48 * 60 * 60 * 1000)
    const packagesOverdue = pendingPackages.filter(pkg =>
      new Date(pkg.arrival_date).getTime() < overdueThreshold
    ).length

    // Format upcoming events for display
    const formattedEvents = upcomingEvents.map(event => {
      const eventDate = new Date(event.date)
      const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'long' })
      const monthDay = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      return {
        id: event.id,
        title: event.title,
        date: `${dayName}, ${monthDay}`,
        time: event.start_time || 'TBD',
        location: event.location || 'TBD',
        rsvps: event.rsvp_count || 0,
        type: event.type,
      }
    })

    return {
      building: {
        id: building.id,
        name: building.name,
        code: building.access_code,
        address: building.address,
        totalUnits: building.total_units || totalResidents,
        totalFloors: building.total_floors,
      },
      manager: {
        id: userProfile.id,
        name: userProfile.full_name || 'Property Manager',
        email: userProfile.email,
      },
      stats: {
        residentsJoined,
        totalResidents,
        packagesPending: pendingPackages.length,
        packagesOverdue,
        eventsThisWeek: upcomingEvents.length,
        nextEvent: upcomingEvents[0]?.title || null,
        unreadMessages: unreadMessages.length,
        newMessagesToday: unreadMessages.filter(m =>
          new Date(m.created_at).toDateString() === new Date().toDateString()
        ).length,
      },
      recentActivity: [], // Real activity would come from an activity log table
      upcomingEvents: formattedEvents,
      notifications: [], // Real notifications would come from a notifications table
      isLoaded: true,
      isEmpty: false,
    }
  } catch (error) {
    console.error('[Dashboard] Error loading real data:', error)
    return {
      isLoaded: true,
      isEmpty: true,
      error: error.message,
    }
  }
}

// ============================================================
// MAIN LOADER - Uses demo gate to choose data source
// ============================================================

/**
 * Main dashboard data loader
 * This is the single entry point - it routes to demo or real based on user
 */
export async function loadDashboardData(userProfile, isDemoMode, userId) {
  const isDemo = getIsDemoUser(userProfile, isDemoMode)

  if (process.env.NODE_ENV === 'development') {
    console.log('[Dashboard] isDemo:', isDemo, 'userId:', userId)
  }

  if (isDemo) {
    // Demo users always get the same demo data
    return loadDemoDashboardData()
  } else {
    // Real users get data from Supabase
    return loadRealDashboardData(userId)
  }
}
