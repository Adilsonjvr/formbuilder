import DOMPurify from 'isomorphic-dompurify'

const sanitizeRawString = (value: string) =>
  DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim()

export const sanitizeOptionalString = (value?: string | null) => {
  if (value === undefined || value === null) {
    return undefined
  }
  return sanitizeRawString(value)
}

export const sanitizeNullableString = (value?: string | null) => {
  if (value === undefined || value === null) {
    return null
  }
  return sanitizeRawString(value)
}

export const sanitizeRequiredString = (value: string) => {
  return sanitizeRawString(value)
}

export const sanitizeStringArray = (values?: string[] | null) => {
  if (!values) return undefined
  return values.map((value) => sanitizeRawString(value))
}

export const sanitizeText = (value?: string | null) => {
  const sanitized = sanitizeOptionalString(value)
  return sanitized ?? ''
}
