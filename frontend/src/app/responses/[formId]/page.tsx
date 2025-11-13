'use client'

import { use, useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { ArrowLeft, Download, Eye, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { fadeIn, staggerContainer, transitions } from '@/lib/motion'
import { FormField } from '@/types/form-builder'

interface PageProps {
  params: Promise<{
    formId: string
  }>
}

interface Response {
  id: string
  data: Record<string, any>
  createdAt: string
}

interface Form {
  id: string
  name: string
  description: string
  fields: FormField[]
  responses: Response[]
}

export default function ResponsesPage({ params }: PageProps) {
  const { formId } = use(params)
  const router = useRouter()
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null)

  const { data: form, isLoading, error, mutate } = useSWR<Form>(
    `/forms/${formId}`,
    () => api(`/forms/${formId}`)
  )

  const handleExportCSV = () => {
    if (!form) return

    // Create CSV header
    const headers = form.fields.map((field) => field.label).join(',')

    // Create CSV rows
    const rows = form.responses.map((response) => {
      return form.fields
        .map((field) => {
          const value = response.data[field.id]
          if (Array.isArray(value)) return `"${value.join(', ')}"`
          return `"${value || ''}"`
        })
        .join(',')
    })

    // Combine and download
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.name.replace(/\s+/g, '-')}-respostas.csv`
    a.click()
  }

  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta resposta?')) return

    try {
      await api(`/forms/${formId}/responses/${responseId}`, {
        method: 'DELETE',
      })
      mutate()
    } catch (error) {
      console.error('Error deleting response:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Erro ao carregar respostas</CardTitle>
              <CardDescription>
                Não foi possível carregar as respostas deste formulário.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  const sortedFields = [...form.fields].sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{form.name}</h1>
              <p className="text-sm text-muted-foreground">
                {form.responses.length} {form.responses.length === 1 ? 'resposta' : 'respostas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={form.responses.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/builder/${formId}`)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Editar Formulário
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container p-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {form.responses.length === 0 ? (
            <motion.div variants={fadeIn}>
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Eye className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhuma resposta ainda</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Compartilhe o link do formulário para começar a receber respostas.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      const publicUrl = `${window.location.origin}/forms/${formId}`
                      navigator.clipboard.writeText(publicUrl)
                      alert('Link copiado!')
                    }}
                  >
                    Copiar Link do Formulário
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>Respostas</CardTitle>
                  <CardDescription>
                    Todas as respostas submetidas ao formulário
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">#</TableHead>
                          {sortedFields.slice(0, 3).map((field) => (
                            <TableHead key={field.id}>{field.label}</TableHead>
                          ))}
                          <TableHead>Data</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {form.responses.map((response, index) => (
                          <TableRow key={response.id}>
                            <TableCell className="font-medium">
                              {form.responses.length - index}
                            </TableCell>
                            {sortedFields.slice(0, 3).map((field) => {
                              const value = response.data[field.id]
                              return (
                                <TableCell key={field.id}>
                                  {Array.isArray(value)
                                    ? value.join(', ')
                                    : value || '-'}
                                </TableCell>
                              )
                            })}
                            <TableCell>
                              {new Date(response.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setSelectedResponse(response)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleDeleteResponse(response.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Response Detail Modal */}
          {selectedResponse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              onClick={() => setSelectedResponse(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={transitions.base}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Detalhes da Resposta</CardTitle>
                        <CardDescription>
                          Submetida em{' '}
                          {new Date(selectedResponse.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedResponse(null)}
                      >
                        ×
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sortedFields.map((field) => {
                      const value = selectedResponse.data[field.id]
                      return (
                        <div key={field.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{field.label}</p>
                            {field.required && (
                              <Badge variant="secondary" className="text-xs">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-sm">
                              {Array.isArray(value)
                                ? value.join(', ')
                                : value || '(não respondido)'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
