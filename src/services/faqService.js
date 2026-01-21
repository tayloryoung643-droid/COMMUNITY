import { supabase } from '../lib/supabase'

export async function getFAQs(buildingId) {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('building_id', buildingId)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data
}

export async function getFAQsByCategory(buildingId, category) {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('building_id', buildingId)
    .eq('category', category)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data
}

export async function createFAQ(faqData) {
  const { data, error } = await supabase
    .from('faqs')
    .insert([faqData])
    .select()

  if (error) throw error
  return data[0]
}

export async function updateFAQ(faqId, faqData) {
  const { data, error } = await supabase
    .from('faqs')
    .update(faqData)
    .eq('id', faqId)
    .select()

  if (error) throw error
  return data[0]
}

export async function deleteFAQ(faqId) {
  const { error } = await supabase
    .from('faqs')
    .delete()
    .eq('id', faqId)

  if (error) throw error
  return true
}

export async function getCategories(buildingId) {
  const { data, error } = await supabase
    .from('faqs')
    .select('category')
    .eq('building_id', buildingId)

  if (error) throw error

  // Get unique categories
  const categories = [...new Set(data.map(item => item.category))]
  return categories
}

export async function reorderFAQs(faqIds) {
  // Update sort_order for each FAQ based on array position
  const updates = faqIds.map((id, index) =>
    supabase
      .from('faqs')
      .update({ sort_order: index })
      .eq('id', id)
  )

  await Promise.all(updates)
  return true
}
