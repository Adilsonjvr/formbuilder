'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

interface FormSettingsDialogProps {
  enableNotifications: boolean
  notificationEmail: string
  onUpdate: (updates: { enableNotifications?: boolean; notificationEmail?: string }) => void
}

export function FormSettingsDialog({
  enableNotifications,
  notificationEmail,
  onUpdate,
}: FormSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [localEnableNotifications, setLocalEnableNotifications] = useState(enableNotifications)
  const [localNotificationEmail, setLocalNotificationEmail] = useState(notificationEmail)

  const handleSave = () => {
    onUpdate({
      enableNotifications: localEnableNotifications,
      notificationEmail: localNotificationEmail,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurações do Formulário</DialogTitle>
          <DialogDescription>
            Configure as opções de notificação para este formulário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-notifications" className="text-base">
                  Notificações por Email
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba um email sempre que alguém enviar uma resposta
                </p>
              </div>
              <Switch
                id="enable-notifications"
                checked={localEnableNotifications}
                onCheckedChange={setLocalEnableNotifications}
              />
            </div>

            {localEnableNotifications && (
              <div className="space-y-2">
                <Label htmlFor="notification-email">Email de Notificação</Label>
                <Input
                  id="notification-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={localNotificationEmail}
                  onChange={(e) => setLocalNotificationEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  As notificações serão enviadas para este endereço
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
