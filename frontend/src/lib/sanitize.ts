/**
 * Sanitiza strings removendo HTML tags e caracteres perigosos.
 * Implementação nativa sem dependências externas para compatibilidade serverless.
 */
const sanitizeRawString = (value: string): string => {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove scripts inline
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove caracteres de controle
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normaliza espaços em branco
    .trim()
}

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
