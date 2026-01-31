import { supabase } from '../lib/supabase'

export async function getListings(buildingId) {
  const { data, error } = await supabase
    .from('bulletin_listings')
    .select('*, author:author_id(id, full_name, first_name, last_name, unit_number)')
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getListingsByCategory(buildingId, category) {
  const { data, error } = await supabase
    .from('bulletin_listings')
    .select('*, author:author_id(id, full_name, first_name, last_name, unit_number)')
    .eq('building_id', buildingId)
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createListing(listingData) {
  const { data, error } = await supabase
    .from('bulletin_listings')
    .insert([listingData])
    .select()

  if (error) throw error
  return data[0]
}

export async function updateListing(listingId, listingData) {
  const { data, error } = await supabase
    .from('bulletin_listings')
    .update(listingData)
    .eq('id', listingId)
    .select()

  if (error) throw error
  return data[0]
}

export async function deleteListing(listingId) {
  const { error } = await supabase
    .from('bulletin_listings')
    .delete()
    .eq('id', listingId)

  if (error) throw error
  return true
}

export async function getActiveListings(buildingId) {
  const { data, error } = await supabase
    .from('bulletin_listings')
    .select('*, author:author_id(id, full_name, first_name, last_name, unit_number)')
    .eq('building_id', buildingId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function markAsSold(listingId) {
  const { data, error } = await supabase
    .from('bulletin_listings')
    .update({ status: 'sold' })
    .eq('id', listingId)
    .select()

  if (error) throw error
  return data[0]
}
