import { useState, useEffect } from 'react'
import {
  ClipboardList,
  Plus,
  Search,
  MoreVertical,
  Pin,
  Edit3,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  Eye,
  Clock,
  DollarSign,
  Tag,
  ShoppingBag,
  Gift,
  HelpCircle,
  Briefcase,
  Calendar,
  MapPin,
  MessageSquare,
  Phone,
  Mail,
  Image,
  User,
  Car,
  Archive
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getListings, createListing, updateListing, deleteListing } from './services/bulletinService'
import { getResidents } from './services/messageService'
import './ManagerBulletin.css'

// Demo residents list for posting on behalf of
const DEMO_RESIDENTS = [
  { id: 1, name: 'Sarah Mitchell', unit: '1201' },
  { id: 2, name: 'Mike Thompson', unit: '805' },
  { id: 3, name: 'Jessica Kim', unit: '402' },
  { id: 4, name: 'Alex Rivera', unit: '1104' },
  { id: 5, name: 'Chris Walker', unit: '309' },
  { id: 6, name: 'Emma Davis', unit: '1507' },
  { id: 7, name: 'James Lee', unit: '203' },
  { id: 8, name: 'Lisa Chen', unit: '608' },
  { id: 9, name: 'David Park', unit: '1502' },
  { id: 10, name: 'Taylor Young', unit: '612' }
]

