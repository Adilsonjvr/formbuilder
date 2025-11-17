'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { BuilderLayout } from '@/components/layout/builder-layout'
import { FormBuilderState, FormField } from '@/types/form-builder'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface BuilderFormField {
  id: string
  type: FormField['type']
  label: string
  placeholder?: string | null
  helpText?: string | null
  required: boolean
  order: number
  options?: string[] | null
  min?: number | null
  max?: number | null
  validation?: FormField['validation']
}

interface BuilderFormResponse {
  id: string
  name: string
  description: string | null
  fields: BuilderFormField[]
  enableNotifications: boolean
  notificationEmail: string | null
  primaryColor: string | null
  accentColor: string | null
}

interface PageProps {
  params: Promise<{
    formId: string
  }>
}

export default function BuilderPage({ params }: PageProps) {
  const { formId } = use(params)
  const router = useRouter()
  const isNew = formId === 'new'

  // Fetch existing form data if editing
  const { data: formData, isLoading, error } = useSWR<BuilderFormResponse>(
    !isNew ? `/api/forms/${formId}` : null,
    (url: string) => api<BuilderFormResponse>(url)
  )

  // Redirect to login if unauthorized
  if (error && error.message.includes('Unauthorized')) {
    router.push('/login')
    return null
  }

  const handleSave = async (state: FormBuilderState) => {
    try {
      if (isNew) {
        // Create new form
        const response = await api<{ id: string }>('/api/forms', {
          method: 'POST',
          body: JSON.stringify({
            name: state.name,
            description: state.description,
            enableNotifications: state.enableNotifications,
            notificationEmail: state.notificationEmail || null,
            primaryColor: state.primaryColor,
            accentColor: state.accentColor,
          }),
        })

        const newFormId = response.id

        // Add fields if any
        if (state.fields.length > 0) {
          await Promise.all(
            state.fields.map((field) =>
              api(`/api/forms/${newFormId}/fields`, {
                method: 'POST',
                body: JSON.stringify({
                  type: field.type,
                  label: field.label,
                  required: field.required,
                  order: field.order,
                  settings: {
                    placeholder: field.placeholder,
                    helpText: field.helpText,
                    options: field.options,
                    min: field.min,
                    max: field.max,
                    validation: field.validation,
                  },
                }),
              })
            )
          )
        }

        toast.success('Formulário criado com sucesso!')
        router.push(`/builder/${newFormId}`)
      } else {
        // Update existing form
        await api(`/api/forms/${formId}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: state.name,
            description: state.description,
            enableNotifications: state.enableNotifications,
            notificationEmail: state.notificationEmail || null,
            primaryColor: state.primaryColor,
            accentColor: state.accentColor,
          }),
        })

        // Sync fields: compare existing with new
        if (!formData) {
          throw new Error('Form data not available')
        }

        const existingFieldIds = new Set(formData.fields.map((f) => f.id))
        const currentFieldIds = new Set(state.fields.map((f) => f.id))

        // Identify new, updated, and deleted fields
        const newFields = state.fields.filter((f) => !existingFieldIds.has(f.id))
        const updatedFields = state.fields.filter((f) => existingFieldIds.has(f.id))
        const deletedFieldIds = formData.fields
          .map((f) => f.id)
          .filter((id: string) => !currentFieldIds.has(id))

        // Execute API calls for each operation
        const operations = []

        // Add new fields
        for (const field of newFields) {
          operations.push(
            api(`/api/forms/${formId}/fields`, {
              method: 'POST',
              body: JSON.stringify({
                type: field.type,
                label: field.label,
                required: field.required,
                order: field.order,
                settings: {
                  placeholder: field.placeholder,
                  helpText: field.helpText,
                  options: field.options,
                  min: field.min,
                  max: field.max,
                  validation: field.validation,
                },
              }),
            })
          )
        }

        // Update existing fields
        for (const field of updatedFields) {
          operations.push(
            api(`/api/forms/${formId}/fields/${field.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                type: field.type,
                label: field.label,
                required: field.required,
                order: field.order,
                settings: {
                  placeholder: field.placeholder,
                  helpText: field.helpText,
                  options: field.options,
                  min: field.min,
                  max: field.max,
                  validation: field.validation,
                },
              }),
            })
          )
        }

        // Delete removed fields
        for (const fieldId of deletedFieldIds) {
          operations.push(
            api(`/api/forms/${formId}/fields/${fieldId}`, {
              method: 'DELETE',
            })
          )
        }

        // Execute all operations in parallel
        await Promise.all(operations)

        toast.success('Formulário salvo com sucesso!')
      }
    } catch (error) {
      console.error('Error saving form:', error)
      toast.error('Erro ao salvar formulário')
      throw error
    }
  }

  if (isLoading && !isNew) {
    return (
      <div className="flex flex-col h-screen">
        <div className="border-b p-6">
          <Skeleton className="h-10 w-96" />
        </div>
        <div className="flex flex-1">
          <Skeleton className="w-80 h-full" />
          <div className="flex-1 p-8">
            <Skeleton className="h-full w-full max-w-3xl mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  // Prepare initial state for editing
  const initialState: Partial<FormBuilderState> = isNew
    ? {}
    : {
        formId: formData?.id,
        name: formData?.name || '',
        description: formData?.description || '',
        enableNotifications: formData?.enableNotifications || false,
        notificationEmail: formData?.notificationEmail || '',
        primaryColor: formData?.primaryColor || '#3b82f6',
        accentColor: formData?.accentColor || '#8b5cf6',
        fields: (formData?.fields || []).map((field): FormField => ({
          id: field.id,
          type: field.type,
          label: field.label,
          placeholder: field.placeholder || undefined,
          helpText: field.helpText || undefined,
          required: field.required,
          order: field.order,
          options: field.options || undefined,
          min: field.min ?? undefined,
          max: field.max ?? undefined,
          validation: field.validation || undefined,
        })),
      }

  return <BuilderLayout initialState={initialState} onSave={handleSave} />
}
