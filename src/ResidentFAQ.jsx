import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Moon,
  Building2,
  Dumbbell,
  Car,
  Wrench,
  Package,
  FileText,
  Phone,
  AlertCircle
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getFaqItems, incrementViewCount } from './services/faqService'
import { getBuildingBackgroundImage } from './services/buildingService'
import './ResidentFAQ.css'

// Demo FAQs for demo mode
const DEMO_FAQS = [
  {
    id: 1,
    category: 'General',
    question: 'What are the building\'s quiet hours?',
    answer: 'Quiet hours are 10:00 PM to 8:00 AM on weekdays, and 11:00 PM to 9:00 AM on weekends. Please be considerate of your neighbors during these times.',
    view_count: 156
  },
  {
    id: 2,
    category: 'General',
    question: 'Where can I find my building access code?',
    answer: 'Your building access code was sent to your email when you moved in. Contact the property manager to receive it again. For security reasons, we cannot share access codes over the phone.',
    view_count: 89
  },
  {
    id: 3,
    category: 'Amenities',
    question: 'What are the gym hours?',
    answer: 'The fitness center is open 24/7 for residents. Use your key fob to access the gym at any time. Please wipe down equipment after use.',
    view_count: 203
  },
  {
    id: 4,
    category: 'Amenities',
    question: 'Can I reserve the rooftop lounge?',
    answer: 'Yes! Contact the property manager at least 2 weeks in advance. There\'s a $100 refundable deposit required. Maximum capacity is 30 guests.',
    view_count: 67
  },
  {
    id: 5,
    category: 'Parking',
    question: 'How do I get a parking permit?',
    answer: 'Contact the property manager with your vehicle make, model, color, and license plate number. Monthly parking permits are $150/month.',
    view_count: 178
  },
  {
    id: 6,
    category: 'Parking',
    question: 'Is there bike storage?',
    answer: 'Yes, secure bike storage is available in the basement. Access with your key fob. Each unit is allowed up to 2 bikes.',
    view_count: 92
  },
  {
    id: 7,
    category: 'Maintenance',
    question: 'How do I submit a maintenance request?',
    answer: 'Use the Community app to submit maintenance requests through the Messages section. For emergencies, call (555) 123-4567. Include photos if possible.',
    view_count: 234
  },
  {
    id: 8,
    category: 'Packages & Mail',
    question: 'Where do I pick up packages?',
    answer: 'All packages are held in the package room on the ground floor. Use your key fob to access. You\'ll receive a notification when packages arrive.',
    view_count: 312
  },
  {
    id: 9,
    category: 'Building Policies',
    question: 'Are pets allowed?',
    answer: 'Yes! We allow up to 2 pets per unit. Dogs must be under 50 lbs. There\'s a $500 refundable pet deposit and $50/month pet rent per pet.',
    view_count: 267
  }
]

// Category definitions
const CATEGORIES = [
  { id: 'General', label: 'General', icon: Building2, color: '#3b82f6' },
  { id: 'Amenities', label: 'Amenities', icon: Dumbbell, color: '#8b5cf6' },
  { id: 'Parking', label: 'Parking', icon: Car, color: '#06b6d4' },
  { id: 'Maintenance', label: 'Maintenance', icon: Wrench, color: '#f59e0b' },
  { id: 'Packages & Mail', label: 'Packages & Mail', icon: Package, color: '#10b981' },
  { id: 'Building Policies', label: 'Building Policies', icon: FileText, color: '#ec4899' },
  { id: 'Access & Security', label: 'Access & Security', icon: Phone, color: '#ef4444' },
  { id: 'Pets', label: 'Pets', icon: HelpCircle, color: '#84cc16' },
  { id: 'Billing & Payments', label: 'Billing & Payments', icon: FileText, color: '#a855f7' },
  { id: 'Moving & Elevator', label: 'Moving & Elevator', icon: Building2, color: '#14b8a6' },
  { id: 'Trash & Recycling', label: 'Trash & Recycling', icon: Package, color: '#78716c' },
  { id: 'Safety & Emergency', label: 'Safety & Emergency', icon: AlertCircle, color: '#dc2626' }
]

