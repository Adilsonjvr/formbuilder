/**
 * Form Field Types
 * Based on the Prisma schema FormFieldType enum
 */
export const FIELD_TYPES = {
  TEXT: 'TEXT',
  EMAIL: 'EMAIL',
  NUMBER: 'NUMBER',
  SELECT: 'SELECT',
  CHECKBOX: 'CHECKBOX',
  RADIO: 'RADIO',
  DATE: 'DATE',
  TIME: 'TIME',
  FILE: 'FILE',
  RATING: 'RATING',
  NPS: 'NPS',
} as const

export type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES]

/**
 * Field Icons (lucide-react icon names)
 */
export const FIELD_ICONS: Record<FieldType, string> = {
  TEXT: 'Type',
  EMAIL: 'Mail',
  NUMBER: 'Hash',
  SELECT: 'ChevronDown',
  CHECKBOX: 'CheckSquare',
  RADIO: 'Circle',
  DATE: 'Calendar',
  TIME: 'Clock',
  FILE: 'Upload',
  RATING: 'Star',
  NPS: 'TrendingUp',
}

/**
 * Field Labels (human-readable names)
 */
export const FIELD_LABELS: Record<FieldType, string> = {
  TEXT: 'Texto',
  EMAIL: 'Email',
  NUMBER: 'Número',
  SELECT: 'Seleção',
  CHECKBOX: 'Checkbox',
  RADIO: 'Escolha Única',
  DATE: 'Data',
  TIME: 'Hora',
  FILE: 'Arquivo',
  RATING: 'Avaliação',
  NPS: 'NPS',
}

/**
 * Field Descriptions
 */
export const FIELD_DESCRIPTIONS: Record<FieldType, string> = {
  TEXT: 'Campo de texto simples',
  EMAIL: 'Campo de email com validação',
  NUMBER: 'Campo numérico',
  SELECT: 'Lista suspensa com opções',
  CHECKBOX: 'Múltipla escolha',
  RADIO: 'Escolha única entre opções',
  DATE: 'Seletor de data',
  TIME: 'Seletor de hora',
  FILE: 'Upload de arquivo',
  RATING: 'Avaliação com estrelas',
  NPS: 'Net Promoter Score (0-10)',
}

/**
 * Field Categories for Palette
 */
export const FIELD_CATEGORIES = {
  BASIC: 'Básico',
  ADVANCED: 'Avançado',
  SPECIAL: 'Especial',
} as const

export const FIELDS_BY_CATEGORY = {
  BASIC: ['TEXT', 'EMAIL', 'NUMBER', 'DATE', 'TIME'] as FieldType[],
  ADVANCED: ['SELECT', 'CHECKBOX', 'RADIO', 'FILE'] as FieldType[],
  SPECIAL: ['RATING', 'NPS'] as FieldType[],
}

/**
 * Form Status
 */
export const FORM_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export type FormStatus = typeof FORM_STATUS[keyof typeof FORM_STATUS]

export const FORM_STATUS_LABELS: Record<FormStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
}

/**
 * Export Formats
 */
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  PDF: 'pdf',
} as const

export type ExportFormat = typeof EXPORT_FORMATS[keyof typeof EXPORT_FORMATS]

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV',
  json: 'JSON',
  pdf: 'PDF',
}
