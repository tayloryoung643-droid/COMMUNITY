import { supabase } from '../lib/supabase'

// Join author via the author_id foreign key — same pattern used by
// aiBuildingDataService and managerDashboardService
const LISTING_SELECT = '*, author:author_id(id, full_name, first_name, last_name, unit_number, role, avatar_url)'

// Generate signed avatar URLs for authors that have avatar_url stored
async function attachSignedAvatarUrls(listings) {
  const authorsWithAvatars = listings
    .filter(l => l.author?.avatar_url)
    .map(l => ({ id: l.author.id, avatar_url: l.author.avatar_url }))
    .filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i)

  if (authorsWithAvatars.length === 0) return

  const avatarUrlMap = {}
  await Promise.all(
    authorsWithAvatars.map(async (author) => {
      try {
        const { data: urlData } = await supabase.storage
          .from('profile-images')
          .createSignedUrl(author.avatar_url, 3600)
        if (urlData?.signedUrl) avatarUrlMap[author.id] = urlData.signedUrl
      } catch (e) { /* ignore failed signed URL generation */ }
    })
  )

  listings.forEach(listing => {
    if (listing.author?.id && avatarUrlMap[listing.author.id]) {
      listing.author.avatar_signed_url = avatarUrlMap[listing.author.id]
    }
  })
}

export async function getListings(buildingId) {
  const { data, error } = await supabase
    .from('bulletin_listings')
    .select(LISTING_SELECT)
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })

  if (error) throw error

  if (data && data.length > 0) {
    await attachSignedAvatarUrls(data)
  }

  return data
}

export async function getListingsByCategory(buildingId, category) {
  const { data, error } = await supabase
    .from('bulletin_listings')
    .select(LISTING_SELECT)
    .eq('building_id', buildingId)
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) throw error

  if (data && data.length > 0) {
    await attachSignedAvatarUrls(data)
  }

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
    .select(LISTING_SELECT)
    .eq('building_id', buildingId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error

  if (data && data.length > 0) {
    await attachSignedAvatarUrls(data)
  }

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
