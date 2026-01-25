import { supabase } from '../lib/supabase'

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
