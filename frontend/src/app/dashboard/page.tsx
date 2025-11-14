'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FileText } from 'lucide-react'
import { api } from '@/lib/api'
import { FormCard } from '@/components/forms/form-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { staggerContainer, staggerItem, transitions } from '@/lib/motion'

interface Form {
  id: string
  name: string
  description: string | null
  createdAt: string
  _count?: {
    responses: number
  }
}

interface FormsResponse {
  items: Form[]
  total: number
  page: number
  limit: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR<FormsResponse>('/api/forms', () =>
    api('/api/forms')
  )

  // Redirect to login if unauthorized
  if (error && error.message.includes('Unauthorized')) {
    router.push('/login')
    return null
  }

  const handleEdit = (formId: string) => {
    router.push(`/builder/${formId}`)
  }

  const handleViewResponses = (formId: string) => {
    router.push(`/responses/${formId}`)
  }

  const handleShare = (formId: string) => {
    const publicUrl = `${window.location.origin}/forms/${formId}`
    navigator.clipboard.writeText(publicUrl)

    // Simple toast notification (you could use a proper toast library)
    const toast = document.createElement('div')
    toast.textContent = 'Link copiado para a área de transferência!'
    toast.className = 'fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom'
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.remove()
    }, 3000)
  }

  const handleDelete = async (formId: string) => {
    if (!confirm('Tem certeza que deseja excluir este formulário? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await api(`/api/forms/${formId}`, {
        method: 'DELETE',
      })
      // Revalidate data after deletion
      mutate()
    } catch (error) {
      console.error('Error deleting form:', error)
      alert('Erro ao excluir formulário. Tente novamente.')
    }
  }

  const handleCreateNew = () => {
    router.push('/builder/new')
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive">
            Erro ao carregar formulários
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Tente novamente mais tarde
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Formulários</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e acompanhe seus formulários
          </p>
        </div>
        <Button
          size="lg"
          onClick={handleCreateNew}
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Criar Formulário
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!data?.items || data.items.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.base}
          className="flex flex-col items-center justify-center min-h-[400px] text-center"
        >
          <div className="p-4 rounded-full bg-muted mb-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Nenhum formulário ainda
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Crie seu primeiro formulário e comece a coletar respostas
          </p>
          <Button size="lg" onClick={handleCreateNew} className="gap-2">
            <Plus className="h-5 w-5" />
            Criar Primeiro Formulário
          </Button>
        </motion.div>
      )}

      {/* Forms Grid */}
      {!isLoading && data?.items && data.items.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {data.items.map((form) => (
              <motion.div
                key={form.id}
                variants={staggerItem}
                transition={transitions.base}
              >
                <FormCard
                  id={form.id}
                  name={form.name}
                  description={form.description || undefined}
                  createdAt={form.createdAt}
                  responseCount={form._count?.responses || 0}
                  status="draft"
                  onEdit={handleEdit}
                  onViewResponses={handleViewResponses}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination Info */}
      {data && data.total > 0 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Mostrando {data.items.length} de {data.total} formulários
          </p>
        </div>
      )}
    </div>
  )
}
