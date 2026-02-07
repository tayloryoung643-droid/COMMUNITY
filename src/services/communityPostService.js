import { supabase } from '../lib/supabase'

export async function getPosts(buildingId) {
  // First fetch posts
  const { data: posts, error: postsError } = await supabase
    .from('community_posts')
    .select('*')
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })

  if (postsError) throw postsError
  if (!posts || posts.length === 0) return []

  const postIds = posts.map(p => p.id)

  // Get unique author IDs
  const authorIds = [...new Set(posts.map(p => p.author_id).filter(Boolean))]

  // Fetch authors, comment counts, and like counts in parallel
  const [usersResult, commentsResult, likesResult] = await Promise.all([
    authorIds.length > 0
      ? supabase.from('users').select('id, full_name, unit_number, avatar_url').in('id', authorIds)
      : { data: [], error: null },
    supabase.from('post_comments').select('post_id').in('post_id', postIds),
    supabase.from('post_likes').select('post_id').in('post_id', postIds),
  ])

  // Create user lookup map
  const userMap = {}
  ;(usersResult.data || []).forEach(u => { userMap[u.id] = u })

  // Count comments per post
  const commentCounts = {}
  ;(commentsResult.data || []).forEach(c => {
    commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1
  })

  // Count likes per post
  const likeCounts = {}
  ;(likesResult.data || []).forEach(l => {
    likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1
  })

  // Attach author info and dynamic counts to posts
  return posts.map(post => ({
    ...post,
    author: userMap[post.author_id] || null,
    comments_count: commentCounts[post.id] || 0,
    likes_count: likeCounts[post.id] || 0,
  }))
}

export async function createPost(postData) {
  // Map user_id to author_id to match table schema
  const insertData = {
    building_id: postData.building_id,
    author_id: postData.user_id,
    content: postData.content
  }

  // Include is_announcement if provided
  if (postData.is_announcement !== undefined) {
    insertData.is_announcement = postData.is_announcement
  }

  console.log('[communityPostService.createPost] Inserting:', insertData)

  const { data, error } = await supabase
    .from('community_posts')
    .insert([insertData])
    .select()

  if (error) {
    console.error('[communityPostService.createPost] Error:', error.code, error.message, error.details)
    throw error
  }

  console.log('[communityPostService.createPost] Success:', data[0])
  return data[0]
}

export async function updatePost(postId, postData) {
  const { data, error } = await supabase
    .from('community_posts')
    .update(postData)
    .eq('id', postId)
    .select()

  if (error) throw error
  return data[0]
}

export async function deletePost(postId) {
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId)

  if (error) throw error
  return true
}

export async function getAnnouncements(buildingId) {
  // First fetch announcements
  const { data: posts, error: postsError } = await supabase
    .from('community_posts')
    .select('*')
    .eq('building_id', buildingId)
    .eq('is_announcement', true)
    .order('created_at', { ascending: false })

  if (postsError) throw postsError
  if (!posts || posts.length === 0) return []

  // Get unique author IDs
  const authorIds = [...new Set(posts.map(p => p.author_id).filter(Boolean))]

  if (authorIds.length === 0) return posts

  // Fetch authors separately
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, full_name, unit_number')
    .in('id', authorIds)

  if (usersError) {
    console.warn('[communityPostService] Error fetching announcement authors:', usersError)
    return posts
  }

  // Create user lookup map
  const userMap = {}
  ;(users || []).forEach(u => { userMap[u.id] = u })

  // Attach author info to announcements
  return posts.map(post => ({
    ...post,
    author: userMap[post.author_id] || null
  }))
}

export async function likePost(postId, userId) {
  console.log('[communityPostService.likePost] Upserting like:', { postId, userId })
  const { data, error } = await supabase
    .from('post_likes')
    .upsert([{ post_id: postId, user_id: userId }], {
      onConflict: 'post_id,user_id',
      ignoreDuplicates: true
    })
    .select()

  if (error) {
    console.error('[communityPostService.likePost] Error:', error.code, error.message, error.details, error.hint)
    throw error
  }
  console.log('[communityPostService.likePost] Success:', data?.[0])
  return data?.[0]
}

/**
 * Check if a user has liked a specific post
 */
export async function hasUserLikedPost(postId, userId) {
  const { data, error } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[communityPostService.hasUserLikedPost] Error:', error)
    return false
  }
  return !!data
}

export async function unlikePost(postId, userId) {
  console.log('[communityPostService.unlikePost] Deleting like:', { postId, userId })
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)

  if (error) {
    console.error('[communityPostService.unlikePost] Error:', error.code, error.message, error.details)
    throw error
  }
  console.log('[communityPostService.unlikePost] Success')
  return true
}

export async function getComments(postId) {
  // First fetch comments
  const { data: comments, error: commentsError } = await supabase
    .from('post_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (commentsError) throw commentsError
  if (!comments || comments.length === 0) return []

  // Get unique user IDs
  const userIds = [...new Set(comments.map(c => c.user_id).filter(Boolean))]

  if (userIds.length === 0) return comments

  // Fetch users separately
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, full_name, unit_number')
    .in('id', userIds)

  if (usersError) {
    console.warn('[communityPostService] Error fetching comment authors:', usersError)
    return comments
  }

  // Create user lookup map
  const userMap = {}
  ;(users || []).forEach(u => { userMap[u.id] = u })

  // Attach author info to comments
  return comments.map(comment => ({
    ...comment,
    author: userMap[comment.user_id] || null
  }))
}

export async function addComment(postId, userId, content) {
  const { data, error } = await supabase
    .from('post_comments')
    .insert([{ post_id: postId, user_id: userId, content }])
    .select()

  if (error) throw error
  return data[0]
}

/**
 * Get all post IDs that a user has liked
 * @param {string} userId - User UUID
 * @returns {Promise<string[]>} Array of post IDs
 */
export async function getUserLikes(userId) {
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId)

  if (error) throw error
  return (data || []).map(item => item.post_id)
}

/**
 * Get like count for a post
 * @param {string} postId - Post UUID
 * @returns {Promise<number>} Like count
 */
export async function getPostLikeCount(postId) {
  const { count, error } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  if (error) throw error
  return count || 0
}
