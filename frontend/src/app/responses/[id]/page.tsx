'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

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

  const { data: formData, isLoading: formLoading, error: formError } = useSWR<FormData>(
    `/api/forms/${id}`,
    () => api(`/api/forms/${id}`)
  )

  const { data: responsesData, isLoading: responsesLoading, error: responsesError } = useSWR<ResponsesData>(
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
    </div>
  )
}
