import { useAuth } from '../contexts/AuthContext'

/**
 * Permission hook for trust tier-based access control
 *
 * Trust Tier Levels (simplified - no Tier 0):
 * - Tier 1 (Resident): Default for all users. Full resident access.
 * - Tier 2 (Staff/Manager): Moderation and admin capabilities.
 */
export function usePermissions() {
  const { userProfile, isDemoMode } = useAuth()

  // Get trust tier from profile, default to 1 (all users have full access)
  const trustTier = isDemoMode
    ? (userProfile?.role === 'manager' ? 2 : 1)
    : (userProfile?.trust_tier ?? 1)

  // All users can interact (no Tier 0 restrictions)
  const canInteract = true
  const canModerate = trustTier >= 2  // Staff/manager only

  // All resident features are available to everyone
  const canPost = true
  const canComment = true
  const canRSVP = true
  const canCreateEvent = true
  const canCreateListing = true
  const canBookAmenity = true
  const canWaveToNeighbor = true
  const canSendMessage = true

  // Moderation permissions (Tier 2 only)
  const canFlagContent = canModerate
  const canRemovePost = canModerate
  const canManageResidents = canModerate

  return {
    trustTier,
    // General permission checks
    canInteract,
    canModerate,
    // Specific permissions (all true for residents)
    canPost,
    canComment,
    canRSVP,
    canCreateEvent,
    canCreateListing,
    canBookAmenity,
    canWaveToNeighbor,
    canSendMessage,
    // Moderation
    canFlagContent,
    canRemovePost,
    canManageResidents,
    // Role helpers
    isStaff: trustTier >= 2,
  }
}

export default usePermissions
