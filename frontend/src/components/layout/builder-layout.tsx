'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { Save, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldPalette } from '@/components/forms/field-palette'
import { FieldBuilder } from '@/components/forms/field-builder'
import { FieldSettings } from '@/components/forms/field-settings'
import { FormPreview } from '@/components/forms/form-preview'
import { FormSettingsDialog } from '@/components/forms/form-settings-dialog'
import { LivePreviewPanel } from '@/components/forms/live-preview-panel'
import { useFormBuilder } from '@/hooks/use-form-builder'
import { FormBuilderState } from '@/types/form-builder'
import { FieldType } from '@/lib/constants'

interface BuilderLayoutProps {
  initialState?: Partial<FormBuilderState>
  onSave: (state: FormBuilderState) => Promise<void>
}

export function BuilderLayout({ initialState, onSave }: BuilderLayoutProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showLivePreview, setShowLivePreview] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    // Handle drop from palette
    if (active.data.current?.type === 'palette') {
      const fieldType = active.data.current.fieldType as FieldType
      let index = state.fields.length

      // Find index if dropped over a field
      if (over.data.current?.index !== undefined) {
        index = over.data.current.index
      }

      addField(fieldType, index)
      return
    }

    // Handle reordering
    if (active.id !== over.id && active.data.current?.index !== undefined) {
      const oldIndex = active.data.current.index
      const newIndex = over.data.current?.index ?? state.fields.length - 1

      reorderFields(oldIndex, newIndex)
    }
  }

  const draggedField = state.fields.find((f) => f.id === activeId)

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-18 px-6 md:px-8 lg:px-12">
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
            <FormSettingsDialog
              enableNotifications={state.enableNotifications}
              notificationEmail={state.notificationEmail}
              primaryColor={state.primaryColor}
              accentColor={state.accentColor}
              onUpdate={updateFormInfo}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowLivePreview(!showLivePreview)}
            >
              {showLivePreview ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Ocultar Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Mostrar Preview
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4" />
              Preview Modal
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
        <div className="container px-6 md:px-8 lg:px-12 pb-4">
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Field Palette - Left Sidebar */}
          <FieldPalette />

          {/* Canvas - Center */}
          <FieldBuilder
            fields={state.fields}
            activeFieldId={state.activeFieldId}
            onSelectField={handleSelectField}
            onRemoveField={removeField}
            onDuplicateField={duplicateField}
          />

          {/* Live Preview Panel - Right Side (when enabled) */}
          {showLivePreview && (
            <LivePreviewPanel formState={state} />
          )}

          {/* Field Settings - Right Panel (Sheet) */}
          <FieldSettings
            field={activeField || null}
            onClose={() => setActiveField(null)}
            onUpdate={updateField}
          />
        </div>

        <DragOverlay dropAnimation={null}>
          {draggedField ? (
            <div className="bg-card border-2 border-primary rounded-lg p-4 shadow-2xl scale-105 opacity-90 rotate-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Save className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{draggedField.label}</p>
                  <p className="text-xs text-muted-foreground">Arrastando...</p>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Form Preview Dialog */}
      <FormPreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        formState={state}
      />
    </div>
  )
}
