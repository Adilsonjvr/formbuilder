'use client'

import { useState } from 'react'
import { DndContext } from '@dnd-kit/core'
import { Save, Eye, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldPalette } from '@/components/forms/field-palette'
import { FieldBuilder } from '@/components/forms/field-builder'
import { FieldSettings } from '@/components/forms/field-settings'
import { FormPreview } from '@/components/forms/form-preview'
import { useFormBuilder } from '@/hooks/use-form-builder'
import { FormBuilderState } from '@/types/form-builder'
import { cn } from '@/lib/utils'

interface BuilderLayoutProps {
  initialState?: Partial<FormBuilderState>
  onSave: (state: FormBuilderState) => Promise<void>
}

export function BuilderLayout({ initialState, onSave }: BuilderLayoutProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const {
    state,
    updateFormInfo,
    addField,
    updateField,
    removeField,
    reorderFields,
    duplicateField,
    setActiveField,
    getField,
  } = useFormBuilder(initialState)

  const activeField = state.activeFieldId ? getField(state.activeFieldId) : null

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(state)
    } catch (error) {
      console.error('Error saving form:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectField = (fieldId: string) => {
    setActiveField(fieldId)
    setShowSettings(true)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 max-w-md">
              <Input
                value={state.name}
                onChange={(e) => updateFormInfo({ name: e.target.value })}
                placeholder="Nome do formulário"
                className="font-semibold border-0 focus-visible:ring-0 px-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4" />
              Visualizar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !state.name}
              size="sm"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Form Description */}
        <div className="container px-6 pb-4">
          <Textarea
            value={state.description}
            onChange={(e) => updateFormInfo({ description: e.target.value })}
            placeholder="Descrição do formulário (opcional)"
            className="resize-none border-0 focus-visible:ring-0 px-0 text-sm"
            rows={2}
          />
        </div>
      </header>

      {/* Builder Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Field Palette - Left Sidebar */}
        <FieldPalette />

        {/* Canvas - Center */}
        <FieldBuilder
          fields={state.fields}
          activeFieldId={state.activeFieldId}
          onAddField={addField}
          onReorderFields={reorderFields}
          onSelectField={handleSelectField}
          onRemoveField={removeField}
          onDuplicateField={duplicateField}
        />

        {/* Field Settings - Right Panel (Sheet) */}
        <FieldSettings
          field={activeField || null}
          onClose={() => {
            setActiveField(null)
            setShowSettings(false)
          }}
          onUpdate={updateField}
        />
      </div>

      {/* Form Preview Dialog */}
      <FormPreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        formState={state}
      />
    </div>
  )
}
