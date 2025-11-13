'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldRenderer } from './renderers/field-renderer'
import { FormBuilderState } from '@/types/form-builder'
import { fadeIn, transitions } from '@/lib/motion'

interface FormPreviewProps {
  open: boolean
  onClose: () => void
  formState: FormBuilderState
}

export function FormPreview({ open, onClose, formState }: FormPreviewProps) {
  const [previewData, setPreviewData] = useState<Record<string, any>>({})

  const sortedFields = [...formState.fields].sort((a, b) => a.order - b.order)

  const handleFieldChange = (fieldId: string, value: any) => {
    setPreviewData((prev) => ({ ...prev, [fieldId]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 z-10 flex flex-row items-center justify-between p-4 border-b bg-background">
          <div>
            <DialogTitle className="text-lg font-semibold">
              Visualização do Formulário
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Veja como seu formulário aparecerá para os usuários
            </DialogDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="p-8 bg-muted/30">
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={transitions.base}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl">
                  {formState.name || 'Sem título'}
                </CardTitle>
                {formState.description && (
                  <CardDescription className="text-base mt-2">
                    {formState.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent>
                {sortedFields.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Nenhum campo adicionado ainda.</p>
                    <p className="text-sm mt-2">
                      Adicione campos ao formulário para visualizá-los aqui.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sortedFields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...transitions.base, delay: index * 0.05 }}
                      >
                        <FieldRenderer
                          field={field}
                          value={previewData[field.id]}
                          onChange={(value) => handleFieldChange(field.id, value)}
                        />
                      </motion.div>
                    ))}

                    <Button
                      type="button"
                      className="w-full"
                      size="lg"
                      disabled
                    >
                      Enviar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
