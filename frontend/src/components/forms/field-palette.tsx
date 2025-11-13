'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import * as Icons from 'lucide-react'
import {
  FIELD_TYPES,
  FIELD_LABELS,
  FIELD_DESCRIPTIONS,
  FIELD_ICONS,
  FIELDS_BY_CATEGORY,
  FIELD_CATEGORIES,
  FieldType,
} from '@/lib/constants'
import { cn } from '@/lib/utils'

interface FieldPaletteItemProps {
  fieldType: FieldType
}

function FieldPaletteItem({ fieldType }: FieldPaletteItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${fieldType}`,
      data: {
        type: 'palette',
        fieldType,
      },
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  const iconName = FIELD_ICONS[fieldType] as keyof typeof Icons
  const Icon = Icons[iconName] as React.ComponentType<{ className?: string }>

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 cursor-grab active:cursor-grabbing transition-colors',
        isDragging && 'shadow-lg'
      )}
    >
      <div className="flex-shrink-0 p-2 rounded-md bg-primary/10 text-primary">
        {Icon && <Icon className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-none mb-1">
          {FIELD_LABELS[fieldType]}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {FIELD_DESCRIPTIONS[fieldType]}
        </p>
      </div>
    </div>
  )
}

export function FieldPalette() {
  return (
    <aside className="w-80 border-r bg-card/50 p-6 space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold mb-2">Campos</h2>
        <p className="text-sm text-muted-foreground">
          Arraste os campos para o formulário
        </p>
      </div>

      {Object.entries(FIELDS_BY_CATEGORY).map(([category, fields]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {
              FIELD_CATEGORIES[
                category as keyof typeof FIELD_CATEGORIES
              ]
            }
          </h3>
          <div className="space-y-2">
            {fields.map((fieldType) => (
              <FieldPaletteItem key={fieldType} fieldType={fieldType} />
            ))}
          </div>
        </div>
      ))}
    </aside>
  )
}
