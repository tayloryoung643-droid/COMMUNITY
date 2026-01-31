import { supabase } from '../lib/supabase'

export async function getPackages(buildingId) {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('building_id', buildingId)
    .order('arrival_date', { ascending: false })

  if (error) throw error
  return data
}

export async function addPackage(packageData) {
  const { data, error } = await supabase
    .from('packages')
    .insert([packageData])
    .select()

  if (error) throw error
  return data[0]
}

export async function updatePackageStatus(packageId, status, pickupDate = null) {
  const updateData = { status }
  if (pickupDate) updateData.pickup_date = pickupDate

  const { data, error } = await supabase
    .from('packages')
    .update(updateData)
    .eq('id', packageId)
    .select()

  if (error) throw error
  return data[0]
}

export async function deletePackage(packageId) {
  const { error } = await supabase
    .from('packages')
    .delete()
    .eq('id', packageId)

  if (error) throw error
  return true
}

export async function updatePackage(packageId, updateData) {
  const { data, error } = await supabase
    .from('packages')
    .update(updateData)
    .eq('id', packageId)
    .select()

  if (error) throw error
  return data[0]
}
