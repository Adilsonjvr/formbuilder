'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  order: number
  options?: string[]
  min?: number
  max?: number
}

interface FormData {
  id: string
  name: string
  description: string | null
  fields: FormField[]
  createdAt: string
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function PublicFormPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, any>>({})

  const { data: formData, isLoading, error } = useSWR<FormData>(
    `/api/public/forms/${id}`,
    () => api(`/api/public/forms/${id}`)
  )

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData) return

    // Validate required fields
    const missingFields = formData.fields
      .filter((field) => field.required && !formValues[field.id])
      .map((field) => field.label)

    if (missingFields.length > 0) {
      toast.error(`Preencha os campos obrigatórios: ${missingFields.join(', ')}`)
      return
    }

    setIsSubmitting(true)

    try {
      const fields = formData.fields.map((field) => ({
        fieldId: field.id,
        value: formValues[field.id] || null,
      }))

      await api(`/api/public/forms/${id}/responses`, {
        method: 'POST',
        body: JSON.stringify({ fields }),
      })

      setIsSubmitted(true)
      toast.success('Resposta enviada com sucesso!')
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Erro ao enviar resposta. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const commonProps = {
      required: field.required,
      placeholder: field.placeholder,
    }

    switch (field.type) {
      case 'short_text':
        return (
          <Input
            {...commonProps}
            type="text"
            value={formValues[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )

      case 'long_text':
        return (
          <Textarea
            {...commonProps}
            value={formValues[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={4}
          />
        )

      case 'email':
        return (
          <Input
            {...commonProps}
            type="email"
            value={formValues[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            min={field.min}
            max={field.max}
            value={formValues[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )

      case 'select':
        return (
          <Select
            value={formValues[field.id] || ''}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
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

      case 'radio':
        return (
          <RadioGroup
            value={formValues[field.id] || ''}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${idx}`} />
                <Label htmlFor={`${field.id}-${idx}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={formValues[field.id] || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        )

      default:
        return (
          <Input
            {...commonProps}
            type="text"
            value={formValues[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Resposta enviada!</CardTitle>
              <CardDescription>
                Obrigado por preencher este formulário. Sua resposta foi registrada com sucesso.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{formData?.name}</CardTitle>
            {formData?.description && (
              <CardDescription className="text-base">
                {formData.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {formData?.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  {field.type !== 'checkbox' && (
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                  )}
                  {renderField(field)}
                  {field.helpText && (
                    <p className="text-sm text-muted-foreground">{field.helpText}</p>
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Resposta'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
