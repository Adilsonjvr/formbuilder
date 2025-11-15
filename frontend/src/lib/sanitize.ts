import DOMPurify from 'isomorphic-dompurify'

export const sanitizeText = (value?: string | null) => {
  if (!value) return ''
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}