function ResidentFAQ({ onBack }) {
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQs, setExpandedFAQs] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [buildingBgUrl, setBuildingBgUrl] = useState(null)

  // Weather and time state
  const [currentTime, setCurrentTime] = useState(new Date())
  const weatherData = {
    temp: 58,
    condition: 'clear',
    conditionText: 'Mostly Clear'
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Fetch building background image
  useEffect(() => {
    async function fetchBuildingBackground() {
      if (isInDemoMode || !userProfile?.building_id) return
      try {
        const url = await getBuildingBackgroundImage(userProfile.building_id)
        if (url) setBuildingBgUrl(url)
      } catch (err) {
        console.error('[ResidentFAQ] Error fetching building background:', err)
      }
    }
    fetchBuildingBackground()
  }, [isInDemoMode, userProfile?.building_id])

  const getWeatherIcon = (condition) => {
    const hour = currentTime.getHours()
    const isNight = hour >= 18 || hour < 6
    if (isNight) return Moon
    switch (condition) {
      case 'clear':
      case 'sunny': return Sun
      case 'cloudy': return Cloud
      case 'rainy': return CloudRain
      case 'snowy': return Snowflake
      default: return Sun
    }
  }

  const formatTimeDisplay = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDayDisplay = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const WeatherIcon = getWeatherIcon(weatherData.condition)

  // Load FAQs on mount
  useEffect(() => {
    async function loadFAQs() {
      if (isInDemoMode) {
        setFaqs(DEMO_FAQS)
        setLoading(false)
        return
      }

      const buildingId = userProfile?.building_id
      if (!buildingId) {
        setFaqs([])
        setLoading(false)
        return
      }

      try {
        // Pass isManager=false to only get visible FAQs
        const data = await getFaqItems(buildingId, false)
        setFaqs(data || [])
      } catch (err) {
        console.error('[ResidentFAQ] Error loading FAQs:', err)
        setFaqs([])
      } finally {
        setLoading(false)
      }
    }

    loadFAQs()
  }, [isInDemoMode, userProfile?.building_id])

  // Get category info
  const getCategory = (categoryId) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0]
  }

  // Toggle FAQ expansion
  const toggleFAQ = (faq) => {
    const isExpanding = !expandedFAQs.includes(faq.id)

    setExpandedFAQs(prev =>
      prev.includes(faq.id)
        ? prev.filter(id => id !== faq.id)
        : [...prev, faq.id]
    )

    // Increment view count when expanding (best effort)
    if (isExpanding && !isInDemoMode) {
      incrementViewCount(faq.id)
    }
  }

  // Filter FAQs
  const getFilteredFAQs = () => {
    let filtered = [...faqs]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      )
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === activeCategory)
    }

    return filtered
  }

  // Group FAQs by category
  const getGroupedFAQs = () => {
    const filtered = getFilteredFAQs()
    const grouped = {}

    CATEGORIES.forEach(cat => {
      const catFaqs = filtered.filter(faq => faq.category === cat.id)
      if (catFaqs.length > 0) {
        grouped[cat.id] = catFaqs
      }
    })

    // Add unknown categories to General
    const unknownFaqs = filtered.filter(faq => !CATEGORIES.find(c => c.id === faq.category))
    if (unknownFaqs.length > 0) {
      grouped['General'] = [...(grouped['General'] || []), ...unknownFaqs]
    }

    return grouped
  }

  // Get unique categories that have FAQs
  const getAvailableCategories = () => {
    const categories = [...new Set(faqs.map(f => f.category))]
    return CATEGORIES.filter(c => categories.includes(c.id))
  }

  const filteredFAQs = getFilteredFAQs()
  const groupedFAQs = getGroupedFAQs()
  const availableCategories = getAvailableCategories()

  const bgStyle = buildingBgUrl ? { '--building-bg-image': `url(${buildingBgUrl})` } : {}

  // Loading state
  if (loading) {
    return (
      <div className="resident-faq resident-inner-page" style={bgStyle}>
        <div className="inner-page-hero">
          <button className="inner-page-back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="inner-page-weather">
            <div className="weather-datetime">{formatDayDisplay(currentTime)} | {formatTimeDisplay(currentTime)}</div>
            <div className="weather-temp-row">
              <WeatherIcon size={20} className="weather-icon" />
              <span className="weather-temp">{weatherData.temp}°</span>
            </div>
            <div className="weather-condition">{weatherData.conditionText}</div>
          </div>
          <div className="inner-page-title-container">
            <h1 className="inner-page-title">FAQ</h1>
          </div>
        </div>
        <div className="faq-loading-state">
          Loading FAQs...
        </div>
      </div>
    )
  }

  return (
    <div className="resident-faq resident-inner-page" style={bgStyle}>
      {/* Hero Section */}
      <div className="inner-page-hero">
        <button className="inner-page-back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="inner-page-weather">
          <div className="weather-datetime">{formatDayDisplay(currentTime)} | {formatTimeDisplay(currentTime)}</div>
          <div className="weather-temp-row">
            <WeatherIcon size={20} className="weather-icon" />
            <span className="weather-temp">{weatherData.temp}°</span>
          </div>
          <div className="weather-condition">{weatherData.conditionText}</div>
        </div>
        <div className="inner-page-title-container">
          <h1 className="inner-page-title">FAQ</h1>
        </div>
      </div>

      <main className="resident-faq-content">
        {/* Search Bar */}
        <div className="faq-search-wrapper animate-in delay-1">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        {availableCategories.length > 1 && (
          <div className="faq-category-pills animate-in delay-2">
            <button
              className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            {availableCategories.map(cat => (
              <button
                key={cat.id}
                className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                style={{ '--pill-color': cat.color }}
              >
                <cat.icon size={14} />
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* FAQ List */}
        <div className="faq-list-container">
          {filteredFAQs.length === 0 ? (
            <div className="faq-empty-state animate-in delay-3">
              <HelpCircle size={48} />
              <h3>No FAQs Found</h3>
              <p>
                {searchQuery
                  ? 'Try a different search term'
                  : 'FAQ content will be available soon'}
              </p>
            </div>
          ) : activeCategory === 'all' ? (
            // Grouped view
            Object.entries(groupedFAQs).map(([catId, catFaqs], groupIndex) => {
              const category = getCategory(catId)
              const CategoryIcon = category.icon

              return (
                <div key={catId} className={`faq-category-section animate-in delay-${groupIndex + 3}`}>
                  <div className="category-section-header" style={{ '--cat-color': category.color }}>
                    <CategoryIcon size={18} />
                    <span>{category.label}</span>
                    <span className="category-count">{catFaqs.length}</span>
                  </div>

                  <div className="category-questions">
                    {catFaqs.map(faq => (
                      <FAQAccordion
                        key={faq.id}
                        faq={faq}
                        isExpanded={expandedFAQs.includes(faq.id)}
                        onToggle={() => toggleFAQ(faq)}
                      />
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            // Single category view
            <div className="category-questions">
              {filteredFAQs.map((faq, index) => (
                <FAQAccordion
                  key={faq.id}
                  faq={faq}
                  isExpanded={expandedFAQs.includes(faq.id)}
                  onToggle={() => toggleFAQ(faq)}
                  className={`animate-in delay-${index + 3}`}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// FAQ Accordion Item Component
function FAQAccordion({ faq, isExpanded, onToggle, className = '' }) {
  return (
    <div className={`faq-accordion ${isExpanded ? 'expanded' : ''} ${className}`}>
      <button className="faq-accordion-header" onClick={onToggle}>
        <span className="faq-question-text">{faq.question}</span>
        <span className="faq-expand-icon">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </span>
      </button>

      {isExpanded && (
        <div className="faq-accordion-body">
          <p>{faq.answer}</p>
        </div>
      )}
    </div>
  )
}

export default ResidentFAQ
