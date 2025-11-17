'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileText, MessageSquare } from 'lucide-react'

interface Activity {
  id: string
  type: 'form_created' | 'response_received'
  formName: string
  timestamp: string
  responseCount?: number
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0"
            >
              <div
                className={`p-2 rounded-full ${
                  activity.type === 'form_created'
                    ? 'bg-blue-50 dark:bg-blue-950'
                    : 'bg-green-50 dark:bg-green-950'
                }`}
              >
                {activity.type === 'form_created' ? (
                  <FileText className="h-4 w-4 text-blue-500" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.type === 'form_created'
                    ? 'Formulário criado'
                    : 'Nova resposta recebida'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.formName}
                  {activity.responseCount !== undefined && (
                    <Badge variant="secondary" className="ml-2">
                      {activity.responseCount}{' '}
                      {activity.responseCount === 1 ? 'resposta' : 'respostas'}
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
