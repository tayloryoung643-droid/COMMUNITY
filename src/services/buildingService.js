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
