import { Wine, Bell, ShoppingBag, Film, Users, Heart, Dumbbell, Wrench, Sparkles, PartyPopper, Coffee, Palette, TreeDeciduous, Music, Sun, BookOpen, Mic } from 'lucide-react'

// Demo attendee avatars
const avatars = {
  sarah: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  mike: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  emily: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  james: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  lisa: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  david: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  anna: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  staff: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
}

// Demo comments for select social events
const demoComments = {
  wineAndCheese: [
    {
      id: 1,
      author: 'Sarah',
      avatar: avatars.sarah,
      text: "Looking forward to this! Should be fun 🍷",
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      author: 'Mike',
      avatar: avatars.mike,
      text: "Anyone know if we need to bring our own glasses?",
      timestamp: '1 hour ago'
    },
    {
      id: 3,
      author: 'Emily',
      avatar: avatars.emily,
      text: "I'll be there a bit late but excited to meet everyone.",
      timestamp: '45 min ago'
    }
  ],
  movieNight: [
    {
      id: 1,
      author: 'James',
      avatar: avatars.james,
      text: "What movie are we watching?",
      timestamp: '3 hours ago'
    },
    {
      id: 2,
      author: 'Lisa',
      avatar: avatars.lisa,
      text: "Hopefully something good! Last month's pick was great.",
      timestamp: '2 hours ago'
    }
  ],
  valentines: [
    {
      id: 1,
      author: 'Anna',
      avatar: avatars.anna,
      text: "This sounds so fun! Is there a dress code?",
      timestamp: '5 hours ago'
    },
    {
      id: 2,
      author: 'David',
      avatar: avatars.david,
      text: "Can't wait to meet more neighbors!",
      timestamp: '3 hours ago'
    }
  ],
  poolParty: [
    {
      id: 1,
      author: 'Mike',
      avatar: avatars.mike,
      text: "Finally! Been waiting for pool season 🏊‍♂️",
      timestamp: '1 day ago'
    },
    {
      id: 2,
      author: 'Sarah',
      avatar: avatars.sarah,
      text: "Will there be food or should we bring snacks?",
      timestamp: '12 hours ago'
    },
    {
      id: 3,
      author: 'Emily',
      avatar: avatars.emily,
      text: "The DJ last year was amazing!",
      timestamp: '6 hours ago'
    }
  ],
  halloween: [
    {
      id: 1,
      author: 'James',
      avatar: avatars.james,
      text: "Already working on my costume! 🎃",
      timestamp: '2 days ago'
    },
    {
      id: 2,
      author: 'Lisa',
      avatar: avatars.lisa,
      text: "What are the prize categories this year?",
      timestamp: '1 day ago'
    }
  ],
  newYears: [
    {
      id: 1,
      author: 'Anna',
      avatar: avatars.anna,
      text: "Best way to ring in the new year! 🎉",
      timestamp: '1 week ago'
    },
    {
      id: 2,
      author: 'David',
      avatar: avatars.david,
      text: "The rooftop view of fireworks is unbeatable.",
      timestamp: '5 days ago'
    },
    {
      id: 3,
      author: 'Sarah',
      avatar: avatars.sarah,
      text: "Is it formal attire?",
      timestamp: '2 days ago'
    }
  ]
}

