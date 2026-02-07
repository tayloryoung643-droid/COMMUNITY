import { supabase } from '../lib/supabase'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const SIGNED_URL_EXPIRY = 3600 // 1 hour

// Whitelist of allowed user profile fields
const USER_PROFILE_FIELDS = [
  'full_name', 'phone', 'bio',
  'show_in_directory', 'show_unit_on_bulletin', 'allow_waves',
  'notify_announcements', 'notify_packages', 'notify_events', 'notify_messages'
]

// Whitelist of allowed building fields
const BUILDING_FIELDS = [
  'name', 'address', 'city', 'state', 'zip', 'total_units', 'description'
]

/**
 * Update user profile with whitelisted fields
 */
export async function updateUserProfile(userId, data) {
  const filtered = {}
  for (const key of USER_PROFILE_FIELDS) {
    if (key in data) filtered[key] = data[key]
  }

  const { error } = await supabase
    .from('users')
    .update(filtered)
    .eq('id', userId)

  if (error) {
    console.error('[settingsService] Error updating user profile:', error)
    throw new Error('Failed to save profile. Please try again.')
  }

  return { success: true }
}

/**
 * Upload a profile photo for a user
 */
export async function uploadProfilePhoto(userId, file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.')
  }

  const ext = file.name.split('.').pop().toLowerCase()
  const filePath = `${userId}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: true })

  if (uploadError) {
    console.error('[settingsService] Upload error:', uploadError)
    throw new Error('Failed to upload photo. Please try again.')
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: filePath })
    .eq('id', userId)

  if (updateError) {
    console.error('[settingsService] Update error:', updateError)
    throw new Error('Photo uploaded but failed to save. Please try again.')
  }

  const signedUrl = await createSignedProfileUrl(filePath)
  return { url: signedUrl, path: filePath }
}

/**
 * Remove profile photo for a user
 */
export async function removeProfilePhoto(userId) {
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('avatar_url')
    .eq('id', userId)
    .single()

  if (fetchError) throw new Error('Failed to fetch user data.')

  if (user?.avatar_url) {
    await supabase.storage.from('profile-images').remove([user.avatar_url])
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: null })
    .eq('id', userId)

  if (updateError) throw new Error('Failed to remove photo.')
  return { success: true }
}

/**
 * Update building info with whitelisted fields
 */
export async function updateBuildingInfo(buildingId, data) {
  const filtered = {}
  for (const key of BUILDING_FIELDS) {
    if (key in data) filtered[key] = data[key]
  }

  if (filtered.total_units) {
    filtered.total_units = parseInt(filtered.total_units, 10) || null
  }

  const { error } = await supabase
    .from('buildings')
    .update(filtered)
    .eq('id', buildingId)

  if (error) {
    console.error('[settingsService] Error updating building:', error)
    throw new Error('Failed to save building info. Please try again.')
  }

  return { success: true }
}

/**
 * Change password via Supabase Auth
 */
export async function changePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    console.error('[settingsService] Password change error:', error)
    throw new Error(error.message || 'Failed to change password.')
  }

  return { success: true }
}

/**
 * Get resident count for a building
 */
export async function getResidentCount(buildingId) {
  const { count, error } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('building_id', buildingId)
    .eq('role', 'resident')

  if (error) {
    console.error('[settingsService] Error getting resident count:', error)
    return 0
  }

  return count || 0
}

/**
 * Placeholder for sending invite emails (no backend yet)
 */
export async function sendInviteEmails(emails, accessCode, buildingName) {
  console.log('[settingsService] sendInviteEmails placeholder:', { emails, accessCode, buildingName })
  // In production, this would call a Resend/email backend
  return { success: true, sent: emails.length }
}

/**
 * Get building manager contact info for emergency section
 */
export async function getBuildingManagerContact(buildingId) {
  const { data, error } = await supabase
    .from('users')
    .select('full_name, phone, email')
    .eq('building_id', buildingId)
    .eq('role', 'manager')
    .limit(1)
    .single()

  if (error) {
    console.warn('[settingsService] No manager found for building:', buildingId)
    return null
  }

  return data
}

/**
 * Create a signed URL for a profile image
 */
export async function createSignedProfileUrl(filePath) {
  if (!filePath) return null

  const { data, error } = await supabase.storage
    .from('profile-images')
    .createSignedUrl(filePath, SIGNED_URL_EXPIRY)

  if (error) {
    console.warn('[settingsService] Error creating signed URL:', error)
    return null
  }

  return data?.signedUrl || null
}
