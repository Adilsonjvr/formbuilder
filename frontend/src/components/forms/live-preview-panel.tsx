'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldRenderer } from './renderers/field-renderer'
import { FormBuilderState } from '@/types/form-builder'
import { sanitizeText } from '@/lib/sanitize'

interface LivePreviewPanelProps {
  formState: FormBuilderState
}

export function LivePreviewPanel({ formState }: LivePreviewPanelProps) {
  const [previewData, setPreviewData] = useState<Record<string, unknown>>({})

  const sortedFields = [...formState.fields].sort((a, b) => a.order - b.order)
  const primaryColor = formState.primaryColor || '#3b82f6'

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setPreviewData((prev) => ({ ...prev, [fieldId]: value }))
  }

  return (
    <div
      className="w-96 border-l overflow-y-auto"
      style={{
        background: `linear-gradient(to bottom, transparent, ${primaryColor}08)`
      }}
    >
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <h3 className="font-semibold text-sm">Preview em Tempo Real</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Veja como seu formulário aparecerá
        </p>
      </div>

      <div className="p-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">
              {sanitizeText(formState.name) || 'Sem título'}
            </CardTitle>
            {formState.description && (
              <CardDescription>
                {sanitizeText(formState.description)}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {sortedFields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <p>Nenhum campo adicionado.</p>
                <p className="mt-1 text-xs">
                  Adicione campos para visualizá-los aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {sortedFields.map((field) => (
                    <motion.div
                      key={field.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        layout: { duration: 0.2 },
                        opacity: { duration: 0.15 },
                        scale: { duration: 0.15 }
                      }}
                    >
                      <FieldRenderer
                        field={field}
                        value={previewData[field.id]}
                        onChange={(value) => handleFieldChange(field.id, value)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Button
                  type="button"
                  className="w-full mt-2"
                  disabled
                  style={{ backgroundColor: primaryColor }}
                >
                  Enviar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
