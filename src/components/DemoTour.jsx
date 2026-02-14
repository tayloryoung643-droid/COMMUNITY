import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import './DemoTour.css'

const RESIDENT_STEPS = [
  {
    selector: '[data-tour="today-section"]',
    title: 'Your building at a glance',
    description: "See today's announcements, events, and everything happening in your building.",
    position: 'bottom'
  },
  {
    selector: '[data-tour="announcement-card"]',
    title: 'Never miss a building notice',
    description: 'Important updates from your building manager — maintenance, meetings, and more.',
    position: 'bottom'
  },
  {
    selector: '[data-tour="nav-community"]',
    title: 'Stay connected with neighbors',
    description: 'Ask for help, share recommendations, or just say hi to the people in your building.',
    position: 'top'
  },
  {
    selector: '[data-tour="bulletin-preview"]',
    title: 'Your building marketplace',
    description: 'Buy, sell, trade, or find services from people in your building you already trust.',
    position: 'bottom'
  },
  {
    selector: '[data-tour="nav-events"]',
    title: "What's coming up",
    description: 'BBQs, strata meetings, maintenance windows — RSVP and never miss out.',
    position: 'top'
  }
]

const MANAGER_STEPS = [
  {
    selector: '[data-tour="dashboard-overview"]',
    title: 'Your building command center',
    description: 'See resident activity, announcements, and building stats at a glance.',
    position: 'bottom'
  },
  {
    selector: '[data-tour="quick-actions"]',
    title: 'Everything one click away',
    description: 'Post announcements, log packages, invite residents, and manage events — all from here.',
    position: 'left'
  },
  {
    selector: '[data-tour="nav-community"]',
    title: 'Communicate with everyone instantly',
    description: 'Post a notice and every resident sees it. No more paper, no more email chains.',
    position: 'right'
  },
  {
    selector: '[data-tour="nav-messages"]',
    title: 'Direct resident communication',
    description: 'Residents can message you directly. Answer questions in one place instead of scattered emails.',
    position: 'right'
  },
  {
    selector: '[data-tour="nav-elevator"]',
    title: 'Manage bookings effortlessly',
    description: 'Residents book elevator time or amenity rooms. You approve and manage the schedule.',
    position: 'right'
  },
  {
    selector: '[data-tour="nav-residents"]',
    title: 'Know your building',
    description: 'See who has joined, invite new residents, and track building adoption.',
    position: 'right'
  }
]

const TOOLTIP_GAP = 12
const SPOTLIGHT_PADDING = 8

