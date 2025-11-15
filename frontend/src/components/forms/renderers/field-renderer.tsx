'use client'

import { FormField } from '@/types/form-builder'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

const FileUpload = dynamic(
  () => import('@/components/forms/file-upload').then((mod) => mod.FileUpload),
  { ssr: false }
)

interface FieldRendererProps {
  field: FormField
  value: unknown
  onChange: (value: unknown) => void
  error?: string
}

export function FieldRenderer({
  field,
  value,
  onChange,
  error,
}: FieldRendererProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const renderInput = () => {
    const stringValue = typeof value === 'string' ? value : ''
    const numberValue = typeof value === 'number' ? value : undefined
    switch (field.type) {
      case 'TEXT':
        return (
          <Input
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        )

      case 'EMAIL':
        return (
          <Input
            type="email"
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'NUMBER':
        return (
          <Input
            type="number"
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            min={field.min}
            max={field.max}
          />
        )

      case 'DATE':
        return (
          <Input
            type="date"
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        )

      case 'TIME':
        return (
          <Input
            type="time"
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        )

      case 'SELECT':
        return (
          <Select value={stringValue} onValueChange={(val) => onChange(val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Selecione uma opção'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, idx) => (
                <SelectItem key={idx} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'RADIO':
        return (
          <RadioGroup value={stringValue} onValueChange={(val) => onChange(val)}>
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${idx}`} />
                <Label htmlFor={`${field.id}-${idx}`} className="font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'CHECKBOX':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => {
              const checked = Array.isArray(value)
                ? (value as string[]).includes(option)
                : false
              return (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${idx}`}
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const currentValues = Array.isArray(value) ? (value as string[]) : []
                      const nextChecked = isChecked === true
                      if (nextChecked) {
                        onChange([...currentValues, option])
                      } else {
                        onChange(currentValues.filter((v) => v !== option))
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-${idx}`} className="font-normal">
                    {option}
                  </Label>
                </div>
              )
            })}
          </div>
        )

      case 'RATING':
        const maxRating = field.max || 5
        const currentRating = typeof numberValue === 'number' ? numberValue : 0
        return (
          <div className="flex items-center gap-1">
            {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-colors',
                    star <= (hoverRating || currentRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  )}
                />
              </button>
            ))}
            {currentRating > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                {currentRating} de {maxRating}
              </span>
            )}
          </div>
        )

      case 'NPS':
        const maxNPS = field.max || 10
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-11 gap-2">
              {Array.from({ length: maxNPS + 1 }, (_, i) => i).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onChange(num)}
                  className={cn(
                    'aspect-square rounded-lg border-2 font-semibold transition-all hover:scale-105',
                    numberValue === num
                      ? 'border-primary bg-primary text-primary-foreground shadow-md'
                      : 'border-border bg-card hover:border-primary/50'
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pouco provável</span>
              <span>Muito provável</span>
            </div>
          </div>
        )

      case 'FILE':
        return (
          <FileUpload
            value={value}
            onChange={onChange}
            accept={field.validation?.pattern}
            maxSize={field.validation?.maxLength || 10}
            error={error}
          />
        )

      default:
        return (
          <Textarea
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id} className="text-base">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderInput()}
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
