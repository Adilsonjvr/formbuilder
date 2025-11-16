'use client'

import { Fragment, use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, Calendar, MapPin, Download, Eye, Trash2 } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { sanitizeText } from '@/lib/sanitize'
import { ResponseAnalytics } from '@/components/analytics/response-analytics'

interface FormField {
  id: string
  type: string
  label: string
  order: number
  required: boolean
  max?: number | null
}

interface FormData {
  id: string
  name: string
  description: string | null
  fields: FormField[]
}

interface ResponseData {
  fieldId: string
  value: unknown
}

interface ResponseMetadata {
  durationMs: number
}

interface Response {
  id: string
  data: ResponseData[]
  ip: string | null
  metadata?: ResponseMetadata | null
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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedField, setSelectedField] = useState('all')
  const [fieldValue, setFieldValue] = useState('')
  const [ipFilter, setIpFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedIpFilter = useDebounce(ipFilter, 400)
  const debouncedFieldValue = useDebounce(fieldValue, 400)
  const debouncedSearchTerm = useDebounce(searchTerm, 400)

  const filtersSignature = [
    dateRange?.from?.toISOString() ?? '',
    dateRange?.to?.toISOString() ?? '',
    selectedField,
    debouncedFieldValue,
    debouncedIpFilter,
    debouncedSearchTerm,
  ].join('|')

  const { data: formData, isLoading: formLoading, error: formError } = useSWR<FormData>(
    `/api/forms/${id}`,
    (url: string) => api<FormData>(url)
  )

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(pageSize),
  })

  if (dateRange?.from) {
    const fromDate = new Date(dateRange.from)
    fromDate.setHours(0, 0, 0, 0)
    queryParams.set('startDate', fromDate.toISOString())
  }

  const toSource = dateRange?.to ?? dateRange?.from
  if (toSource) {
    const toDate = new Date(toSource)
    toDate.setHours(23, 59, 59, 999)
    queryParams.set('endDate', toDate.toISOString())
  }

  if (debouncedIpFilter) {
    queryParams.set('ip', debouncedIpFilter)
  }

  if (selectedField !== 'all' && debouncedFieldValue) {
    queryParams.set('fieldId', selectedField)
    queryParams.set('fieldValue', debouncedFieldValue)
  }

  if (debouncedSearchTerm) {
    queryParams.set('search', debouncedSearchTerm)
  }

  const responsesEndpoint = `/api/forms/${id}/responses?${queryParams.toString()}`

  const { data: responsesData, isLoading: responsesLoading, error: responsesError, mutate } = useSWR<ResponsesData>(
    responsesEndpoint,
    (url: string) => api<ResponsesData>(url)
  )

  useEffect(() => {
    setPage((prev) => (prev === 1 ? prev : 1))
  }, [filtersSignature])

  useEffect(() => {
    if (!responsesData) return
    const totalPagesFromData = Math.max(1, Math.ceil(responsesData.total / responsesData.limit))
    if (responsesData.total > 0 && page > totalPagesFromData) {
      setPage(totalPagesFromData)
    }
  }, [responsesData, page])

  // Redirect to login if unauthorized
  if (formError && formError.message.includes('Unauthorized')) {
    router.push('/login')
    return null
  }

  const isLoading = formLoading || responsesLoading
  const error = formError || responsesError
  const totalResponses = responsesData?.total ?? 0
  const currentPage = responsesData?.page ?? page
  const currentLimit = responsesData?.limit ?? pageSize
  const normalizedLimit = currentLimit || 1
  const totalPages = Math.max(1, Math.ceil(totalResponses / normalizedLimit))
  const visibleCount = responsesData?.items.length ?? 0
  const startItem = totalResponses === 0 ? 0 : (currentPage - 1) * normalizedLimit + 1
  const endItem = totalResponses === 0 ? 0 : startItem + Math.max(visibleCount - 1, 0)
  const canGoToPrevious = currentPage > 1
  const canGoToNext = totalResponses > 0 && currentPage < totalPages
  const hasActiveFilters =
    Boolean(dateRange?.from || dateRange?.to) ||
    Boolean(ipFilter) ||
    (selectedField !== 'all' && Boolean(fieldValue)) ||
    Boolean(searchTerm)
  const activeFilterLabels = [
    dateRange?.from ? 'período' : null,
    selectedField !== 'all' && fieldValue ? 'campo' : null,
    ipFilter ? 'IP' : null,
    searchTerm ? 'busca' : null,
  ].filter(Boolean) as string[]
  const analyticsFields = formData?.fields.map((field) => ({
    id: field.id,
    label: field.label,
    type: field.type,
    required: field.required,
    max: field.max ?? null,
  }))

  const getFieldValue = (response: Response, fieldId: string) => {
    const field = response.data.find((d: ResponseData) => d.fieldId === fieldId)
    if (!field || field.value === null || field.value === undefined) {
      return '-'
    }
    if (typeof field.value === 'boolean') {
      return field.value ? 'Sim' : 'Não'
    }
    return sanitizeText(String(field.value))
  }

  const highlightMatches = (text: string) => {
    if (!text) return text
    if (!debouncedSearchTerm) return text
    const escapedSearch = escapeRegExp(debouncedSearchTerm)
    if (!escapedSearch) return text
    const regex = new RegExp(`(${escapedSearch})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <mark key={`${part}-${index}`} className="rounded bg-primary/20 px-0.5 text-primary">
          {part}
        </mark>
      ) : (
        <Fragment key={`${part}-${index}`}>{part}</Fragment>
      )
    )
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

  const handleSelectField = (value: string) => {
    setSelectedField(value)
    if (value === 'all') {
      setFieldValue('')
    }
  }

  const handleQuickRange = (days: number) => {
    const now = new Date()
    const from = subDays(now, days - 1)
    setDateRange({ from, to: now })
  }

  const handleClearFilters = () => {
    setDateRange(undefined)
    setSelectedField('all')
    setFieldValue('')
    setIpFilter('')
    setSearchTerm('')
    setPage(1)
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
    <div className="container max-w-6xl px-6 lg:px-8 pt-16 pb-12 space-y-8">
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
            <h1 className="text-3xl font-bold tracking-tight">{sanitizeText(formData?.name)}</h1>
            {formData?.description && (
              <p className="text-muted-foreground">{sanitizeText(formData.description)}</p>
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

      {/* Analytics */}
      {!isLoading && analyticsFields && responsesData?.items && responsesData.items.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Insights de Respostas</h2>
            <p className="text-sm text-muted-foreground">
              Acompanhe tendências, distribuição de respostas e taxas de conclusão deste formulário.
            </p>
          </div>
          <ResponseAnalytics fields={analyticsFields} responses={responsesData.items} />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Refine as respostas exibidas para este formulário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Período</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateRange?.from && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                      ) : (
                        format(dateRange.from, 'dd/MM/yyyy')
                      )
                    ) : (
                      <span>Selecionar período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    numberOfMonths={2}
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range)}
                  />
                  <div className="border-t p-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Atalhos rápidos</p>
                    <div className="flex flex-wrap gap-2">
                      {[7, 30].map((days) => (
                        <Button
                          key={days}
                          variant="ghost"
                          size="sm"
                          className="px-2"
                          onClick={() => handleQuickRange(days)}
                        >
                          Últimos {days} dias
                        </Button>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setDateRange(undefined)}>
                      Limpar período
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Campo</p>
              <Select
                value={selectedField}
                onValueChange={handleSelectField}
                disabled={!formData || formData.fields.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar campo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os campos</SelectItem>
                  {formData?.fields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Valor do campo</p>
              <Input
                placeholder="Digite para filtrar"
                value={fieldValue}
                onChange={(event) => setFieldValue(event.target.value)}
                disabled={selectedField === 'all'}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Endereço IP</p>
              <Input
                placeholder="Ex: 192.168.0.1"
                value={ipFilter}
                onChange={(event) => setIpFilter(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleClearFilters} disabled={!hasActiveFilters}>
              Limpar filtros
            </Button>
            {hasActiveFilters && (
              <span className="text-xs text-muted-foreground">
                Filtros ativos: {activeFilterLabels.join(', ')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Responses Table */}
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Respostas</CardTitle>
            <CardDescription>
              Visualize todas as respostas recebidas para este formulário
            </CardDescription>
          </div>
          <div className="w-full md:w-[320px]">
            <Input
              type="search"
              placeholder="Buscar em todas as respostas"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
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
                      <TableHead key={field.id}>{sanitizeText(field.label)}</TableHead>
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
                      {formData?.fields.map((field) => {
                        const value = getFieldValue(response, field.id)
                        return (
                          <TableCell key={field.id}>
                            {typeof value === 'string' ? highlightMatches(value) : value}
                          </TableCell>
                        )
                      })}
                      <TableCell>
                        {response.ip ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="font-mono text-xs">
                              {highlightMatches(sanitizeText(response.ip ?? ''))}
                            </span>
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
            <div className="flex flex-col gap-4 pt-4 mt-4 border-t md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Mostrando {startItem}-{endItem} de {responsesData.total} respostas
                </p>
                <p className="text-xs text-muted-foreground">Página {currentPage} de {totalPages}</p>
              </div>

              <div className="flex flex-col gap-4 w-full sm:flex-row sm:items-center sm:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Respostas por página</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) => {
                      const newSize = Number(value)
                      setPageSize(newSize)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {[10, 25, 50, 100].map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size} / página
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Pagination className="md:justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        aria-disabled={!canGoToPrevious}
                        onClick={(event) => {
                          event.preventDefault()
                          if (canGoToPrevious) {
                            setPage((prev) => Math.max(prev - 1, 1))
                          }
                        }}
                        className={!canGoToPrevious ? 'pointer-events-none opacity-50' : undefined}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        size="default"
                        isActive
                        aria-disabled
                        onClick={(event) => event.preventDefault()}
                      >
                        Página {currentPage} de {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        aria-disabled={!canGoToNext}
                        onClick={(event) => {
                          event.preventDefault()
                          if (canGoToNext) {
                            setPage((prev) => prev + 1)
                          }
                        }}
                        className={!canGoToNext ? 'pointer-events-none opacity-50' : undefined}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
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

function useDebounce<T>(value: T, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
