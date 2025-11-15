'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FormField } from '@/types/form-builder'
import { FieldItem } from './field-item'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FieldBuilderProps {
  fields: FormField[]
  activeFieldId: string | null
  onSelectField: (fieldId: string) => void
  onRemoveField: (fieldId: string) => void
  onDuplicateField: (fieldId: string) => void
}

export function FieldBuilder({
  fields,
  activeFieldId,
  onSelectField,
  onRemoveField,
  onDuplicateField,
}: FieldBuilderProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-builder-canvas',
  })

  return (
    <div className="flex-1 bg-background p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {fields.length === 0 ? (
          <div
            ref={setNodeRef}
            className={cn(
              'flex flex-col items-center justify-center min-h-[520px] text-center border-2 border-dashed rounded-xl p-16 transition-colors',
              isOver && 'border-primary bg-primary/5'
            )}
          >
            <div className="p-5 rounded-full bg-muted mb-6">
              <FileText className="h-14 w-14 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">
              Comece criando seu formulário
            </h3>
            <p className="text-base text-muted-foreground max-w-md">
              Arraste campos da barra lateral para começar a construir seu
              formulário
            </p>
          </div>
        ) : (
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-5">
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
  )
}
