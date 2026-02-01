import { supabase } from '../lib/supabase'

// ============================================
// BUILDING BACKGROUND IMAGE FUNCTIONS
// ============================================

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Upload a background image for a building
 * @param {string} buildingId - Building UUID
 * @param {File} file - Image file to upload
 * @returns {Promise<{url: string}>} - Public URL of the uploaded image
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

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('building-images')
    .getPublicUrl(filePath)

  const publicUrl = urlData.publicUrl

  // Update the building record with the image URL
  const { error: updateError } = await supabase
    .from('buildings')
    .update({ background_image_url: publicUrl })
    .eq('id', buildingId)

  if (updateError) {
    console.error('[buildingService] Update error:', updateError)
    throw new Error('Image uploaded but failed to save to building. Please try again.')
  }

  console.log('[buildingService] Background image saved:', publicUrl)
  return { url: publicUrl }
}

/**
 * Remove the background image for a building
 * @param {string} buildingId - Building UUID
 */
export async function removeBuildingBackgroundImage(buildingId) {
  console.log('[buildingService] Removing background image for building:', buildingId)

  // First get the current URL to determine the file path
  const { data: building, error: fetchError } = await supabase
    .from('buildings')
    .select('background_image_url')
    .eq('id', buildingId)
    .single()

  if (fetchError) {
    console.error('[buildingService] Fetch error:', fetchError)
    throw new Error('Failed to fetch building data.')
  }

  // Delete from storage if file exists
  if (building?.background_image_url) {
    // Extract file path from URL
    const url = new URL(building.background_image_url)
    const pathParts = url.pathname.split('/building-images/')
    if (pathParts.length > 1) {
      const filePath = pathParts[1]
      const { error: deleteError } = await supabase.storage
        .from('building-images')
        .remove([filePath])

      if (deleteError) {
        console.warn('[buildingService] Storage delete warning:', deleteError)
        // Continue anyway - we still want to clear the URL
      }
    }
  }

  // Clear the URL in the database
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
 * Get the background image URL for a building
 * @param {string} buildingId - Building UUID
 * @returns {Promise<string|null>} - Background image URL or null
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

  return data?.background_image_url || null
}

/**
 * Get building details including background image
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
      .select(`
        id,
        name,
        address,
        access_code,
        building_mode
      `)
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