// Full events data with all details
export const eventsData = [
  // January 2026
  {
    id: 1,
    date: '2026-01-25',
    time: '7:00 PM',
    title: 'Wine & Cheese Social',
    description: 'Meet your neighbors over wine and cheese in the party room. Bring your favorite wine if you\'d like!',
    category: 'social',
    categoryLabel: 'Social',
    icon: Wine,
    iconClass: 'wine-icon',
    color: '#8b5cf6',
    subtitle: 'Jan 25 · 7:00 PM · Rooftop Lounge',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 12,
      avatars: [avatars.sarah, avatars.mike, avatars.emily, avatars.james, avatars.lisa]
    },
    comments: demoComments.wineAndCheese
  },
  {
    id: 2,
    date: '2026-01-28',
    time: '10:00 AM - 2:00 PM',
    title: 'Fire Alarm Testing',
    description: 'Annual fire alarm system testing. Expect intermittent alarms throughout the building.',
    category: 'maintenance',
    categoryLabel: 'Maintenance',
    icon: Bell,
    iconClass: 'maintenance-icon',
    color: '#f59e0b',
    subtitle: 'Jan 28 · 10:00 AM - 2:00 PM',
    actionRequired: false,
    affectedUnits: 'All units',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    }
  },
  // February 2026
  {
    id: 3,
    date: '2026-02-01',
    time: '9:00 AM',
    title: 'Farmers Market Saturday',
    description: 'Local vendors with fresh produce, baked goods, and artisan crafts.',
    category: 'social',
    categoryLabel: 'Social',
    icon: ShoppingBag,
    iconClass: 'market-icon',
    color: '#8b5cf6',
    subtitle: 'Feb 1 · 9:00 AM · Front Plaza',
    organizer: {
      name: 'Community Board',
      role: 'Resident Organization',
      avatar: avatars.anna
    },
    attendees: {
      count: 24,
      avatars: [avatars.emily, avatars.james, avatars.lisa, avatars.david, avatars.anna]
    },
    comments: []
  },
  {
    id: 4,
    date: '2026-02-08',
    time: '7:30 PM',
    title: 'Movie in the Park',
    description: 'Outdoor movie screening in the Courtyard. Popcorn provided!',
    category: 'social',
    categoryLabel: 'Social',
    icon: Film,
    iconClass: 'movie-icon',
    color: '#8b5cf6',
    subtitle: 'Feb 8 · 7:30 PM · Courtyard',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 18,
      avatars: [avatars.sarah, avatars.mike, avatars.james, avatars.lisa, avatars.anna]
    },
    comments: demoComments.movieNight
  },
  {
    id: 5,
    date: '2026-02-12',
    time: '6:00 PM',
    title: 'Building Town Hall',
    description: 'Monthly meeting to discuss building updates, financials, and resident concerns.',
    category: 'meeting',
    categoryLabel: 'Meeting',
    icon: Users,
    iconClass: 'community-icon',
    color: '#3b82f6',
    subtitle: 'Feb 12 · 6:00 PM · Community Room',
    organizer: {
      name: 'Board of Directors',
      role: 'Building Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 8,
      avatars: [avatars.david, avatars.james, avatars.sarah]
    },
    comments: []
  },
  {
    id: 6,
    date: '2026-02-14',
    time: '7:00 PM',
    title: "Valentine's Day Mixer",
    description: 'Singles and couples welcome! Appetizers and mocktails in the Rooftop Lounge.',
    category: 'social',
    categoryLabel: 'Social',
    icon: Heart,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'Feb 14 · 7:00 PM · Rooftop Lounge',
    organizer: {
      name: 'Social Committee',
      role: 'Resident Organization',
      avatar: avatars.lisa
    },
    attendees: {
      count: 22,
      avatars: [avatars.anna, avatars.david, avatars.emily, avatars.mike, avatars.sarah]
    },
    comments: demoComments.valentines
  },
  {
    id: 7,
    date: '2026-02-22',
    time: '8:00 AM',
    title: 'Yoga in the Garden',
    description: 'Free morning yoga class for all residents in the Rooftop Garden.',
    category: 'social',
    categoryLabel: 'Social',
    icon: Dumbbell,
    iconClass: 'fitness-icon',
    color: '#8b5cf6',
    subtitle: 'Feb 22 · 8:00 AM · Rooftop Garden',
    organizer: {
      name: 'Lisa M.',
      role: 'Resident Instructor',
      avatar: avatars.lisa
    },
    attendees: {
      count: 9,
      avatars: [avatars.sarah, avatars.emily, avatars.anna]
    },
    comments: []
  },
  // March 2026
  {
    id: 8,
    date: '2026-03-01',
    time: '9:00 AM - 12:00 PM',
    title: 'Water Shut-off Notice',
    description: 'Scheduled maintenance on water pipes. Please store water in advance.',
    category: 'maintenance',
    categoryLabel: 'Maintenance',
    icon: Wrench,
    iconClass: 'maintenance-icon',
    color: '#f59e0b',
    subtitle: 'Mar 1 · 9:00 AM - 12:00 PM · Floors 5-10',
    actionRequired: true,
    affectedUnits: 'Floors 5-10',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    }
  },
  {
    id: 9,
    date: '2026-03-08',
    time: '10:00 AM',
    title: 'Spring Cleaning Drive',
    description: 'Donate unwanted items in the Lobby. All donations go to local charities.',
    category: 'meeting',
    categoryLabel: 'Meeting',
    icon: Sparkles,
    iconClass: 'community-icon',
    color: '#3b82f6',
    subtitle: 'Mar 8 · 10:00 AM · Lobby',
    organizer: {
      name: 'Community Board',
      role: 'Resident Organization',
      avatar: avatars.anna
    },
    attendees: {
      count: 15,
      avatars: [avatars.mike, avatars.sarah, avatars.david]
    },
    comments: []
  },
  {
    id: 10,
    date: '2026-03-17',
    time: '6:00 PM',
    title: "St. Patrick's Day Party",
    description: 'Green beer, Irish music, and fun in the Rooftop Lounge!',
    category: 'social',
    categoryLabel: 'Social',
    icon: PartyPopper,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'Mar 17 · 6:00 PM · Rooftop Lounge',
    organizer: {
      name: 'Social Committee',
      role: 'Resident Organization',
      avatar: avatars.james
    },
    attendees: {
      count: 28,
      avatars: [avatars.mike, avatars.emily, avatars.james, avatars.lisa, avatars.david]
    },
    comments: []
  },
  {
    id: 11,
    date: '2026-03-22',
    time: '9:00 AM',
    title: 'Coffee & Conversation',
    description: 'Casual morning meetup in the Café Lounge. Coffee and pastries provided.',
    category: 'social',
    categoryLabel: 'Social',
    icon: Coffee,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'Mar 22 · 9:00 AM · Café Lounge',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 11,
      avatars: [avatars.sarah, avatars.anna, avatars.david]
    },
    comments: []
  },
  // April 2026
  {
    id: 12,
    date: '2026-04-05',
    time: '6:00 PM',
    title: 'Art Show & Gallery Night',
    description: 'Resident art exhibition in the Community Room. Wine and appetizers.',
    category: 'social',
    categoryLabel: 'Social',
    icon: Palette,
    iconClass: 'culture-icon',
    color: '#8b5cf6',
    subtitle: 'Apr 5 · 6:00 PM · Community Room',
    organizer: {
      name: 'Arts Committee',
      role: 'Resident Organization',
      avatar: avatars.emily
    },
    attendees: {
      count: 16,
      avatars: [avatars.emily, avatars.sarah, avatars.anna, avatars.lisa]
    },
    comments: []
  },
  {
    id: 13,
    date: '2026-04-12',
    time: '11:00 AM',
    title: 'Easter Egg Hunt',
    description: 'Fun for kids and families in the Courtyard!',
    category: 'social',
    categoryLabel: 'Social',
    icon: PartyPopper,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'Apr 12 · 11:00 AM · Courtyard',
    organizer: {
      name: 'Family Committee',
      role: 'Resident Organization',
      avatar: avatars.sarah
    },
    attendees: {
      count: 20,
      avatars: [avatars.sarah, avatars.mike, avatars.james, avatars.lisa]
    },
    comments: []
  },
  {
    id: 14,
    date: '2026-04-18',
    time: '8:00 AM - 5:00 PM',
    title: 'Elevator Maintenance',
    description: 'East elevator will be out of service for routine maintenance.',
    category: 'maintenance',
    categoryLabel: 'Maintenance',
    icon: Wrench,
    iconClass: 'maintenance-icon',
    color: '#f59e0b',
    subtitle: 'Apr 18 · 8:00 AM - 5:00 PM',
    actionRequired: false,
    affectedUnits: 'East tower',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    }
  },
  {
    id: 15,
    date: '2026-04-22',
    time: '10:00 AM',
    title: 'Earth Day Tree Planting',
    description: 'Help plant new trees in the Rooftop Garden!',
    category: 'social',
    categoryLabel: 'Social',
    icon: TreeDeciduous,
    iconClass: 'outdoor-icon',
    color: '#8b5cf6',
    subtitle: 'Apr 22 · 10:00 AM · Rooftop Garden',
    organizer: {
      name: 'Green Committee',
      role: 'Resident Organization',
      avatar: avatars.david
    },
    attendees: {
      count: 14,
      avatars: [avatars.david, avatars.emily, avatars.anna]
    },
    comments: []
  },
  // May 2026
  {
    id: 16,
    date: '2026-05-03',
    time: '7:00 PM',
    title: 'Live Jazz Night',
    description: 'Live jazz performance in the Rooftop Lounge.',
    category: 'social',
    categoryLabel: 'Social',
    icon: Music,
    iconClass: 'music-icon',
    color: '#8b5cf6',
    subtitle: 'May 3 · 7:00 PM · Rooftop Lounge',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 25,
      avatars: [avatars.sarah, avatars.mike, avatars.emily, avatars.james, avatars.lisa]
    },
    comments: []
  },
  {
    id: 17,
    date: '2026-05-05',
    time: '6:00 PM',
    title: 'Cinco de Mayo Fiesta',
    description: 'Tacos, margaritas, and music in the Courtyard!',
    category: 'social',
    categoryLabel: 'Social',
    icon: PartyPopper,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'May 5 · 6:00 PM · Courtyard',
    organizer: {
      name: 'Social Committee',
      role: 'Resident Organization',
      avatar: avatars.james
    },
    attendees: {
      count: 32,
      avatars: [avatars.james, avatars.lisa, avatars.david, avatars.anna, avatars.sarah]
    },
    comments: []
  },
  {
    id: 18,
    date: '2026-05-11',
    time: '11:00 AM',
    title: "Mother's Day Brunch",
    description: 'Special brunch for mothers in the Community Room.',
    category: 'social',
    categoryLabel: 'Social',
    icon: Heart,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'May 11 · 11:00 AM · Community Room',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 18,
      avatars: [avatars.sarah, avatars.emily, avatars.anna, avatars.lisa]
    },
    comments: []
  },
  {
    id: 19,
    date: '2026-05-14',
    time: '6:00 PM',
    title: 'Building Town Hall',
    description: 'Monthly meeting to discuss building updates and resident concerns.',
    category: 'meeting',
    categoryLabel: 'Meeting',
    icon: Users,
    iconClass: 'community-icon',
    color: '#3b82f6',
    subtitle: 'May 14 · 6:00 PM · Community Room',
    organizer: {
      name: 'Board of Directors',
      role: 'Building Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 10,
      avatars: [avatars.david, avatars.james, avatars.mike]
    },
    comments: []
  },
  {
    id: 20,
    date: '2026-05-20',
    time: '6:00 PM',
    title: 'Fire Safety Training',
    description: 'Learn fire safety procedures. Mandatory for floor wardens.',
    category: 'maintenance',
    categoryLabel: 'Maintenance',
    icon: Bell,
    iconClass: 'maintenance-icon',
    color: '#f59e0b',
    subtitle: 'May 20 · 6:00 PM · Lobby',
    actionRequired: true,
    affectedUnits: 'Floor wardens',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    }
  },
  {
    id: 21,
    date: '2026-05-26',
    time: '12:00 PM',
    title: 'Memorial Day BBQ',
    description: 'Annual Memorial Day cookout on the Rooftop. Burgers and hot dogs!',
    category: 'social',
    categoryLabel: 'Social',
    icon: Wine,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'May 26 · 12:00 PM · Rooftop',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 35,
      avatars: [avatars.mike, avatars.sarah, avatars.james, avatars.emily, avatars.david]
    },
    comments: []
  },
  // June 2026
  {
    id: 22,
    date: '2026-06-07',
    time: '2:00 PM',
    title: 'Summer Kickoff Pool Party',
    description: 'Pool party with DJ, snacks, and drinks on the Pool Deck.',
    category: 'social',
    categoryLabel: 'Social',
    icon: Sun,
    iconClass: 'outdoor-icon',
    color: '#8b5cf6',
    subtitle: 'Jun 7 · 2:00 PM · Pool Deck',
    organizer: {
      name: 'Social Committee',
      role: 'Resident Organization',
      avatar: avatars.lisa
    },
    attendees: {
      count: 40,
      avatars: [avatars.mike, avatars.sarah, avatars.emily, avatars.james, avatars.lisa]
    },
    comments: demoComments.poolParty
  },
  {
    id: 23,
    date: '2026-06-15',
    time: '7:00 PM',
    title: "Father's Day Poker Night",
    description: "Texas Hold'em tournament in the Game Room. Prizes for winners!",
    category: 'social',
    categoryLabel: 'Social',
    icon: Users,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'Jun 15 · 7:00 PM · Game Room',
    organizer: {
      name: 'Mike T.',
      role: 'Resident Host',
      avatar: avatars.mike
    },
    attendees: {
      count: 16,
      avatars: [avatars.mike, avatars.james, avatars.david]
    },
    comments: []
  },
  {
    id: 24,
    date: '2026-06-21',
    time: '7:00 PM',
    title: 'Book Club Meeting',
    description: 'Monthly book club in the Library. This month: "The Midnight Library".',
    category: 'meeting',
    categoryLabel: 'Meeting',
    icon: BookOpen,
    iconClass: 'culture-icon',
    color: '#3b82f6',
    subtitle: 'Jun 21 · 7:00 PM · Library',
    organizer: {
      name: 'Emily C.',
      role: 'Book Club Leader',
      avatar: avatars.emily
    },
    attendees: {
      count: 8,
      avatars: [avatars.emily, avatars.sarah, avatars.anna]
    },
    comments: []
  },
  // July 2026
  {
    id: 25,
    date: '2026-07-04',
    time: '8:00 PM',
    title: 'Independence Day Fireworks Watch',
    description: 'Watch the city fireworks from the Rooftop!',
    category: 'social',
    categoryLabel: 'Social',
    icon: PartyPopper,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'Jul 4 · 8:00 PM · Rooftop',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 45,
      avatars: [avatars.sarah, avatars.mike, avatars.emily, avatars.james, avatars.lisa]
    },
    comments: []
  },
  {
    id: 26,
    date: '2026-07-12',
    time: '6:00 PM',
    title: 'Summer Concert Series',
    description: 'Live band performance in the Courtyard.',
    category: 'social',
    categoryLabel: 'Social',
    icon: Music,
    iconClass: 'music-icon',
    color: '#8b5cf6',
    subtitle: 'Jul 12 · 6:00 PM · Courtyard',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 30,
      avatars: [avatars.james, avatars.lisa, avatars.david, avatars.anna]
    },
    comments: []
  },
  {
    id: 27,
    date: '2026-07-19',
    time: '3:00 PM',
    title: 'Ice Cream Social',
    description: 'Beat the heat with free ice cream in the Lobby!',
    category: 'social',
    categoryLabel: 'Social',
    icon: Coffee,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'Jul 19 · 3:00 PM · Lobby',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 22,
      avatars: [avatars.sarah, avatars.emily, avatars.anna, avatars.lisa]
    },
    comments: []
  },
  // August 2026
  {
    id: 28,
    date: '2026-08-02',
    time: 'All Day',
    title: 'HVAC Maintenance',
    description: 'Annual HVAC system maintenance. AC may be unavailable intermittently.',
    category: 'maintenance',
    categoryLabel: 'Maintenance',
    icon: Wrench,
    iconClass: 'maintenance-icon',
    color: '#f59e0b',
    subtitle: 'Aug 2 · All Day',
    actionRequired: false,
    affectedUnits: 'All units',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    }
  },
  {
    id: 29,
    date: '2026-08-13',
    time: '6:00 PM',
    title: 'Building Town Hall',
    description: 'Monthly meeting to discuss building updates and Q3 financials.',
    category: 'meeting',
    categoryLabel: 'Meeting',
    icon: Users,
    iconClass: 'community-icon',
    color: '#3b82f6',
    subtitle: 'Aug 13 · 6:00 PM · Community Room',
    organizer: {
      name: 'Board of Directors',
      role: 'Building Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 12,
      avatars: [avatars.david, avatars.james, avatars.mike, avatars.sarah]
    },
    comments: []
  },
  {
    id: 30,
    date: '2026-08-15',
    time: '10:00 AM',
    title: 'Back to School Drive',
    description: 'Donate school supplies in the Lobby for local students.',
    category: 'meeting',
    categoryLabel: 'Meeting',
    icon: BookOpen,
    iconClass: 'community-icon',
    color: '#3b82f6',
    subtitle: 'Aug 15 · 10:00 AM · Lobby',
    organizer: {
      name: 'Community Board',
      role: 'Resident Organization',
      avatar: avatars.anna
    },
    attendees: {
      count: 18,
      avatars: [avatars.anna, avatars.sarah, avatars.emily]
    },
    comments: []
  },
  {
    id: 31,
    date: '2026-08-30',
    time: '5:00 PM',
    title: 'End of Summer Luau',
    description: 'Hawaiian-themed party on the Pool Deck. Leis provided!',
    category: 'social',
    categoryLabel: 'Social',
    icon: PartyPopper,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'Aug 30 · 5:00 PM · Pool Deck',
    organizer: {
      name: 'Social Committee',
      role: 'Resident Organization',
      avatar: avatars.lisa
    },
    attendees: {
      count: 38,
      avatars: [avatars.lisa, avatars.mike, avatars.sarah, avatars.james, avatars.emily]
    },
    comments: []
  },
  // September 2026
  {
    id: 32,
    date: '2026-09-01',
    time: '12:00 PM',
    title: 'Labor Day Cookout',
    description: 'End of summer BBQ on the Rooftop.',
    category: 'social',
    categoryLabel: 'Social',
    icon: Wine,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'Sep 1 · 12:00 PM · Rooftop',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 28,
      avatars: [avatars.mike, avatars.james, avatars.david, avatars.sarah]
    },
    comments: []
  },
  {
    id: 33,
    date: '2026-09-20',
    time: '2:00 PM',
    title: 'Fall Festival',
    description: 'Pumpkin decorating, apple cider, and fall activities in the Courtyard.',
    category: 'social',
    categoryLabel: 'Social',
    icon: TreeDeciduous,
    iconClass: 'outdoor-icon',
    color: '#8b5cf6',
    subtitle: 'Sep 20 · 2:00 PM · Courtyard',
    organizer: {
      name: 'Family Committee',
      role: 'Resident Organization',
      avatar: avatars.sarah
    },
    attendees: {
      count: 24,
      avatars: [avatars.sarah, avatars.emily, avatars.anna, avatars.lisa]
    },
    comments: []
  },
  // October 2026
  {
    id: 34,
    date: '2026-10-04',
    time: '8:00 PM',
    title: 'Karaoke Night',
    description: 'Show off your singing skills in the Rooftop Lounge!',
    category: 'social',
    categoryLabel: 'Social',
    icon: Mic,
    iconClass: 'music-icon',
    color: '#8b5cf6',
    subtitle: 'Oct 4 · 8:00 PM · Rooftop Lounge',
    organizer: {
      name: 'Social Committee',
      role: 'Resident Organization',
      avatar: avatars.james
    },
    attendees: {
      count: 20,
      avatars: [avatars.james, avatars.lisa, avatars.mike, avatars.emily]
    },
    comments: []
  },
  {
    id: 35,
    date: '2026-10-31',
    time: '7:00 PM',
    title: 'Halloween Costume Party',
    description: 'Costume contest with prizes in the Community Room!',
    category: 'social',
    categoryLabel: 'Social',
    icon: PartyPopper,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'Oct 31 · 7:00 PM · Community Room',
    organizer: {
      name: 'Social Committee',
      role: 'Resident Organization',
      avatar: avatars.lisa
    },
    attendees: {
      count: 35,
      avatars: [avatars.james, avatars.lisa, avatars.sarah, avatars.mike, avatars.emily]
    },
    comments: demoComments.halloween
  },
  // November 2026
  {
    id: 36,
    date: '2026-11-08',
    time: '9:00 AM - 3:00 PM',
    title: 'Heating System Check',
    description: 'Annual heating system inspection before winter.',
    category: 'maintenance',
    categoryLabel: 'Maintenance',
    icon: Wrench,
    iconClass: 'maintenance-icon',
    color: '#f59e0b',
    subtitle: 'Nov 8 · 9:00 AM - 3:00 PM',
    actionRequired: true,
    affectedUnits: 'All units',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    }
  },
  {
    id: 37,
    date: '2026-11-12',
    time: '6:00 PM',
    title: 'Building Town Hall',
    description: 'Monthly meeting to discuss winter preparations and annual budget.',
    category: 'meeting',
    categoryLabel: 'Meeting',
    icon: Users,
    iconClass: 'community-icon',
    color: '#3b82f6',
    subtitle: 'Nov 12 · 6:00 PM · Community Room',
    organizer: {
      name: 'Board of Directors',
      role: 'Building Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 14,
      avatars: [avatars.david, avatars.james, avatars.mike, avatars.sarah]
    },
    comments: []
  },
  {
    id: 38,
    date: '2026-11-27',
    time: '4:00 PM',
    title: 'Thanksgiving Potluck',
    description: 'Bring a dish to share in the Community Room!',
    category: 'social',
    categoryLabel: 'Social',
    icon: Coffee,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'Nov 27 · 4:00 PM · Community Room',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 26,
      avatars: [avatars.sarah, avatars.emily, avatars.anna, avatars.mike, avatars.james]
    },
    comments: []
  },
  // December 2026
  {
    id: 39,
    date: '2026-12-06',
    time: '6:00 PM',
    title: 'Holiday Tree Lighting',
    description: 'Annual tree lighting ceremony in the Lobby. Hot cocoa and cookies!',
    category: 'social',
    categoryLabel: 'Social',
    icon: Sparkles,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'Dec 6 · 6:00 PM · Lobby',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 42,
      avatars: [avatars.sarah, avatars.mike, avatars.emily, avatars.james, avatars.lisa]
    },
    comments: []
  },
  {
    id: 40,
    date: '2026-12-13',
    time: '2:00 PM',
    title: 'Holiday Movie Marathon',
    description: 'Classic holiday films in the Theater Room. Popcorn provided!',
    category: 'social',
    categoryLabel: 'Social',
    icon: Film,
    iconClass: 'movie-icon',
    color: '#8b5cf6',
    subtitle: 'Dec 13 · 2:00 PM · Theater Room',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 18,
      avatars: [avatars.sarah, avatars.emily, avatars.anna, avatars.lisa]
    },
    comments: []
  },
  {
    id: 41,
    date: '2026-12-31',
    time: '9:00 PM',
    title: "New Year's Eve Gala",
    description: 'Ring in the new year in style! Champagne toast at midnight in the Rooftop Lounge.',
    category: 'social',
    categoryLabel: 'Social',
    icon: PartyPopper,
    iconClass: 'social-icon',
    color: '#8b5cf6',
    subtitle: 'Dec 31 · 9:00 PM · Rooftop Lounge',
    organizer: {
      name: 'Building Staff',
      role: 'Property Management',
      avatar: avatars.staff
    },
    attendees: {
      count: 55,
      avatars: [avatars.anna, avatars.david, avatars.sarah, avatars.mike, avatars.emily]
    },
    comments: demoComments.newYears
  }
]

// Helper to get event by ID
export const getEventById = (id) => eventsData.find(event => event.id === id)

// Helper to get events for Home screen (simplified format)
export const getHomeEvents = () => eventsData.map(event => ({
  id: event.id,
  title: event.title,
  subtitle: event.subtitle,
  icon: event.icon,
  iconClass: event.iconClass
}))

export default eventsData
