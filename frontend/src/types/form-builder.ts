import { FieldType } from '@/lib/constants'

export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  order: number
  options?: string[] // For SELECT, RADIO, CHECKBOX
  min?: number // For NUMBER, RATING
  max?: number // For NUMBER, RATING
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
  }
}

export interface FormBuilderState {
  formId?: string
  name: string
  description: string
  fields: FormField[]
  activeFieldId: string | null
  enableNotifications: boolean
  notificationEmail: string
  primaryColor: string
  accentColor: string
}

export interface DragItem {
  id: string
  type: 'palette' | 'field'
  fieldType?: FieldType
  index?: number
}
