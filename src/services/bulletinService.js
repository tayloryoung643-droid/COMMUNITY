import { supabase } from '../lib/supabase'

export async function getListings(buildingId) {
  // First get the listings
  const { data, error } = await supabase
    .from('bulletin_listings')
    .select('*')
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Then fetch author info for each listing (handle both author_id and user_id columns)
  if (data && data.length > 0) {
    const authorIds = [...new Set(
      data.map(l => l.author_id || l.user_id).filter(Boolean)
    )]
    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from('users')
        .select('id, full_name, first_name, last_name, unit_number, role, avatar_url')
        .in('id', authorIds)

      const authorMap = {}
      if (authors) {
        authors.forEach(a => { authorMap[a.id] = a })
      }

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
          } catch (e) { /* ignore */ }
        })
      )

      // Attach author to each listing
      data.forEach(listing => {
        const aid = listing.author_id || listing.user_id
        listing.author = authorMap[aid] || null
        if (listing.author) {
          listing.author.avatar_signed_url = avatarUrlMap[aid] || null
        }
      })
    }
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

  // Fetch author info (handle both author_id and user_id columns)
  if (data && data.length > 0) {
    const authorIds = [...new Set(
      data.map(l => l.author_id || l.user_id).filter(Boolean)
    )]
    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from('users')
        .select('id, full_name, first_name, last_name, unit_number, role, avatar_url')
        .in('id', authorIds)

      const authorMap = {}
      if (authors) {
        authors.forEach(a => { authorMap[a.id] = a })
      }

      const avatarUrlMap = {}
      const authorsWithAvatars = (authors || []).filter(a => a.avatar_url)
      await Promise.all(
        authorsWithAvatars.map(async (author) => {
          try {
            const { data: urlData } = await supabase.storage
              .from('profile-images')
              .createSignedUrl(author.avatar_url, 3600)
            if (urlData?.signedUrl) avatarUrlMap[author.id] = urlData.signedUrl
          } catch (e) { /* ignore */ }
        })
      )

      data.forEach(listing => {
        const aid = listing.author_id || listing.user_id
        listing.author = authorMap[aid] || null
        if (listing.author) {
          listing.author.avatar_signed_url = avatarUrlMap[aid] || null
        }
      })
    }
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

  if (error) throw error

  // Fetch author info (including avatar_url for profile photos)
  // Handle both author_id and user_id columns (schema may vary)
  if (data && data.length > 0) {
    const authorIds = [...new Set(
      data.map(l => l.author_id || l.user_id).filter(Boolean)
    )]
    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from('users')
        .select('id, full_name, first_name, last_name, unit_number, role, avatar_url')
        .in('id', authorIds)

      const authorMap = {}
      if (authors) {
        authors.forEach(a => { authorMap[a.id] = a })
      }

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
          } catch (e) { /* ignore */ }
        })
      )

      data.forEach(listing => {
        const aid = listing.author_id || listing.user_id
        listing.author = authorMap[aid] || null
        if (listing.author) {
          listing.author.avatar_signed_url = avatarUrlMap[aid] || null
        }
      })
    }
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