// Demo listings data
const DEMO_LISTINGS = [
  {
    id: 1,
    title: 'IKEA Couch - Great condition',
    category: 'for_sale',
    price: 200,
    description: 'Beautiful blue IKEA sectional couch, 2 years old. Minor wear, very comfortable. Must pick up.',
    posterName: 'Sarah Mitchell',
    posterUnit: '1201',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    contactMethod: 'message',
    views: 45,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'Standing Desk',
    category: 'for_sale',
    price: 150,
    description: 'Adjustable standing desk, electric motor. Works perfectly. Selling because I\'m moving.',
    posterName: 'Mike Thompson',
    posterUnit: '805',
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    contactMethod: 'message',
    views: 32,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'Kitchen appliances bundle',
    category: 'for_sale',
    price: 75,
    description: 'Toaster, blender, and coffee maker. All in working condition. Take all for $75.',
    posterName: 'Jessica Kim',
    posterUnit: '402',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    contactMethod: 'email',
    views: 18,
    pinned: false,
    flagged: true,
    sold: false,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    title: 'Mountain Bike - Trek',
    category: 'for_sale',
    price: 350,
    description: 'Trek mountain bike, 21-speed, excellent condition. Includes helmet and lock. Perfect for trails!',
    posterName: 'Robert Martinez',
    posterUnit: '1012',
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    contactMethod: 'message',
    views: 52,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    title: '55" Samsung Smart TV',
    category: 'for_sale',
    price: 275,
    description: '55 inch Samsung 4K Smart TV. 2022 model. Works great, upgrading to larger size. Wall mount included.',
    posterName: 'Amanda White',
    posterUnit: '305',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    contactMethod: 'phone',
    views: 68,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop'
  },
  {
    id: 6,
    title: 'Moving boxes - FREE!',
    category: 'free',
    price: null,
    description: 'About 20 medium and large moving boxes. Some packing paper too. First come first served!',
    posterName: 'Alex Rivera',
    posterUnit: '1104',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    contactMethod: 'message',
    views: 28,
    pinned: true,
    flagged: false,
    sold: false,
    hasImage: false
  },
  {
    id: 7,
    title: 'Outdoor plant pots',
    category: 'free',
    price: null,
    description: 'Assorted ceramic and plastic plant pots. Various sizes. Perfect for balcony garden!',
    posterName: 'Chris Walker',
    posterUnit: '309',
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    contactMethod: 'message',
    views: 15,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop'
  },
  {
    id: 8,
    title: 'Parking Spot P1-23 for Rent',
    category: 'parking',
    price: 150,
    description: 'Underground parking spot on P1 level, close to elevator. Available immediately. Monthly rental.',
    posterName: 'Sarah Mitchell',
    posterUnit: '1201',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    contactMethod: 'message',
    views: 34,
    pinned: true,
    flagged: false,
    sold: false,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&h=300&fit=crop'
  },
  {
    id: 9,
    title: 'Covered Parking Spot - P2 Level',
    category: 'parking',
    price: 125,
    description: 'Covered parking spot on P2. Great location near stairwell. Long-term rental preferred. $125/month.',
    posterName: 'Mike Thompson',
    posterUnit: '805',
    postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    contactMethod: 'email',
    views: 41,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&h=300&fit=crop'
  },
  {
    id: 10,
    title: 'Tandem Parking Spot Available',
    category: 'parking',
    price: 200,
    description: 'Tandem parking spot fits 2 small/medium cars. P1 level. $200/month for both spots.',
    posterName: 'David Park',
    posterUnit: '1502',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    contactMethod: 'message',
    views: 29,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&h=300&fit=crop'
  },
  {
    id: 11,
    title: 'Storage Unit 5x10 for Rent',
    category: 'storage',
    price: 75,
    description: 'Climate-controlled storage unit, 5x10 ft. Located on basement level. Perfect for seasonal items.',
    posterName: 'Emma Davis',
    posterUnit: '1507',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    contactMethod: 'phone',
    views: 23,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400&h=300&fit=crop'
  },
  {
    id: 12,
    title: 'Large Storage Locker - 10x15',
    category: 'storage',
    price: 125,
    description: 'Extra large storage locker, 10x15 ft. Ground floor access, easy loading. Available Feb 1st.',
    posterName: 'James Lee',
    posterUnit: '203',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    contactMethod: 'message',
    views: 38,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  },
  {
    id: 13,
    title: 'Small Storage Unit - Great Price!',
    category: 'storage',
    price: 50,
    description: 'Small 4x4 storage unit. Perfect for bikes, boxes, or seasonal decorations. $50/month.',
    posterName: 'Lisa Chen',
    posterUnit: '608',
    postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    contactMethod: 'email',
    views: 19,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: false
  },
  {
    id: 14,
    title: 'Looking for babysitter',
    category: 'wanted',
    price: null,
    description: 'Seeking reliable babysitter for occasional weekend evenings. 2 kids ages 5 and 8. References required.',
    posterName: 'Emma Davis',
    posterUnit: '1507',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    contactMethod: 'phone',
    views: 22,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: false
  },
  {
    id: 15,
    title: 'Dog walking available',
    category: 'services',
    price: 20,
    description: 'Professional dog walker available for daily walks. $20 per 30-min walk. Experienced with all breeds.',
    posterName: 'James Lee',
    posterUnit: '203',
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    contactMethod: 'message',
    views: 38,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop'
  },
  {
    id: 16,
    title: 'Piano lessons for kids',
    category: 'services',
    price: 40,
    description: 'Experienced piano teacher offering lessons for children ages 5-12. $40/hour. Your place or mine.',
    posterName: 'Lisa Chen',
    posterUnit: '608',
    postedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    contactMethod: 'email',
    views: 25,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=400&h=300&fit=crop'
  },
  {
    id: 17,
    title: 'Building Yard Sale - Jan 25th',
    category: 'events',
    price: null,
    description: 'Annual building yard sale in the lobby! Reserve your table spot. Contact management to participate.',
    posterName: 'Property Manager',
    posterUnit: 'Management',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    contactMethod: 'message',
    views: 67,
    pinned: true,
    flagged: false,
    sold: false,
    hasImage: false
  },
  {
    id: 18,
    title: 'Lost: Silver bracelet',
    category: 'lost_found',
    price: null,
    description: 'Lost a silver charm bracelet somewhere in the building last week. Sentimental value. Reward offered!',
    posterName: 'David Park',
    posterUnit: '1502',
    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    contactMethod: 'phone',
    views: 12,
    pinned: false,
    flagged: false,
    sold: false,
    hasImage: false
  }
]

