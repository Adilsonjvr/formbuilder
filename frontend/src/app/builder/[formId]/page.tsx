'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { BuilderLayout } from '@/components/layouts/builder-layout'
import { FormBuilderState, FormField } from '@/types/form-builder'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

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
  const { data: formData, isLoading } = useSWR(
    !isNew ? `/api/forms/${formId}` : null,
    () => api(`/api/forms/${formId}`)
  )

  const handleSave = async (state: FormBuilderState) => {
    try {
      if (isNew) {
        // Create new form
        const response = await api('/api/forms', {
          method: 'POST',
          body: JSON.stringify({
            name: state.name,
            description: state.description,
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
                  placeholder: field.placeholder,
                  helpText: field.helpText,
                  options: field.options,
                  min: field.min,
                  max: field.max,
                  validation: field.validation,
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
          }),
        })

        // TODO: Sync fields (add new, update existing, remove deleted)
        // For now, just show success
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
        fields: (formData?.fields || []).map((field: any): FormField => ({
          id: field.id,
          type: field.type,
          label: field.label,
          placeholder: field.placeholder || undefined,
          helpText: field.helpText || undefined,
          required: field.required,
          order: field.order,
          options: field.options || undefined,
          min: field.min || undefined,
          max: field.max || undefined,
          validation: field.validation || undefined,
        })),
      }

  return <BuilderLayout initialState={initialState} onSave={handleSave} />
}
