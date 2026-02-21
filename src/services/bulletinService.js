import { supabase } from '../lib/supabase'

// Attach author info to listings — checks BOTH author_id and user_id columns
// because listings created at different times may use either column.
// Uses select('*') so listings with NULL poster ID still appear.
async function attachAuthors(listings) {
  // Collect poster IDs from whichever column is set on each listing
  const posterIds = [...new Set(
    listings.map(l => l.author_id || l.user_id).filter(Boolean)
  )]
  if (posterIds.length === 0) return

  const { data: authors, error } = await supabase
    .from('users')
    .select('id, full_name, unit_number, role, avatar_url')
    .in('id', posterIds)

  if (error) {
    console.error('[bulletinService] Error fetching authors:', error)
    return
  }

  const authorMap = {}
  ;(authors || []).forEach(a => { authorMap[a.id] = a })

  // Generate signed avatar URLs
  const avatarUrlMap = {}
  const authorsWithAvatars = (authors || []).filter(a => a.avatar_url)
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
    const aid = listing.author_id || listing.user_id
    listing.author = authorMap[aid] || null
    if (listing.author && avatarUrlMap[listing.author.id]) {
      listing.author.avatar_signed_url = avatarUrlMap[listing.author.id]
    }
  })
}

export async function getListings(buildingId) {
  const { data, error } = await supabase
    .from('bulletin_listings')
    .select('*')
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  if (data && data.length > 0) {
    await attachAuthors(data)
  }

  return data
}

export async function getListingsByCategory(buildingId, category) {
  const { data, error } = await supabase
    .from('bulletin_listings')
    .select('*')
    .eq('building_id', buildingId)
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) throw error

  if (data && data.length > 0) {
    await attachAuthors(data)
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
    .select('*')
    .eq('building_id', buildingId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error

  if (data && data.length > 0) {
    await attachAuthors(data)
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
