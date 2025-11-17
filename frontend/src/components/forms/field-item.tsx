'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Copy, Trash2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import { motion } from 'framer-motion'
import { FormField } from '@/types/form-builder'
import { FIELD_ICONS, FIELD_LABELS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface FieldItemProps {
  field: FormField
  index: number
  isActive: boolean
  onSelect: () => void
  onRemove: () => void
  onDuplicate: () => void
}

export function FieldItem({
  field,
  index,
  isActive,
  onSelect,
  onRemove,
  onDuplicate,
}: FieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: field.id,
    data: {
      type: 'field',
      index,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.3 : 1,
  }

  const iconName = FIELD_ICONS[field.type] as keyof typeof Icons
  const Icon = Icons[iconName] as React.ComponentType<{ className?: string }>

  return (
    <div className="relative">
      {/* Drop Indicator */}
      {isOver && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute -top-2 left-0 right-0 h-1 bg-primary rounded-full shadow-lg"
          style={{ originX: 0.5 }}
        />
      )}

      <div
        ref={setNodeRef}
        style={style}
        onClick={onSelect}
        className={cn(
          'group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md cursor-pointer',
          isActive && 'border-primary shadow-md ring-2 ring-primary/20',
          isDragging && 'shadow-xl scale-105 border-primary'
        )}
      >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-3 top-1/2 -translate-y-1/2 p-1 rounded bg-card border shadow-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Field Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 p-2 rounded-md bg-primary/10 text-primary">
            {Icon && <Icon className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{field.label}</h4>
              {field.required && (
                <Badge variant="secondary" className="text-xs">
                  Obrigatório
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {FIELD_LABELS[field.type]}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            className="h-7 w-7"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="h-7 w-7 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Field Preview */}
      <div className="space-y-2">
        {field.placeholder && (
          <p className="text-xs text-muted-foreground italic">
            Placeholder: {field.placeholder}
          </p>
        )}
        {field.helpText && (
          <p className="text-xs text-muted-foreground">
            Texto de ajuda: {field.helpText}
          </p>
        )}
        {field.options && field.options.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {field.options.map((option, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {option}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
