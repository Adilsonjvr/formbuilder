'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

interface TopForm {
  id: string
  name: string
  responseCount: number
}

interface TopFormsProps {
  forms: TopForm[]
  onViewForm: (formId: string) => void
}

export function TopForms({ forms, onViewForm }: TopFormsProps) {
  if (forms.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Formulários Mais Populares</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {forms.map((form, index) => (
            <div
              key={form.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{form.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {form.responseCount}{' '}
                    {form.responseCount === 1 ? 'resposta' : 'respostas'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewForm(form.id)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Ver
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