function DemoTour({ role }) {
  console.log('[DemoTour] Mounted/rendered with role:', role)

  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [targetRect, setTargetRect] = useState(null)
  const resizeTimer = useRef(null)

  const allSteps = role === 'manager' ? MANAGER_STEPS : RESIDENT_STEPS

  // Filter steps to only those whose targets exist in the DOM
  const [visibleSteps, setVisibleSteps] = useState([])

  // Initialize tour with retry logic
  useEffect(() => {
    const storageKey = `demo-tour-${role}`
    const storageVal = sessionStorage.getItem(storageKey)
    console.log('[DemoTour] Init effect — role:', role, 'sessionStorage:', storageVal)
    if (storageVal === 'done') return

    let cancelled = false
    let attempt = 0

    const tryStart = () => {
      if (cancelled) return
      attempt++
      const allTargets = document.querySelectorAll('[data-tour]')
      console.log('[DemoTour] Attempt', attempt, '— all data-tour elements in DOM:',
        allTargets.length, Array.from(allTargets).map(el => el.getAttribute('data-tour')))

      const available = allSteps.filter(step =>
        document.querySelector(step.selector)
      )
      console.log('[DemoTour] Matched steps:', available.length, '/', allSteps.length)

      if (available.length > 0) {
        setVisibleSteps(available)
        setIsActive(true)
        console.log('[DemoTour] Tour activated with', available.length, 'steps')
        return
      }

      // Retry up to 6 times at 500ms intervals
      if (attempt < 6) {
        setTimeout(tryStart, 500)
      } else {
        console.warn('[DemoTour] Gave up after', attempt, 'attempts — no targets found')
      }
    }

    // First attempt after 600ms to let the page render
    setTimeout(tryStart, 600)

    return () => { cancelled = true }
  }, [role]) // eslint-disable-line react-hooks/exhaustive-deps

  // Position the spotlight on the current target
  const updatePosition = useCallback(() => {
    if (!isActive || visibleSteps.length === 0) return

    const step = visibleSteps[currentStep]
    if (!step) return

    const el = document.querySelector(step.selector)
    if (!el) {
      // Target disappeared — skip to next
      if (currentStep < visibleSteps.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        dismissTour()
      }
      return
    }

    // Scroll into view if needed
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Small delay to let scroll finish
    setTimeout(() => {
      const rect = el.getBoundingClientRect()
      console.log('[DemoTour] Target rect for step', currentStep, ':', {
        top: rect.top, left: rect.left, width: rect.width, height: rect.height,
        selector: step.selector
      })
      setTargetRect(rect)
    }, 350)
  }, [isActive, visibleSteps, currentStep]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    updatePosition()
  }, [updatePosition])

  // Recalculate on resize (debounced)
  useEffect(() => {
    const handleResize = () => {
      clearTimeout(resizeTimer.current)
      resizeTimer.current = setTimeout(updatePosition, 150)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer.current)
    }
  }, [updatePosition])

  const dismissTour = () => {
    setIsActive(false)
    sessionStorage.setItem(`demo-tour-${role}`, 'done')
  }

  const handleNext = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      dismissTour()
    }
  }

  if (!isActive || !targetRect || visibleSteps.length === 0) {
    console.log('[DemoTour] Not rendering — isActive:', isActive, 'targetRect:', !!targetRect, 'steps:', visibleSteps.length)
    return null
  }
  console.log('[DemoTour] Rendering portal — step:', currentStep + 1, '/', visibleSteps.length, 'rect:', targetRect)

  const step = visibleSteps[currentStep]
  const isLast = currentStep === visibleSteps.length - 1

  // Spotlight rect (with padding)
  const spotlightStyle = {
    top: targetRect.top - SPOTLIGHT_PADDING,
    left: targetRect.left - SPOTLIGHT_PADDING,
    width: targetRect.width + SPOTLIGHT_PADDING * 2,
    height: targetRect.height + SPOTLIGHT_PADDING * 2
  }

  // Calculate tooltip position
  const tooltipStyle = {}
  let arrowClass = ''
  const pos = step.position || 'bottom'

  if (pos === 'bottom') {
    tooltipStyle.top = targetRect.bottom + SPOTLIGHT_PADDING + TOOLTIP_GAP
    tooltipStyle.left = Math.max(20, Math.min(
      targetRect.left + targetRect.width / 2 - 160,
      window.innerWidth - 340
    ))
    arrowClass = 'arrow-top'
  } else if (pos === 'top') {
    tooltipStyle.left = Math.max(20, Math.min(
      targetRect.left + targetRect.width / 2 - 160,
      window.innerWidth - 340
    ))
    arrowClass = 'arrow-bottom'
    // We'll set top after we know tooltip height — use bottom anchoring
    tooltipStyle.bottom = window.innerHeight - targetRect.top + SPOTLIGHT_PADDING + TOOLTIP_GAP
  } else if (pos === 'right') {
    tooltipStyle.top = targetRect.top + targetRect.height / 2 - 60
    tooltipStyle.left = targetRect.right + SPOTLIGHT_PADDING + TOOLTIP_GAP
    arrowClass = 'arrow-left'
  } else if (pos === 'left') {
    tooltipStyle.top = targetRect.top + targetRect.height / 2 - 60
    tooltipStyle.right = window.innerWidth - targetRect.left + SPOTLIGHT_PADDING + TOOLTIP_GAP
    arrowClass = 'arrow-right'
  }

  return createPortal(
    <>
      {/* Click blocker behind spotlight */}
      <div className="tour-click-blocker" onClick={dismissTour} />

      {/* Spotlight cutout */}
      <div className="tour-spotlight" style={spotlightStyle} />

      {/* Tooltip */}
      <div className="tour-tooltip" style={tooltipStyle}>
        <div className={`tour-tooltip-arrow ${arrowClass}`} />
        <h3 className="tour-tooltip-title">{step.title}</h3>
        <p className="tour-tooltip-description">{step.description}</p>
        <div className="tour-tooltip-footer">
          <button className="tour-skip-btn" onClick={dismissTour}>
            Skip tour
          </button>
          <span className="tour-step-indicator">
            {currentStep + 1} of {visibleSteps.length}
          </span>
          <button className="tour-next-btn" onClick={handleNext}>
            {isLast ? 'Start Exploring' : 'Next \u2192'}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

export default DemoTour
