'use client'

import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { FormBuilderState, FormField } from '@/types/form-builder'
import { FieldType, FIELD_LABELS } from '@/lib/constants'

export function useFormBuilder(initialState?: Partial<FormBuilderState>) {
  const [state, setState] = useState<FormBuilderState>({
    name: initialState?.name || '',
    description: initialState?.description || '',
    fields: initialState?.fields || [],
    activeFieldId: initialState?.activeFieldId || null,
    formId: initialState?.formId,
  })

  const updateFormInfo = useCallback(
    (updates: { name?: string; description?: string }) => {
      setState((prev) => ({ ...prev, ...updates }))
    },
    []
  )

  const addField = useCallback((fieldType: FieldType, index?: number) => {
    const newField: FormField = {
      id: uuidv4(),
      type: fieldType,
      label: FIELD_LABELS[fieldType],
      required: false,
      order: index !== undefined ? index : state.fields.length,
    }

    // Add default options for SELECT, RADIO, CHECKBOX
    if (['SELECT', 'RADIO', 'CHECKBOX'].includes(fieldType)) {
      newField.options = ['Opção 1', 'Opção 2', 'Opção 3']
    }

    // Add default min/max for RATING and NPS
    if (fieldType === 'RATING') {
      newField.min = 1
      newField.max = 5
    } else if (fieldType === 'NPS') {
      newField.min = 0
      newField.max = 10
    }

    setState((prev) => {
      const fields = [...prev.fields]
      if (index !== undefined) {
        fields.splice(index, 0, newField)
        // Update order of subsequent fields
        fields.forEach((field, idx) => {
          field.order = idx
        })
      } else {
        fields.push(newField)
      }
      return {
        ...prev,
        fields,
        activeFieldId: newField.id,
      }
    })

    return newField.id
  }, [state.fields.length])

  const updateField = useCallback(
    (fieldId: string, updates: Partial<FormField>) => {
      setState((prev) => ({
        ...prev,
        fields: prev.fields.map((field) =>
          field.id === fieldId ? { ...field, ...updates } : field
        ),
      }))
    },
    []
  )

  const removeField = useCallback((fieldId: string) => {
    setState((prev) => {
      const fields = prev.fields
        .filter((field) => field.id !== fieldId)
        .map((field, index) => ({ ...field, order: index }))

      return {
        ...prev,
        fields,
        activeFieldId:
          prev.activeFieldId === fieldId ? null : prev.activeFieldId,
      }
    })
  }, [])

  const reorderFields = useCallback(
    (startIndex: number, endIndex: number) => {
      setState((prev) => {
        const fields = [...prev.fields]
        const [removed] = fields.splice(startIndex, 1)
        fields.splice(endIndex, 0, removed)

        // Update order values
        fields.forEach((field, index) => {
          field.order = index
        })

        return { ...prev, fields }
      })
    },
    []
  )

  const duplicateField = useCallback((fieldId: string) => {
    setState((prev) => {
      const fieldToDuplicate = prev.fields.find((f) => f.id === fieldId)
      if (!fieldToDuplicate) return prev

      const newField: FormField = {
        ...fieldToDuplicate,
        id: uuidv4(),
        label: `${fieldToDuplicate.label} (cópia)`,
        order: fieldToDuplicate.order + 1,
      }

      const fields = [...prev.fields]
      fields.splice(fieldToDuplicate.order + 1, 0, newField)

      // Update order of subsequent fields
      fields.forEach((field, index) => {
        field.order = index
      })

      return {
        ...prev,
        fields,
        activeFieldId: newField.id,
      }
    })
  }, [])

  const setActiveField = useCallback((fieldId: string | null) => {
    setState((prev) => ({ ...prev, activeFieldId: fieldId }))
  }, [])

  const getField = useCallback(
    (fieldId: string) => {
      return state.fields.find((field) => field.id === fieldId)
    },
    [state.fields]
  )

  return {
    state,
    updateFormInfo,
    addField,
    updateField,
    removeField,
    reorderFields,
    duplicateField,
    setActiveField,
    getField,
  }
}
