import { supabase } from '../lib/supabase'

export async function getPosts(buildingId) {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*, author:author_id(full_name, unit_number)')
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createPost(postData) {
  // Map user_id to author_id to match table schema
  const insertData = {
    building_id: postData.building_id,
    author_id: postData.user_id,
    content: postData.content
    // Note: 'type' column doesn't exist in table, storing in content if needed
  }

  const { data, error } = await supabase
    .from('community_posts')
    .insert([insertData])
    .select()

  if (error) throw error
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
  const { data, error } = await supabase
    .from('community_posts')
    .select('*, author:author_id(full_name, unit_number)')
    .eq('building_id', buildingId)
    .eq('is_announcement', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function likePost(postId, userId) {
  const { data, error } = await supabase
    .from('post_likes')
    .insert([{ post_id: postId, user_id: userId }])
    .select()

  if (error) throw error
  return data[0]
}

export async function unlikePost(postId, userId) {
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)

  if (error) throw error
  return true
}

export async function getComments(postId) {
  const { data, error } = await supabase
    .from('post_comments')
    .select('*, author:users(*)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function addComment(postId, userId, content) {
  const { data, error } = await supabase
    .from('post_comments')
    .insert([{ post_id: postId, user_id: userId, content }])
    .select()

  if (error) throw error
  return data[0]
}
