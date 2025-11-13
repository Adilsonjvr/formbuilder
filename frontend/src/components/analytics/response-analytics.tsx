'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/types/form-builder'
import { Badge } from '@/components/ui/badge'

interface Response {
  id: string
  data: Record<string, any>
  createdAt: string
}

interface ResponseAnalyticsProps {
  fields: FormField[]
  responses: Response[]
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--info))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
]

export function ResponseAnalytics({ fields, responses }: ResponseAnalyticsProps) {
  // Calculate field statistics
  const fieldStats = useMemo(() => {
    return fields.map((field) => {
      const values = responses.map((r) => r.data[field.id]).filter(Boolean)
      const uniqueValues = new Set(values)

      // Count occurrences for select/radio/checkbox fields
      const valueCounts: Record<string, number> = {}
      if (['SELECT', 'RADIO', 'CHECKBOX'].includes(field.type)) {
        values.forEach((val) => {
          if (Array.isArray(val)) {
            val.forEach((v) => {
              valueCounts[v] = (valueCounts[v] || 0) + 1
            })
          } else {
            valueCounts[val] = (valueCounts[val] || 0) + 1
          }
        })
      }

      // Calculate average for numeric fields
      let average: number | null = null
      if (['NUMBER', 'RATING', 'NPS'].includes(field.type)) {
        const numericValues = values.map(Number).filter((n) => !isNaN(n))
        if (numericValues.length > 0) {
          average = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        }
      }

      return {
        field,
        totalResponses: values.length,
        uniqueResponses: uniqueValues.size,
        valueCounts,
        average,
      }
    })
  }, [fields, responses])

  // Responses over time (last 7 days)
  const responsesOverTime = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        count: 0,
      }
    })

    responses.forEach((response) => {
      const responseDate = new Date(response.createdAt)
      const dayIndex = Math.floor(
        (Date.now() - responseDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (dayIndex >= 0 && dayIndex < 7) {
        last7Days[6 - dayIndex].count++
      }
    })

    return last7Days
  }, [responses])

  // Completion rate
  const completionRate = useMemo(() => {
    if (responses.length === 0) return 0

    const requiredFields = fields.filter((f) => f.required)
    if (requiredFields.length === 0) return 100

    const completeResponses = responses.filter((response) => {
      return requiredFields.every((field) => {
        const value = response.data[field.id]
        return value !== null && value !== undefined && value !== ''
      })
    })

    return Math.round((completeResponses.length / responses.length) * 100)
  }, [fields, responses])

  if (responses.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            Nenhuma resposta ainda para gerar analytics
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Respostas</CardDescription>
            <CardTitle className="text-3xl">{responses.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Taxa de Conclusão</CardDescription>
            <CardTitle className="text-3xl">{completionRate}%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Campos no Formulário</CardDescription>
            <CardTitle className="text-3xl">{fields.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Responses Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas nos Últimos 7 Dias</CardTitle>
          <CardDescription>Visualize o volume de respostas ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responsesOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Field-specific Analytics */}
      {fieldStats.map((stat) => {
        // Only show analytics for fields with options or numeric fields
        if (
          !['SELECT', 'RADIO', 'CHECKBOX', 'RATING', 'NPS', 'NUMBER'].includes(
            stat.field.type
          )
        ) {
          return null
        }

        const hasValueCounts = Object.keys(stat.valueCounts).length > 0
        const hasAverage = stat.average !== null

        if (!hasValueCounts && !hasAverage) return null

        const chartData = Object.entries(stat.valueCounts).map(([name, value]) => ({
          name,
          value,
        }))

        return (
          <Card key={stat.field.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{stat.field.label}</CardTitle>
                  <CardDescription>
                    {stat.totalResponses} resposta{stat.totalResponses !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                {hasAverage && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Média</p>
                    <p className="text-2xl font-bold">
                      {stat.average!.toFixed(1)}
                      {stat.field.type === 'RATING' && (
                        <span className="text-base text-muted-foreground">
                          {' '}
                          / {stat.field.max || 5}
                        </span>
                      )}
                      {stat.field.type === 'NPS' && (
                        <span className="text-base text-muted-foreground"> / 10</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {hasValueCounts && (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Pie Chart */}
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Bar Chart */}
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Value breakdown */}
              {hasValueCounts && (
                <div className="mt-4 space-y-2">
                  {Object.entries(stat.valueCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([value, count]) => (
                      <div
                        key={value}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <Badge variant="outline">{value}</Badge>
                        </span>
                        <span className="text-muted-foreground">
                          {count} ({((count / stat.totalResponses) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
