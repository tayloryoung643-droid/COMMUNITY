import { ArrowLeft } from 'lucide-react'
import './LegalPage.css'

function Privacy({ onBack }) {
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
        <span className="legal-header-title">Privacy Policy</span>
      </header>

      <div className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="legal-last-updated">Last updated: February 2026</p>
        <p className="legal-intro">
          COMMUNITY is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your choices.
        </p>

        <h2>1. Information We Collect</h2>
        <p><strong>Information you provide:</strong></p>
        <ul>
          <li>Name, email address, and unit number when you create an account</li>
          <li>Profile information (bio, profile photo) if you choose to add it</li>
          <li>Content you post (community posts, events, bulletin listings, photos)</li>
          <li>Messages you send through the platform</li>
          <li>Feedback and support requests</li>
        </ul>
        <p><strong>Information collected automatically:</strong></p>
        <ul>
          <li>Basic usage data (pages visited, features used)</li>
          <li>Device type and browser information</li>
          <li>Login timestamps</li>
        </ul>
        <p><strong>Information from property managers:</strong></p>
        <ul>
          <li>If your building manager uses COMMUNITY, they may import your name, email, and unit number to invite you to the platform</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide and operate the COMMUNITY platform</li>
          <li>To connect you with other residents in your building</li>
          <li>To send you notifications about building activity (events, announcements, packages)</li>
          <li>To send email communications (building announcements, invitations, account updates)</li>
          <li>To improve our platform and develop new features</li>
          <li>To respond to your support requests</li>
        </ul>

        <h2>3. What We Share</h2>
        <ul>
          <li>Your profile information (name, unit, bio, photo) is visible to other residents in your building</li>
          <li>Your posts, events, and bulletin listings are visible to members of your building</li>
          <li>We do NOT sell your personal information to third parties</li>
          <li>We do NOT share your information with advertisers</li>
          <li>We may share information if required by law or to protect the safety of our users</li>
        </ul>

        <h2>4. Building Manager Access</h2>
        <p>Property managers for your building can see:</p>
        <ul>
          <li>Names and unit numbers of residents in their building</li>
          <li>Content posted within the building</li>
          <li>Event RSVPs and participation</li>
          <li>Package tracking information (managed buildings only)</li>
        </ul>
        <p>Property managers cannot see:</p>
        <ul>
          <li>Your private messages with other residents</li>
          <li>Your account password</li>
          <li>Your activity in other buildings (if applicable)</li>
        </ul>

        <h2>5. Data Storage & Security</h2>
        <ul>
          <li>Your data is stored securely using Supabase cloud infrastructure</li>
          <li>We use encryption for data in transit</li>
          <li>We implement access controls to protect your information</li>
          <li>No system is 100% secure, and we cannot guarantee absolute security</li>
        </ul>

        <h2>6. Your Choices</h2>
        <ul>
          <li>You can update your profile information in Settings at any time</li>
          <li>You can delete your account through Settings, which will remove your profile and content</li>
          <li>You can choose what personal information to include in your profile</li>
          <li>You can control email notification preferences in Settings (once available)</li>
        </ul>

        <h2>7. Email Communications</h2>
        <ul>
          <li>Building managers may send building-wide announcements to your email address</li>
          <li>You may receive invitation emails from neighbors or building managers</li>
          <li>You can unsubscribe from non-essential emails at any time</li>
        </ul>

        <h2>8. Children's Privacy</h2>
        <p>
          COMMUNITY is not intended for users under 18 years of age. We do not knowingly collect information from children.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify users of significant changes. Continued use of COMMUNITY after changes constitutes acceptance.
        </p>

        <h2>10. Contact</h2>
        <p>
          If you have questions about this Privacy Policy, contact us through the Help & Feedback feature in the app or at support@communityhq.space.
        </p>
      </div>
    </div>
  )
}

export default Privacy
