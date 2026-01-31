import { supabase } from '../lib/supabase'

const STORAGE_BUCKET = 'building-documents'

/**
 * Get documents for a building
 * @param {string} buildingId - Building UUID
 * @param {boolean} isManager - If true, returns all docs; if false, only visible docs
 */
export async function getDocuments(buildingId, isManager = false) {
  let query = supabase
    .from('building_documents')
    .select('*')
    .eq('building_id', buildingId)
    .order('doc_type', { ascending: true })
    .order('created_at', { ascending: false })

  // Residents only see visible documents
  if (!isManager) {
    query = query.eq('is_visible', true)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Upload a document to storage and create database record
 * @param {Object} params - Upload parameters
 * @param {string} params.buildingId - Building UUID
 * @param {File} params.file - The PDF file to upload
 * @param {string} params.title - Document title
 * @param {string} params.docType - Document type (bylaws, rules, checklist, form, other)
 * @param {boolean} params.isVisible - Whether document is visible to residents
 * @param {string} params.createdBy - User UUID who uploaded
 */
export async function uploadDocument({ buildingId, file, title, docType, isVisible, createdBy }) {
  // Generate a unique ID for the document
  const docId = crypto.randomUUID()
  const filePath = `${buildingId}/${docId}.pdf`

  // Step 1: Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      contentType: file.type || 'application/pdf',
      upsert: false
    })

  if (uploadError) {
    console.error('[buildingDocumentsService] Upload error:', uploadError)
    throw new Error(`Failed to upload file: ${uploadError.message}`)
  }

  // Step 2: Insert record into database
  const documentData = {
    id: docId,
    building_id: buildingId,
    title: title,
    doc_type: docType || 'other',
    file_path: filePath,
    mime_type: file.type || 'application/pdf',
    file_size: file.size,
    is_visible: isVisible !== false,
    created_by: createdBy || null
  }

  const { data, error: insertError } = await supabase
    .from('building_documents')
    .insert([documentData])
    .select()
    .single()

  if (insertError) {
    // Try to clean up the uploaded file if database insert fails
    await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
    console.error('[buildingDocumentsService] Insert error:', insertError)
    throw new Error(`Failed to save document record: ${insertError.message}`)
  }

  return data
}

/**
 * Get a signed URL for viewing/downloading a document
 * @param {string} filePath - The storage path of the file
 * @param {number} expiresIn - URL expiration time in seconds (default 1 hour)
 */
export async function getSignedUrl(filePath, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, expiresIn)

  if (error) {
    console.error('[buildingDocumentsService] Signed URL error:', error)
    throw new Error(`Failed to get document URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Delete a document (removes from storage and database)
 * @param {Object} documentRow - The document record to delete
 */
export async function deleteDocument(documentRow) {
  const { id, file_path } = documentRow

  // Step 1: Delete from storage
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([file_path])

  if (storageError) {
    console.error('[buildingDocumentsService] Storage delete error:', storageError)
    // Continue to try database delete even if storage fails
  }

  // Step 2: Delete from database
  const { error: dbError } = await supabase
    .from('building_documents')
    .delete()
    .eq('id', id)

  if (dbError) {
    console.error('[buildingDocumentsService] Database delete error:', dbError)
    throw new Error(`Failed to delete document: ${dbError.message}`)
  }

  return true
}

/**
 * Update a document's metadata
 * @param {string} id - Document UUID
 * @param {Object} patch - Fields to update (title, doc_type, is_visible)
 */
export async function updateDocument(id, patch) {
  const allowedFields = ['title', 'doc_type', 'is_visible']
  const updateData = {}

  for (const field of allowedFields) {
    if (patch[field] !== undefined) {
      updateData[field] = patch[field]
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields to update')
  }

  const { data, error } = await supabase
    .from('building_documents')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[buildingDocumentsService] Update error:', error)
    throw new Error(`Failed to update document: ${error.message}`)
  }

  return data
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Document type labels for display
 */
export const DOC_TYPE_LABELS = {
  bylaws: 'Bylaws',
  rules: 'Rules & Regulations',
  checklist: 'Checklist',
  form: 'Form',
  other: 'Other'
}

/**
 * Document type colors for badges
 */
export const DOC_TYPE_COLORS = {
  bylaws: '#3b82f6',
  rules: '#ef4444',
  checklist: '#10b981',
  form: '#8b5cf6',
  other: '#6b7280'
}
