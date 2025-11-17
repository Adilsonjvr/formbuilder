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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ColorPicker } from '@/components/ui/color-picker'

interface FormSettingsDialogProps {
  enableNotifications: boolean
  notificationEmail: string
  primaryColor: string
  accentColor: string
  onUpdate: (updates: {
    enableNotifications?: boolean
    notificationEmail?: string
    primaryColor?: string
    accentColor?: string
  }) => void
}

export function FormSettingsDialog({
  enableNotifications,
  notificationEmail,
  primaryColor,
  accentColor,
  onUpdate,
}: FormSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [localEnableNotifications, setLocalEnableNotifications] = useState(enableNotifications)
  const [localNotificationEmail, setLocalNotificationEmail] = useState(notificationEmail)
  const [localPrimaryColor, setLocalPrimaryColor] = useState(primaryColor)
  const [localAccentColor, setLocalAccentColor] = useState(accentColor)

  const handleSave = () => {
    onUpdate({
      enableNotifications: localEnableNotifications,
      notificationEmail: localNotificationEmail,
      primaryColor: localPrimaryColor,
      accentColor: localAccentColor,
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Configurações do Formulário</DialogTitle>
          <DialogDescription>
            Personalize notificações e aparência do formulário
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="theme" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="theme">Tema</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Cores do Formulário</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Personalize as cores do seu formulário público
                </p>
              </div>

              <ColorPicker
                label="Cor Principal"
                value={localPrimaryColor}
                onChange={setLocalPrimaryColor}
              />

              <ColorPicker
                label="Cor de Destaque"
                value={localAccentColor}
                onChange={setLocalAccentColor}
              />

              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <p className="text-xs font-medium mb-2">Preview</p>
                <div className="flex gap-2">
                  <div
                    className="h-10 flex-1 rounded"
                    style={{ backgroundColor: localPrimaryColor }}
                  />
                  <div
                    className="h-10 flex-1 rounded"
                    style={{ backgroundColor: localAccentColor }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 py-4">
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
          </TabsContent>
        </Tabs>

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
