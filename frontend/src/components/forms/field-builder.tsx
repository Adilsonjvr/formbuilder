'use client'

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
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useState } from 'react'
import { FormField } from '@/types/form-builder'
import { FieldType } from '@/lib/constants'
import { FieldItem } from './field-item'
import { FileText } from 'lucide-react'

interface FieldBuilderProps {
  fields: FormField[]
  activeFieldId: string | null
  onAddField: (fieldType: FieldType, index?: number) => void
  onReorderFields: (startIndex: number, endIndex: number) => void
  onSelectField: (fieldId: string) => void
  onRemoveField: (fieldId: string) => void
  onDuplicateField: (fieldId: string) => void
}

export function FieldBuilder({
  fields,
  activeFieldId,
  onAddField,
  onReorderFields,
  onSelectField,
  onRemoveField,
  onDuplicateField,
}: FieldBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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
      let index = fields.length

      // Find index if dropped over a field
      if (over.data.current?.index !== undefined) {
        index = over.data.current.index
      }

      onAddField(fieldType, index)
      return
    }

    // Handle reordering
    if (active.id !== over.id && active.data.current?.index !== undefined) {
      const oldIndex = active.data.current.index
      const newIndex = over.data.current?.index ?? fields.length - 1

      onReorderFields(oldIndex, newIndex)
    }
  }

  const activeField = fields.find((f) => f.id === activeId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 bg-background p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center border-2 border-dashed rounded-lg p-12">
              <div className="p-4 rounded-full bg-muted mb-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Comece criando seu formulário
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Arraste campos da barra lateral para começar a construir seu
                formulário
              </p>
            </div>
          ) : (
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <FieldItem
                    key={field.id}
                    field={field}
                    index={index}
                    isActive={field.id === activeFieldId}
                    onSelect={() => onSelectField(field.id)}
                    onRemove={() => onRemoveField(field.id)}
                    onDuplicate={() => onDuplicateField(field.id)}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeField ? (
          <div className="bg-card border-2 border-primary rounded-lg p-4 shadow-lg">
            <p className="font-medium">{activeField.label}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
