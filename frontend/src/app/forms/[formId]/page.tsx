'use client'

import { use, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import { CheckCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldRenderer } from '@/components/forms/renderers/field-renderer'
import { Skeleton } from '@/components/ui/skeleton'
import { fadeIn, scaleIn, transitions } from '@/lib/motion'
import { FormField } from '@/types/form-builder'

interface PageProps {
  params: Promise<{
    formId: string
  }>
}

export default function PublicFormPage({ params }: PageProps) {
  const { formId } = use(params)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { data: form, isLoading, error } = useSWR(
    `/forms/${formId}`,
    () => api(`/forms/${formId}`)
  )

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    form.fields.forEach((field: FormField) => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = 'Este campo é obrigatório'
      }

      // Email validation
      if (field.type === 'EMAIL' && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData[field.id])) {
          newErrors[field.id] = 'Email inválido'
        }
      }

      // Min/Max length validation
      if (field.validation?.minLength && formData[field.id]) {
        if (formData[field.id].length < field.validation.minLength) {
          newErrors[field.id] = `Mínimo de ${field.validation.minLength} caracteres`
        }
      }
      if (field.validation?.maxLength && formData[field.id]) {
        if (formData[field.id].length > field.validation.maxLength) {
          newErrors[field.id] = `Máximo de ${field.validation.maxLength} caracteres`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      await api(`/public/forms/${formId}/responses`, {
        method: 'POST',
        body: JSON.stringify({
          data: formData,
        }),
      })

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors({ submit: 'Erro ao enviar formulário. Tente novamente.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Formulário não encontrado</CardTitle>
            <CardDescription>
              Este formulário não existe ou foi removido.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
          transition={{ ...transitions.base, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <Card className="text-center shadow-lg">
            <CardContent className="pt-12 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-6"
              >
                <CheckCircle className="h-10 w-10 text-success" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Formulário enviado!</h2>
              <p className="text-muted-foreground mb-6">
                Obrigado por preencher o formulário. Sua resposta foi registrada com sucesso.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false)
                  setFormData({})
                }}
              >
                Enviar outra resposta
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const sortedFields = [...form.fields].sort((a: FormField, b: FormField) => a.order - b.order)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={transitions.base}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">{form.name}</CardTitle>
            {form.description && (
              <CardDescription className="text-base mt-2">
                {form.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {sortedFields.map((field: FormField, index: number) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...transitions.base, delay: index * 0.05 }}
                  >
                    <FieldRenderer
                      field={field}
                      value={formData[field.id]}
                      onChange={(value) => handleFieldChange(field.id, value)}
                      error={errors[field.id]}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {errors.submit && (
                <p className="text-sm text-destructive">{errors.submit}</p>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
