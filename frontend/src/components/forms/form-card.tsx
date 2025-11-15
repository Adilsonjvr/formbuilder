'use client'

import { motion } from 'framer-motion'
import { MoreVertical, FileText, Calendar, BarChart3 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { fadeInUp, transitions } from '@/lib/motion'

interface FormCardProps {
  id: string
  name: string
  description?: string
  createdAt: string
  responseCount?: number
  status?: 'draft' | 'published' | 'archived'
  onEdit?: (id: string) => void
  onViewResponses?: (id: string) => void
  onShare?: (id: string) => void
  onDelete?: (id: string) => void
}

export function FormCard({
  id,
  name,
  description,
  createdAt,
  responseCount = 0,
  status = 'draft',
  onEdit,
  onViewResponses,
  onShare,
  onDelete,
}: FormCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const statusVariant = {
    draft: 'default' as const,
    published: 'default' as const,
    archived: 'default' as const,
  }

  const statusColors = {
    draft: 'bg-warning/10 text-warning-foreground border-warning/20',
    published: 'bg-success/10 text-success-foreground border-success/20',
    archived: 'bg-muted text-muted-foreground',
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transitions.base}
      whileHover={{
        y: -4,
        boxShadow: 'var(--shadow-lg)',
        transition: transitions.fast,
      }}
      className="h-full"
    >
      <Card className="h-full flex flex-col transition-all duration-200 hover:border-primary/20 cursor-pointer">
        <CardHeader className="flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate mb-1.5">
                {name}
              </CardTitle>
              <CardDescription className="text-sm line-clamp-2 leading-relaxed">
                {description || 'Sem descrição'}
              </CardDescription>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8 -mr-2 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48" sideOffset={8}>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.(id)
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onViewResponses?.(id)
                }}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver Respostas
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onShare?.(id)
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Compartilhar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(id)
                }}
              >
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="flex-1 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={statusVariant[status]}
              className={statusColors[status]}
            >
              {status === 'draft' && 'Rascunho'}
              {status === 'published' && 'Publicado'}
              {status === 'archived' && 'Arquivado'}
            </Badge>

            <Badge variant="secondary" className="gap-1">
              <BarChart3 className="h-3 w-3" />
              {responseCount} {responseCount === 1 ? 'resposta' : 'respostas'}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Criado em {formattedDate}</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