function ManagerBulletin() {
  // Demo gate - check if user is in demo mode
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  // Residents state - fetched from Supabase for real users
  const [residents, setResidents] = useState(isInDemoMode ? DEMO_RESIDENTS : [])
  const [loadingResidents, setLoadingResidents] = useState(!isInDemoMode)

  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)
  const [activeMenu, setActiveMenu] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(!isInDemoMode)

  // Form state
  const [listingForm, setListingForm] = useState({
    title: '',
    category: 'for_sale',
    price: '',
    description: '',
    contactMethod: 'message',
    postedAs: 'manager'
  })

  // Delete options
  const [deleteReason, setDeleteReason] = useState('sold')

  // Categories
  const categories = [
    { id: 'for_sale', label: 'For Sale', icon: ShoppingBag, color: '#3b82f6' },
    { id: 'free', label: 'Free', icon: Gift, color: '#10b981' },
    { id: 'wanted', label: 'Wanted', icon: HelpCircle, color: '#8b5cf6' },
    { id: 'services', label: 'Services', icon: Briefcase, color: '#f59e0b' },
    { id: 'parking', label: 'Parking', icon: Car, color: '#06b6d4' },
    { id: 'storage', label: 'Storage', icon: Archive, color: '#84cc16' },
    { id: 'events', label: 'Events', icon: Calendar, color: '#ec4899' },
    { id: 'lost_found', label: 'Lost & Found', icon: MapPin, color: '#ef4444' }
  ]

  // Contact methods
  const contactMethods = [
    { id: 'message', label: 'Direct Message', icon: MessageSquare },
    { id: 'phone', label: 'Phone', icon: Phone },
    { id: 'email', label: 'Email', icon: Mail }
  ]

  // Delete reasons
  const deleteReasons = [
    { id: 'sold', label: 'Sold/Completed' },
    { id: 'inappropriate', label: 'Inappropriate content' },
    { id: 'duplicate', label: 'Duplicate listing' },
    { id: 'expired', label: 'Expired/No longer available' }
  ]

  // Listings data - use demo data for demo users, empty for real users
  const [listings, setListings] = useState(isInDemoMode ? DEMO_LISTINGS : [])

  // Load residents from Supabase for real users
  useEffect(() => {
    async function loadResidents() {
      if (isInDemoMode) return

      const buildingId = userProfile?.building_id
      if (!buildingId) return

      try {
        const data = await getResidents(buildingId)
        const transformedResidents = (data || []).map(r => ({
          id: r.id,
          name: r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Unknown',
          unit: r.unit_number || 'Unknown'
        }))
        setResidents(transformedResidents)
      } catch (err) {
        console.error('[ManagerBulletin] Error loading residents:', err)
      } finally {
        setLoadingResidents(false)
      }
    }
    loadResidents()
  }, [isInDemoMode, userProfile?.building_id])

  // Load listings from Supabase for real users
  useEffect(() => {
    async function loadListings() {
      if (isInDemoMode) return

      const buildingId = userProfile?.building_id
      console.log('[ManagerBulletin] Loading listings for building:', buildingId)

      if (!buildingId) {
        setLoading(false)
        return
      }

      try {
        const data = await getListings(buildingId)
        const transformedListings = (data || []).map(listing => ({
          id: listing.id,
          title: listing.title,
          category: listing.category,
          price: listing.price,
          description: listing.description,
          posterName: listing.author?.full_name || listing.author?.first_name || 'Unknown',
          posterUnit: listing.author?.unit_number || 'Unknown',
          postedAt: new Date(listing.created_at),
          contactMethod: 'message',
          views: listing.views_count || 0,
          pinned: listing.is_pinned || false,
          flagged: false,
          sold: listing.status === 'sold' || listing.status === 'completed',
          hasImage: listing.images && listing.images.length > 0,
          imageUrl: listing.images?.[0] || null,
          dbStatus: listing.status
        }))
        setListings(transformedListings)
        console.log('[ManagerBulletin] Listings loaded:', transformedListings.length)
      } catch (err) {
        console.error('[ManagerBulletin] Error loading listings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadListings()
  }, [isInDemoMode, userProfile?.building_id])

  // Calculate stats
  const activeListings = listings.filter(l => !l.sold)
  const postedThisWeek = listings.filter(l => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return l.postedAt >= weekAgo
  })
  const flaggedListings = listings.filter(l => l.flagged)
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0)

  const stats = [
    { label: 'Active Listings', value: activeListings.length, icon: ClipboardList, color: 'blue' },
    { label: 'Posted This Week', value: postedThisWeek.length, icon: Clock, color: 'purple' },
    { label: 'Flagged for Review', value: flaggedListings.length, icon: AlertTriangle, color: 'yellow' },
    { label: 'Total Views', value: totalViews, icon: Eye, color: 'green' }
  ]

  const filters = [
    { id: 'all', label: 'All Listings' },
    { id: 'for_sale', label: 'For Sale' },
    { id: 'free', label: 'Free' },
    { id: 'parking', label: 'Parking' },
    { id: 'storage', label: 'Storage' },
    { id: 'services', label: 'Services' },
    { id: 'events', label: 'Events' }
  ]

  // Get category info
  const getCategory = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[0]
  }

  // Format time ago
  const formatTimeAgo = (date) => {
    const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60)
    if (hoursAgo < 24) return 'Today'
    const daysAgo = Math.floor(hoursAgo / 24)
    if (daysAgo === 1) return 'Yesterday'
    if (daysAgo < 7) return `${daysAgo} days ago`
    if (daysAgo < 14) return '1 week ago'
    return `${Math.floor(daysAgo / 7)} weeks ago`
  }

  // Get days active
  const getDaysActive = (date) => {
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    return daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo !== 1 ? 's' : ''}`
  }

  // Filter and sort listings
  const getFilteredListings = () => {
    let filtered = [...listings].filter(l => !l.sold)

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query) ||
        l.posterName.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(l => l.category === activeFilter)
    }

    // Sort: pinned first, then by date
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.postedAt - a.postedAt
    })

    return filtered
  }

  // Show toast
  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Reset form
  const resetForm = () => {
    setListingForm({
      title: '',
      category: 'for_sale',
      price: '',
      description: '',
      contactMethod: 'message',
      postedAs: 'manager'
    })
  }

  // Handle create listing
  const handleCreateListing = async () => {
    let posterName = 'Property Manager'
    let posterUnit = 'Management'
    let authorId = userProfile.id  // Default to manager's ID

    if (listingForm.postedAs !== 'manager') {
      const resident = residents.find(r => String(r.id) === String(listingForm.postedAs))
      if (resident) {
        posterName = resident.name
        posterUnit = resident.unit
        authorId = resident.id
      }
    }

    if (isInDemoMode) {
      // Demo mode: add to local state only
      const newListing = {
        id: Date.now(),
        title: listingForm.title,
        category: listingForm.category,
        price: listingForm.price ? parseFloat(listingForm.price) : null,
        description: listingForm.description,
        posterName,
        posterUnit,
        postedAt: new Date(),
        contactMethod: listingForm.contactMethod,
        views: 0,
        pinned: false,
        flagged: false,
        sold: false,
        hasImage: false
      }
      setListings(prev => [newListing, ...prev])
    } else {
      // Real mode: save to Supabase
      try {
        await createListing({
          building_id: userProfile.building_id,
          author_id: authorId,
          user_id: authorId,
          category: listingForm.category,
          title: listingForm.title,
          description: listingForm.description,
          price: listingForm.price ? parseFloat(listingForm.price) : null,
          status: 'active',
          is_pinned: false,
          views_count: 0
        })

        // Reload listings
        const data = await getListings(userProfile.building_id)
        const transformedListings = (data || []).map(listing => ({
          id: listing.id,
          title: listing.title,
          category: listing.category,
          price: listing.price,
          description: listing.description,
          posterName: listing.author?.full_name || listing.author?.first_name || 'Unknown',
          posterUnit: listing.author?.unit_number || 'Unknown',
          postedAt: new Date(listing.created_at),
          contactMethod: 'message',
          views: listing.views_count || 0,
          pinned: listing.is_pinned || false,
          flagged: false,
          sold: listing.status === 'sold' || listing.status === 'completed',
          hasImage: listing.images && listing.images.length > 0,
          imageUrl: listing.images?.[0] || null,
          dbStatus: listing.status
        }))
        setListings(transformedListings)
      } catch (err) {
        console.error('[ManagerBulletin] Error creating listing:', err)
        showToastMessage('Failed to create listing')
        return
      }
    }

    setShowCreateModal(false)
    resetForm()
    showToastMessage('Listing posted successfully!')
  }

  // Handle edit listing
  const handleEditListing = async () => {
    if (isInDemoMode) {
      setListings(prev => prev.map(l => {
        if (l.id === selectedListing.id) {
          return {
            ...l,
            title: listingForm.title,
            category: listingForm.category,
            price: listingForm.price ? parseFloat(listingForm.price) : null,
            description: listingForm.description,
            contactMethod: listingForm.contactMethod
          }
        }
        return l
      }))
    } else {
      try {
        await updateListing(selectedListing.id, {
          title: listingForm.title,
          category: listingForm.category,
          price: listingForm.price ? parseFloat(listingForm.price) : null,
          description: listingForm.description
        })

        // Update local state
        setListings(prev => prev.map(l => {
          if (l.id === selectedListing.id) {
            return {
              ...l,
              title: listingForm.title,
              category: listingForm.category,
              price: listingForm.price ? parseFloat(listingForm.price) : null,
              description: listingForm.description,
              contactMethod: listingForm.contactMethod
            }
          }
          return l
        }))
      } catch (err) {
        console.error('[ManagerBulletin] Error updating listing:', err)
        showToastMessage('Failed to update listing')
        return
      }
    }

    setShowEditModal(false)
    setSelectedListing(null)
    resetForm()
    showToastMessage('Listing updated!')
  }

  // Handle pin listing
  const handlePinListing = async (listing) => {
    const pinnedCount = listings.filter(l => l.pinned).length

    if (!listing.pinned && pinnedCount >= 3) {
      showToastMessage('Maximum 3 pinned listings allowed. Unpin one first.')
      setActiveMenu(null)
      return
    }

    const newPinned = !listing.pinned

    if (!isInDemoMode) {
      try {
        await updateListing(listing.id, { is_pinned: newPinned })
      } catch (err) {
        console.error('[ManagerBulletin] Error pinning listing:', err)
        showToastMessage('Failed to pin listing')
        setActiveMenu(null)
        return
      }
    }

    setListings(prev => prev.map(l => {
      if (l.id === listing.id) {
        return { ...l, pinned: newPinned }
      }
      return l
    }))
    setActiveMenu(null)
    showToastMessage(listing.pinned ? 'Listing unpinned' : 'Listing pinned to top!')
  }

  // Handle mark as sold
  const handleMarkSold = async (listing) => {
    if (!isInDemoMode) {
      try {
        await updateListing(listing.id, { status: 'sold' })
      } catch (err) {
        console.error('[ManagerBulletin] Error marking as sold:', err)
        showToastMessage('Failed to mark as sold')
        setActiveMenu(null)
        return
      }
    }

    setListings(prev => prev.map(l => {
      if (l.id === listing.id) {
        return { ...l, sold: true, dbStatus: 'sold' }
      }
      return l
    }))
    setActiveMenu(null)
    showToastMessage('Listing marked as sold/completed')
  }

  // Handle flag listing
  const handleFlagListing = (listing) => {
    setListings(prev => prev.map(l => {
      if (l.id === listing.id) {
        return { ...l, flagged: !l.flagged }
      }
      return l
    }))
    setActiveMenu(null)
    showToastMessage(listing.flagged ? 'Flag removed' : 'Listing flagged for review')
  }

  // Handle delete listing
  const handleDeleteListing = async () => {
    if (!isInDemoMode) {
      try {
        await deleteListing(selectedListing.id)
      } catch (err) {
        console.error('[ManagerBulletin] Error deleting listing:', err)
        showToastMessage('Failed to delete listing')
        setShowDeleteModal(false)
        setSelectedListing(null)
        return
      }
    }

    setListings(prev => prev.filter(l => l.id !== selectedListing.id))
    setShowDeleteModal(false)
    setSelectedListing(null)
    showToastMessage('Listing deleted')
  }

  // Open edit modal
  const openEditModal = (listing) => {
    setSelectedListing(listing)
    setListingForm({
      title: listing.title,
      category: listing.category,
      price: listing.price ? listing.price.toString() : '',
      description: listing.description,
      contactMethod: listing.contactMethod,
      postedAs: 'manager'
    })
    setActiveMenu(null)
    setShowEditModal(true)
  }

  // Open delete modal
  const openDeleteModal = (listing) => {
    setSelectedListing(listing)
    setActiveMenu(null)
    setShowDeleteModal(true)
  }

  const filteredListings = getFilteredListings()

  // Loading state
  if (loading) {
    return (
      <div className="manager-bulletin">
        <div className="bulletin-header">
          <div className="bulletin-header-left">
            <h2>Bulletin Board</h2>
            <p>Manage community marketplace listings</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', color: '#9CA3AF' }}>
          Loading listings...
        </div>
      </div>
    )
  }

  return (
    <div className="manager-bulletin">
      {/* Header */}
      <div className="bulletin-header">
        <div className="bulletin-header-left">
          <h2>Bulletin Board</h2>
          <p>Manage community marketplace listings</p>
        </div>
        <button className="create-listing-btn" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          <span>Create Listing</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="bulletin-stats">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              <stat.icon size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bulletin-toolbar">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="listings-grid">
        {filteredListings.length === 0 ? (
          <div className="no-listings">
            <ClipboardList size={48} />
            <h3>No listings found</h3>
            <p>
              {searchQuery
                ? 'Try a different search term'
                : activeFilter !== 'all'
                  ? 'No listings in this category'
                  : 'Be the first to post a listing!'}
            </p>
            <button className="create-first-btn" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              Create Listing
            </button>
          </div>
        ) : (
          filteredListings.map(listing => {
            const category = getCategory(listing.category)
            const IconComponent = category.icon

            return (
              <div
                key={listing.id}
                className={`listing-card ${listing.pinned ? 'pinned' : ''} ${listing.flagged ? 'flagged' : ''}`}
              >
                {/* Pinned Badge */}
                {listing.pinned && (
                  <div className="pinned-badge">
                    <Pin size={12} />
                    <span>Pinned</span>
                  </div>
                )}

                {/* Flagged Badge */}
                {listing.flagged && (
                  <div className="flagged-badge">
                    <AlertTriangle size={12} />
                    <span>Flagged</span>
                  </div>
                )}

                {/* Image/Placeholder */}
                <div className="listing-image">
                  {listing.hasImage && listing.imageUrl ? (
                    <img src={listing.imageUrl} alt={listing.title} />
                  ) : (
                    <div className="listing-image-placeholder" style={{ background: category.color + '30' }}>
                      <IconComponent size={32} style={{ color: category.color }} />
                    </div>
                  )}
                </div>

                {/* Menu */}
                <div className="listing-menu-wrapper">
                  <button
                    className="listing-menu-btn"
                    onClick={() => setActiveMenu(activeMenu === listing.id ? null : listing.id)}
                  >
                    <MoreVertical size={18} />
                  </button>
                  {activeMenu === listing.id && (
                    <div className="listing-menu-dropdown">
                      <button onClick={() => handlePinListing(listing)}>
                        <Pin size={16} />
                        {listing.pinned ? 'Unpin Listing' : 'Pin Listing'}
                      </button>
                      <button onClick={() => openEditModal(listing)}>
                        <Edit3 size={16} />
                        Edit Listing
                      </button>
                      <button onClick={() => handleMarkSold(listing)}>
                        <CheckCircle size={16} />
                        Mark as Sold/Completed
                      </button>
                      <button onClick={() => handleFlagListing(listing)}>
                        <AlertTriangle size={16} />
                        {listing.flagged ? 'Remove Flag' : 'Flag for Review'}
                      </button>
                      <div className="menu-divider"></div>
                      <button className="delete-btn" onClick={() => openDeleteModal(listing)}>
                        <Trash2 size={16} />
                        Delete Listing
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="listing-content">
                  <div className="listing-header">
                    <span
                      className="category-badge"
                      style={{ background: `${category.color}20`, color: category.color }}
                    >
                      {category.label}
                    </span>
                    {listing.price && (
                      <span className="listing-price">${listing.price}</span>
                    )}
                  </div>

                  <h3 className="listing-title">{listing.title}</h3>

                  <p className="listing-description">{listing.description}</p>

                  <div className="listing-poster">
                    <User size={14} />
                    <span>{listing.posterName}</span>
                    <span className="poster-unit">Unit {listing.posterUnit}</span>
                  </div>

                  {/* Manager-only stats */}
                  <div className="listing-stats">
                    <span className="stat-item">
                      <Eye size={12} />
                      {listing.views} views
                    </span>
                    <span className="stat-item">
                      <Clock size={12} />
                      {getDaysActive(listing.postedAt)} active
                    </span>
                  </div>

                  <div className="listing-footer">
                    <span className="listing-time">{formatTimeAgo(listing.postedAt)}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content listing-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Bulletin Board Listing</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Listing Title *</label>
                <input
                  type="text"
                  placeholder="What are you posting?"
                  value={listingForm.title}
                  onChange={e => setListingForm({ ...listingForm, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={listingForm.category}
                    onChange={e => setListingForm({ ...listingForm, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (optional)</label>
                  <div className="price-input">
                    <DollarSign size={16} />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={listingForm.price}
                      onChange={e => setListingForm({ ...listingForm, price: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Add details about your listing..."
                  value={listingForm.description}
                  onChange={e => setListingForm({ ...listingForm, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Contact Method</label>
                <select
                  value={listingForm.contactMethod}
                  onChange={e => setListingForm({ ...listingForm, contactMethod: e.target.value })}
                >
                  {contactMethods.map(method => (
                    <option key={method.id} value={method.id}>{method.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Posted On Behalf Of</label>
                <select
                  value={listingForm.postedAs}
                  onChange={e => setListingForm({ ...listingForm, postedAs: e.target.value })}
                >
                  <option value="manager">Property Manager</option>
                  <optgroup label="Residents">
                    {residents.map(resident => (
                      <option key={resident.id} value={resident.id}>
                        {resident.name} - Unit {resident.unit}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateListing}
                disabled={!listingForm.title}
              >
                <Plus size={18} />
                Post Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {showEditModal && selectedListing && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content listing-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Listing</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Listing Title *</label>
                <input
                  type="text"
                  placeholder="What are you posting?"
                  value={listingForm.title}
                  onChange={e => setListingForm({ ...listingForm, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={listingForm.category}
                    onChange={e => setListingForm({ ...listingForm, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (optional)</label>
                  <div className="price-input">
                    <DollarSign size={16} />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={listingForm.price}
                      onChange={e => setListingForm({ ...listingForm, price: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Add details about your listing..."
                  value={listingForm.description}
                  onChange={e => setListingForm({ ...listingForm, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Contact Method</label>
                <select
                  value={listingForm.contactMethod}
                  onChange={e => setListingForm({ ...listingForm, contactMethod: e.target.value })}
                >
                  {contactMethods.map(method => (
                    <option key={method.id} value={method.id}>{method.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-danger-outline" onClick={() => {
                setShowEditModal(false)
                openDeleteModal(selectedListing)
              }}>
                <Trash2 size={18} />
                Delete Listing
              </button>
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleEditListing}
                disabled={!listingForm.title}
              >
                <CheckCircle size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Listing Modal */}
      {showDeleteModal && selectedListing && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Listing</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <Trash2 size={32} />
                <p>Delete "<strong>{selectedListing.title}</strong>"?</p>
                <span className="delete-poster">Posted by {selectedListing.posterName}</span>
              </div>

              <div className="form-group">
                <label>Notify poster with reason (optional)</label>
                <select
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                >
                  {deleteReasons.map(reason => (
                    <option key={reason.id} value={reason.id}>{reason.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteListing}>
                <Trash2 size={18} />
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Click outside to close menus */}
      {activeMenu && (
        <div className="menu-backdrop" onClick={() => setActiveMenu(null)} />
      )}
    </div>
  )
}

export default ManagerBulletin
