import { ArrowLeft } from 'lucide-react'
import './LegalPage.css'

function Terms({ onBack }) {
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      window.history.back()
    }
  }

  return (
    <div className="legal-page">
      <header className="legal-header">
        <button className="legal-back-btn" onClick={handleBack}>
          <ArrowLeft size={16} />
          Back
        </button>
        <span className="legal-header-title">Terms of Service</span>
      </header>

      <div className="legal-content">
        <h1>Terms of Service</h1>
        <p className="legal-last-updated">Last updated: February 2026</p>
        <p className="legal-intro">
          Welcome to COMMUNITY. By creating an account or using our platform, you agree to these Terms of Service. Please read them carefully.
        </p>

        <h2>1. What COMMUNITY Is</h2>
        <p>
          COMMUNITY is a platform that connects apartment building residents and property managers. It provides tools for building communication, event coordination, package tracking, neighbor connections, and community engagement. COMMUNITY is operated by Taylor Young.
        </p>

        <h2>2. Your Account</h2>
        <ul>
          <li>You must provide accurate information when creating your account</li>
          <li>You are responsible for maintaining the security of your account credentials</li>
          <li>You may only belong to one building at a time</li>
          <li>You must be at least 18 years old to create an account</li>
          <li>You are responsible for all activity that occurs under your account</li>
        </ul>

        <h2>3. Acceptable Use</h2>
        <p>You agree NOT to:</p>
        <ul>
          <li>Use COMMUNITY for any unlawful purpose</li>
          <li>Harass, threaten, or intimidate other users</li>
          <li>Post false, misleading, or defamatory content</li>
          <li>Share other residents' personal information outside the platform without their consent</li>
          <li>Attempt to gain unauthorized access to other accounts or building data</li>
          <li>Use the platform to send spam or unsolicited communications</li>
          <li>Impersonate another person or property manager</li>
        </ul>

        <h2>4. Content You Post</h2>
        <ul>
          <li>You retain ownership of content you create (posts, photos, events, etc.)</li>
          <li>By posting content, you grant COMMUNITY a non-exclusive license to display that content within the platform to other users in your building</li>
          <li>You are responsible for the content you post and must have the right to share it</li>
          <li>COMMUNITY may remove content that violates these Terms</li>
        </ul>

        <h2>5. Property Manager Responsibilities</h2>
        <p>If you are a property manager using COMMUNITY:</p>
        <ul>
          <li>You represent that you have the authority to act on behalf of the building you manage</li>
          <li>You are responsible for the accuracy of building information you provide</li>
          <li>You are responsible for managing resident access to your building on the platform</li>
          <li>Resident data you import or manage through COMMUNITY must be handled in accordance with applicable privacy laws</li>
        </ul>

        <h2>6. Privacy</h2>
        <p>
          Your use of COMMUNITY is also governed by our <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>, which describes how we collect, use, and protect your information.
        </p>

        <h2>7. Availability & Changes</h2>
        <ul>
          <li>COMMUNITY is provided "as is" without warranties of any kind</li>
          <li>We may modify, suspend, or discontinue features at any time</li>
          <li>We may update these Terms from time to time and will notify users of significant changes</li>
          <li>Continued use of the platform after changes constitutes acceptance</li>
        </ul>

        <h2>8. Limitation of Liability</h2>
        <p>COMMUNITY is a communication and coordination tool. We are not responsible for:</p>
        <ul>
          <li>Actions taken by other users on or off the platform</li>
          <li>The accuracy of content posted by users or property managers</li>
          <li>Any disputes between residents, or between residents and property managers</li>
          <li>Physical property, package deliveries, or building maintenance outcomes</li>
          <li>Any indirect, incidental, or consequential damages arising from use of the platform</li>
        </ul>

        <h2>9. Termination</h2>
        <ul>
          <li>You may delete your account at any time through Settings</li>
          <li>We may suspend or terminate accounts that violate these Terms</li>
          <li>Upon termination, your right to use COMMUNITY ceases immediately</li>
        </ul>

        <h2>10. Contact</h2>
        <p>
          If you have questions about these Terms, contact us through the Help & Feedback feature in the app or at support@communityhq.space.
        </p>
      </div>
    </div>
  )
}

export default Terms
