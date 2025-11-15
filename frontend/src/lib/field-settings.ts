import { Prisma } from '@prisma/client'
import { sanitizeOptionalString, sanitizeStringArray } from '@/lib/sanitize'

export type FieldSettings = {
  placeholder?: string
  helpText?: string
  options?: string[]
  min?: number
  max?: number
  validation?: Record<string, unknown>
}

const stringValue = (value: unknown) => (typeof value === 'string' ? value : undefined)
const numberValue = (value: unknown) => (typeof value === 'number' ? value : undefined)
const stringArrayValue = (value: unknown) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string') ? (value as string[]) : undefined
const objectValue = (value: unknown) =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined

export const parseFieldSettings = (settings: Prisma.JsonValue | null): FieldSettings => {
  if (!settings || typeof settings !== 'object') {
    return {}
  }

  const record = settings as Record<string, unknown>

  return {
    placeholder: stringValue(record.placeholder),
    helpText: stringValue(record.helpText),
    options: stringArrayValue(record.options),
    min: numberValue(record.min),
    max: numberValue(record.max),
    validation: objectValue(record.validation),
  }
}

export const sanitizeFieldSettingsInput = (
  settings?: FieldSettings | null
): Prisma.InputJsonValue | undefined => {
  if (!settings) {
    return undefined
  }

  const result: Record<string, unknown> = {}

  const placeholder = sanitizeOptionalString(settings.placeholder)
  if (placeholder !== undefined) {
    result.placeholder = placeholder
  }

  const helpText = sanitizeOptionalString(settings.helpText)
  if (helpText !== undefined) {
    result.helpText = helpText
  }

  const options = sanitizeStringArray(settings.options)
  if (options !== undefined) {
    result.options = options
  }

  if (settings.min !== undefined) {
    result.min = settings.min
  }

  if (settings.max !== undefined) {
    result.max = settings.max
  }

  if (settings.validation !== undefined) {
    result.validation = settings.validation
  }

  return Object.keys(result).length > 0 ? result : {}
}
