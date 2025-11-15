'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin, Download, Eye, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface FormField {
  id: string
  type: string
  label: string
  order: number
}

interface FormData {
  id: string
  name: string
  description: string | null
  fields: FormField[]
}

interface ResponseData {
  fieldId: string
  value: any
}

interface Response {
  id: string
  data: ResponseData[]
  ip: string | null
  createdAt: string
}

interface ResponsesData {
  items: Response[]
  total: number
  page: number
  limit: number
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function ResponsesPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null)
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: formData, isLoading: formLoading, error: formError } = useSWR<FormData>(
    `/api/forms/${id}`,
    () => api(`/api/forms/${id}`)
  )

  const { data: responsesData, isLoading: responsesLoading, error: responsesError, mutate } = useSWR<ResponsesData>(
    `/api/forms/${id}/responses`,
    () => api(`/api/forms/${id}/responses`)
  )

  // Redirect to login if unauthorized
  if (formError && formError.message.includes('Unauthorized')) {
    router.push('/login')
    return null
  }

  const isLoading = formLoading || responsesLoading
  const error = formError || responsesError

  const getFieldValue = (response: Response, fieldId: string) => {
    const field = response.data.find((d: ResponseData) => d.fieldId === fieldId)
    if (!field || field.value === null || field.value === undefined) {
      return '-'
    }
    if (typeof field.value === 'boolean') {
      return field.value ? 'Sim' : 'Não'
    }
    return String(field.value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/forms/${id}/export?format=${format}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to export')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${formData?.name || 'formulario'}-respostas.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const handleDelete = async () => {
    if (!responseToDelete) return

    setIsDeleting(true)
    try {
      await api(`/api/forms/${id}/responses/${responseToDelete}`, {
        method: 'DELETE',
      })

      toast.success('Resposta deletada com sucesso!')
      setResponseToDelete(null)
      mutate() // Revalidate data
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Erro ao deletar resposta')
    } finally {
      setIsDeleting(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive">
            {error.message.includes('not found') ? 'Formulário não encontrado' : 'Erro ao carregar respostas'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Tente novamente mais tarde
          </p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container pt-16 pb-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {isLoading ? (
          <>
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-6 w-64" />
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight">{formData?.name}</h1>
            {formData?.description && (
              <p className="text-muted-foreground">{formData.description}</p>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Respostas</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                responsesData?.total || 0
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardDescription>Exportar Respostas</CardDescription>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                disabled={!responsesData?.items || responsesData.items.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('json')}
                disabled={!responsesData?.items || responsesData.items.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar JSON
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas</CardTitle>
          <CardDescription>
            Visualize todas as respostas recebidas para este formulário
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !responsesData?.items || responsesData.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma resposta recebida ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Data/Hora</TableHead>
                    {formData?.fields.map((field) => (
                      <TableHead key={field.id}>{field.label}</TableHead>
                    ))}
                    <TableHead className="w-[120px]">IP</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responsesData.items.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(response.createdAt)}
                        </div>
                      </TableCell>
                      {formData?.fields.map((field) => (
                        <TableCell key={field.id}>
                          {getFieldValue(response, field.id)}
                        </TableCell>
                      ))}
                      <TableCell>
                        {response.ip ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="font-mono text-xs">{response.ip}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedResponse(response)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setResponseToDelete(response.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
          )}

          {responsesData && responsesData.total > 0 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {responsesData.items.length} de {responsesData.total} respostas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Detail Modal */}
      <Dialog open={!!selectedResponse} onOpenChange={(open) => !open && setSelectedResponse(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Resposta</DialogTitle>
            <DialogDescription>
              Visualize todas as informações desta resposta
            </DialogDescription>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-6 mt-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data/Hora</p>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedResponse.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Endereço IP</p>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedResponse.ip || 'Não disponível'}
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Respostas dos Campos</h3>
                {formData?.fields.map((field) => {
                  const value = getFieldValue(selectedResponse, field.id)
                  return (
                    <div key={field.id} className="border-l-2 border-primary/20 pl-4 py-2">
                      <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
                      <p className="text-base mt-1">{value}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!responseToDelete} onOpenChange={(open) => !open && setResponseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta resposta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
