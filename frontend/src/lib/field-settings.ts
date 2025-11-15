import { Prisma } from '@prisma/client'

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
