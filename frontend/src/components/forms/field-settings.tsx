'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { FormField } from '@/types/form-builder'
import { FIELD_LABELS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface FieldSettingsProps {
  field: FormField | null
  onClose: () => void
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void
}

export function FieldSettings({
  field,
  onClose,
  onUpdate,
}: FieldSettingsProps) {
  const [localField, setLocalField] = useState<FormField | null>(field)

  useEffect(() => {
    setLocalField(field)
  }, [field])

  if (!localField) return null

  const handleUpdate = (updates: Partial<FormField>) => {
    const updated = { ...localField, ...updates }
    setLocalField(updated)
    onUpdate(localField.id, updates)
  }

  const addOption = () => {
    const newOptions = [
      ...(localField.options || []),
      `Opção ${(localField.options?.length || 0) + 1}`,
    ]
    handleUpdate({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(localField.options || [])]
    newOptions[index] = value
    handleUpdate({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = (localField.options || []).filter((_, i) => i !== index)
    handleUpdate({ options: newOptions })
  }

  const showOptions = ['SELECT', 'RADIO', 'CHECKBOX'].includes(localField.type)
  const showMinMax = ['NUMBER', 'RATING', 'NPS'].includes(localField.type)

  return (
    <Sheet open={!!field} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:w-[480px] lg:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configurar Campo</SheetTitle>
          <SheetDescription>
            {FIELD_LABELS[localField.type]}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8 px-2">
          {/* Label */}
          <div className="space-y-2.5">
            <Label htmlFor="field-label">Label do Campo</Label>
            <Input
              id="field-label"
              value={localField.label}
              onChange={(e) => handleUpdate({ label: e.target.value })}
              placeholder="Digite o label do campo"
            />
          </div>

          {/* Placeholder */}
          {!['CHECKBOX', 'RADIO', 'RATING', 'NPS'].includes(
            localField.type
          ) && (
            <div className="space-y-2.5">
              <Label htmlFor="field-placeholder">Placeholder</Label>
              <Input
                id="field-placeholder"
                value={localField.placeholder || ''}
                onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                placeholder="Texto de exemplo no campo"
              />
            </div>
          )}

          {/* Help Text */}
          <div className="space-y-2.5">
            <Label htmlFor="field-help">Texto de Ajuda</Label>
            <Textarea
              id="field-help"
              value={localField.helpText || ''}
              onChange={(e) => handleUpdate({ helpText: e.target.value })}
              placeholder="Informação adicional para o usuário"
              rows={3}
            />
          </div>

          {/* Required */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="field-required">Campo Obrigatório</Label>
              <p className="text-xs text-muted-foreground">
                Usuário deve preencher este campo
              </p>
            </div>
            <Switch
              id="field-required"
              checked={localField.required}
              onCheckedChange={(checked) => handleUpdate({ required: checked })}
            />
          </div>

          {/* Options for SELECT, RADIO, CHECKBOX */}
          {showOptions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Opções</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2.5">
                {(localField.options || []).map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Opção ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                      disabled={(localField.options?.length || 0) <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Min/Max for NUMBER, RATING, NPS */}
          {showMinMax && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label htmlFor="field-min">
                  {localField.type === 'NUMBER' ? 'Mínimo' : 'Min'}
                </Label>
                <Input
                  id="field-min"
                  type="number"
                  value={localField.min || ''}
                  onChange={(e) =>
                    handleUpdate({ min: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="field-max">
                  {localField.type === 'NUMBER' ? 'Máximo' : 'Max'}
                </Label>
                <Input
                  id="field-max"
                  type="number"
                  value={localField.max || ''}
                  onChange={(e) =>
                    handleUpdate({ max: parseInt(e.target.value) || 10 })
                  }
                />
              </div>
            </div>
          )}

          {/* Validation for TEXT/EMAIL */}
          {['TEXT', 'EMAIL'].includes(localField.type) && (
            <div className="space-y-4">
              <Label>Validação</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <Label htmlFor="field-minlength" className="text-xs">
                    Mín. Caracteres
                  </Label>
                  <Input
                    id="field-minlength"
                    type="number"
                    value={localField.validation?.minLength || ''}
                    onChange={(e) =>
                      handleUpdate({
                        validation: {
                          ...localField.validation,
                          minLength: parseInt(e.target.value) || undefined,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="field-maxlength" className="text-xs">
                    Máx. Caracteres
                  </Label>
                  <Input
                    id="field-maxlength"
                    type="number"
                    value={localField.validation?.maxLength || ''}
                    onChange={(e) =>
                      handleUpdate({
                        validation: {
                          ...localField.validation,
                          maxLength: parseInt(e.target.value) || undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* File Upload Settings */}
          {localField.type === 'FILE' && (
            <div className="space-y-4">
              <Label>Configurações de Upload</Label>
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <Label htmlFor="file-accept" className="text-xs">
                    Tipos de Arquivo Aceitos
                  </Label>
                  <Input
                    id="file-accept"
                    value={localField.validation?.pattern || ''}
                    onChange={(e) =>
                      handleUpdate({
                        validation: {
                          ...localField.validation,
                          pattern: e.target.value || undefined,
                        },
                      })
                    }
                    placeholder="Ex: image/*, .pdf, .doc"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use MIME types (image/*, video/*) ou extensões (.pdf, .doc)
                  </p>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="file-maxsize" className="text-xs">
                    Tamanho Máximo (MB)
                  </Label>
                  <Input
                    id="file-maxsize"
                    type="number"
                    min="1"
                    max="100"
                    value={localField.validation?.maxLength || 10}
                    onChange={(e) =>
                      handleUpdate({
                        validation: {
                          ...localField.validation,
                          maxLength: parseInt(e.target.value) || 10,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Done Button */}
          <div className="pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              className="w-full"
              size="lg"
            >
              Concluído
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
