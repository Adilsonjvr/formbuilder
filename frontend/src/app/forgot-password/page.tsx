'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle2, Copy } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { scaleIn, transitions } from '@/lib/motion'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resetUrl, setResetUrl] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })

      if (response.resetUrl) {
        setResetUrl(response.resetUrl)
      }

      setSuccess(true)
      toast.success('Link de recuperação gerado!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar solicitação')
    } finally {
      setLoading(false)
    }
  }

  const copyResetUrl = () => {
    navigator.clipboard.writeText(resetUrl)
    toast.success('Link copiado!')
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
          transition={transitions.base}
          className="w-full max-w-md"
        >
          <Card className="shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Link Enviado!</CardTitle>
              <CardDescription>
                Verifique seu email para o link de recuperação de senha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resetUrl && (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <p className="text-sm font-medium">Link de recuperação (modo desenvolvimento):</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-background p-2 rounded border overflow-x-auto">
                      {resetUrl}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={copyResetUrl}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => router.push(resetUrl.replace(window.location.origin, ''))}
                  >
                    Acessar Link
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => router.push('/login')}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        variants={scaleIn}
        initial="initial"
        animate="animate"
        transition={transitions.base}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit -ml-2 mb-2"
              onClick={() => router.push('/login')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <CardTitle className="text-2xl">Esqueceu sua senha?</CardTitle>
            <CardDescription>
              Digite seu email e enviaremos um link para redefinir sua senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
