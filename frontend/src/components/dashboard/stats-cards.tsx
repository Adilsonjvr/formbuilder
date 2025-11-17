'use client'

import { motion } from 'framer-motion'
import { FileText, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { staggerItem } from '@/lib/motion'

interface StatsCardsProps {
  totalForms: number
  totalResponses: number
  averageResponsesPerForm: number
  completionRate: number
}

export function StatsCards({
  totalForms,
  totalResponses,
  averageResponsesPerForm,
  completionRate,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Formulários',
      value: totalForms.toString(),
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Respostas Totais',
      value: totalResponses.toString(),
      icon: MessageSquare,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Média por Formulário',
      value: averageResponsesPerForm.toFixed(1),
      icon: BarChart3,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      label: 'Taxa de Conclusão',
      value: `${completionRate.toFixed(0)}%`,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            variants={staggerItem}
            custom={index}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
