/**
 * File-to-text extraction service
 * Handles PDF, DOCX, DOC, and plain text files
 * Libraries are lazy-loaded only when needed to keep the main bundle small
 */

/**
 * Extract text content from a File object
 * Supports: .pdf, .docx, .doc, .txt, and other plain-text formats
 * @param {File} file - Browser File object
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase()
  const type = file.type

  // PDF
  if (name.endsWith('.pdf') || type === 'application/pdf') {
    return extractTextFromPdf(file)
  }

  // DOCX
  if (name.endsWith('.docx') || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractTextFromDocx(file)
  }

  // DOC (older Word format) — mammoth can sometimes handle it
  if (name.endsWith('.doc') || type === 'application/msword') {
    return extractTextFromDocx(file)
  }

  // Plain text fallback (.txt, .csv, .md, etc.)
  return file.text()
}

/**
 * Extract text from a PDF using pdfjs-dist (lazy-loaded)
 */
async function extractTextFromPdf(file) {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  console.log(`[fileReader] PDF loaded: ${pdf.numPages} pages`)

  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map(item => item.str).join(' ')
    if (text.trim()) pages.push(text.trim())
  }

  const result = pages.join('\n\n')
  console.log(`[fileReader] PDF extracted: ${result.length} chars from ${pages.length} pages`)
  return result
}

/**
 * Extract text from a DOCX/DOC using mammoth (lazy-loaded)
 */
async function extractTextFromDocx(file) {
  const mammoth = await import('mammoth')

  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })

  console.log(`[fileReader] DOCX extracted: ${result.value.length} chars`)
  if (result.messages.length > 0) {
    console.warn('[fileReader] DOCX warnings:', result.messages)
  }

  return result.value
}
