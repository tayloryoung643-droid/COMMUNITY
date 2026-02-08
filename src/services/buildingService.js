import { supabase } from '../lib/supabase'

// ============================================
// BUILDING BACKGROUND IMAGE FUNCTIONS
// ============================================

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Signed URL expiration time (1 hour in seconds)
const SIGNED_URL_EXPIRY = 3600

/**
 * Create a signed URL for a building image path
 * @param {string} filePath - The storage path (e.g., "building-id/background.jpg")
 * @returns {Promise<string|null>} - Signed URL or null if failed
 */
async function createSignedImageUrl(filePath) {
  if (!filePath) return null

  const { data, error } = await supabase.storage
    .from('building-images')
    .createSignedUrl(filePath, SIGNED_URL_EXPIRY)

  if (error) {
    console.error('[buildingService] Error creating signed URL:', error)
    return null
  }

  return data?.signedUrl || null
}

/**
 * Upload a background image for a building
 * @param {string} buildingId - Building UUID
 * @param {File} file - Image file to upload
 * @returns {Promise<{url: string, path: string}>} - Signed URL and storage path
 */
export async function uploadBuildingBackgroundImage(buildingId, file) {
  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.')
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.')
  }

  // Get file extension
  const ext = file.name.split('.').pop().toLowerCase()
  const filePath = `${buildingId}/background.${ext}`

  console.log('[buildingService] Uploading background image:', filePath)

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('building-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true // Overwrite existing file
    })

  if (error) {
    console.error('[buildingService] Upload error:', error)
    throw new Error('Failed to upload image. Please try again.')
  }

  // Store just the file PATH in the database (not the full URL)
  // This allows us to generate signed URLs on demand for private buckets
  const { error: updateError } = await supabase
    .from('buildings')
    .update({ background_image_url: filePath })
    .eq('id', buildingId)

  if (updateError) {
    console.error('[buildingService] Update error:', updateError)
    throw new Error('Image uploaded but failed to save to building. Please try again.')
  }

  // Generate a signed URL for immediate display
  const signedUrl = await createSignedImageUrl(filePath)

  console.log('[buildingService] Background image saved, path:', filePath)
  return { url: signedUrl, path: filePath }
}

/**
 * Remove the background image for a building
 * @param {string} buildingId - Building UUID
 */
export async function removeBuildingBackgroundImage(buildingId) {
  console.log('[buildingService] Removing background image for building:', buildingId)

  // First get the current path
  const { data: building, error: fetchError } = await supabase
    .from('buildings')
    .select('background_image_url')
    .eq('id', buildingId)
    .single()

  if (fetchError) {
    console.error('[buildingService] Fetch error:', fetchError)
    throw new Error('Failed to fetch building data.')
  }

  // Delete from storage if file path exists
  // background_image_url now stores just the path (e.g., "building-id/background.jpg")
  if (building?.background_image_url) {
    const filePath = building.background_image_url
    const { error: deleteError } = await supabase.storage
      .from('building-images')
      .remove([filePath])

    if (deleteError) {
      console.warn('[buildingService] Storage delete warning:', deleteError)
      // Continue anyway - we still want to clear the path
    }
  }

  // Clear the path in the database
  const { error: updateError } = await supabase
    .from('buildings')
    .update({ background_image_url: null })
    .eq('id', buildingId)

  if (updateError) {
    console.error('[buildingService] Update error:', updateError)
    throw new Error('Failed to remove image from building.')
  }

  console.log('[buildingService] Background image removed')
  return { success: true }
}

/**
 * Get the background image signed URL for a building
 * @param {string} buildingId - Building UUID
 * @returns {Promise<string|null>} - Signed URL for the background image or null
 */
export async function getBuildingBackgroundImage(buildingId) {
  const { data, error } = await supabase
    .from('buildings')
    .select('background_image_url')
    .eq('id', buildingId)
    .single()

  if (error) {
    console.error('[buildingService] Error fetching background image:', error)
    return null
  }

  // background_image_url stores just the path - generate a signed URL
  const filePath = data?.background_image_url
  if (!filePath) return null

  const signedUrl = await createSignedImageUrl(filePath)
  return signedUrl
}

/**
 * Get building details including background image (with signed URL)
 * @param {string} buildingId - Building UUID
 */
export async function getBuildingById(buildingId) {
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', buildingId)
    .single()

  if (error) {
    console.error('[buildingService] Error fetching building:', error)
    throw error
  }

  // If there's a background image path, generate a signed URL
  if (data?.background_image_url) {
    const signedUrl = await createSignedImageUrl(data.background_image_url)
    return {
      ...data,
      background_image_path: data.background_image_url, // Keep original path
      background_image_url: signedUrl // Replace with signed URL for display
    }
  }

  return data
}

// ============================================
// EXISTING FUNCTIONS
// ============================================

export async function validateBuildingCode(code) {
  try {
    const { data, error } = await supabase
      .from('buildings')
      .select('id, name, access_code')
      .eq('access_code', code.toUpperCase())
      .single()

    if (error) {
      // No building found with this code
      return { valid: false, building: null }
    }

    return { valid: true, building: data }
  } catch (error) {
    console.error('Error validating building code:', error)
    return { valid: false, building: null }
  }
}

export async function getBuildingByCode(code) {
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('access_code', code.toUpperCase())
    .single()

  if (error) throw error
  return data
}

/**
 * Search buildings by address (case-insensitive partial match)
 * Returns buildings with their resident counts
 */
export async function searchBuildingsByAddress(query) {
  try {
    if (!query || query.trim().length < 3) {
      return []
    }

    const searchTerm = query.trim().toLowerCase()

    // Search by address OR name (case-insensitive)
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .or(`address.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
      .limit(10)

    if (error) {
      console.error('Error searching buildings:', error)
      return []
    }

    // Get resident counts for each building
    const buildingsWithCounts = await Promise.all(
      (data || []).map(async (building) => {
        const { count } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('building_id', building.id)
          .eq('role', 'resident')

        return {
          ...building,
          resident_count: count || 0,
        }
      })
    )

    return buildingsWithCounts
  } catch (error) {
    console.error('Error in searchBuildingsByAddress:', error)
    return []
  }
}

/**
 * Get a building by its invite slug
 */
export async function getBuildingByInviteSlug(slug) {
  if (!slug) return null
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('invite_slug', slug)
    .single()

  if (error) return null
  return data
}

/**
 * Normalize an address for duplicate detection
 */
export function normalizeAddress(address) {
  if (!address) return ''
  return address
    .toLowerCase()
    .trim()
    .replace(/\bstreet\b/g, 'st')
    .replace(/\bavenue\b/g, 'ave')
    .replace(/\bdrive\b/g, 'dr')
    .replace(/\bboulevard\b/g, 'blvd')
    .replace(/\broad\b/g, 'rd')
    .replace(/\blane\b/g, 'ln')
    .replace(/\bcourt\b/g, 'ct')
    .replace(/\bapartment\b/g, 'apt')
    .replace(/\bsuite\b/g, 'ste')
    .replace(/[.,#]/g, '')
    .replace(/\s+/g, ' ')
}

/**
 * Update a building's data
 */
export async function updateBuilding(buildingId, data) {
  const { data: updated, error } = await supabase
    .from('buildings')
    .update(data)
    .eq('id', buildingId)
    .select()
    .single()

  if (error) throw error
  return updated
}
