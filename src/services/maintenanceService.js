import { supabase } from '../lib/supabase'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Create a new maintenance request
 */
export async function createRequest(data) {
  const { error, data: result } = await supabase
    .from('maintenance_requests')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('[maintenanceService] Error creating request:', error)
    throw new Error('Failed to submit request. Please try again.')
  }

  return result
}

/**
 * Get all maintenance requests for the current resident
 */
export async function getMyRequests(userId) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[maintenanceService] Error fetching requests:', error)
    throw new Error('Failed to load requests.')
  }

  return data || []
}

/**
 * Get all maintenance requests for a building (BM view)
 */
export async function getBuildingRequests(buildingId) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('*, user:users(full_name, unit_number)')
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[maintenanceService] Error fetching building requests:', error)
    throw new Error('Failed to load maintenance requests.')
  }

  return data || []
}

/**
 * Update the status of a maintenance request (BM action)
 */
export async function updateRequestStatus(requestId, status) {
  const { error } = await supabase
    .from('maintenance_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)

  if (error) {
    console.error('[maintenanceService] Error updating status:', error)
    throw new Error('Failed to update status.')
  }

  return { success: true }
}

/**
 * Upload a photo for a maintenance request
 */
export async function uploadMaintenancePhoto(file, requestId) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.')
  }

  const ext = file.name.split('.').pop().toLowerCase()
  const filePath = `${requestId}/photo.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('maintenance-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: true })

  if (uploadError) {
    console.error('[maintenanceService] Upload error:', uploadError)
    throw new Error('Failed to upload photo. Please try again.')
  }

  // Save path to the request record
  const { error: updateError } = await supabase
    .from('maintenance_requests')
    .update({ photo_url: filePath })
    .eq('id', requestId)

  if (updateError) {
    console.error('[maintenanceService] Update photo_url error:', updateError)
    throw new Error('Photo uploaded but failed to save reference.')
  }

  return { path: filePath }
}
