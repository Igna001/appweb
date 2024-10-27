'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  })

  return (
    <div className="space-y-8">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Datos del usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" placeholder="Tu nombre" />
            </div>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="tu@email.com" />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" type="tel" placeholder="+56 9 1234 5678" />
            </div>
            <Button className="bg-[#1E2A47] text-white hover:bg-[#2D3B55]">Guardar cambios</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Notificaciones por correo</Label>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications">Notificaciones por SMS</Label>
              <Switch
                id="sms-notifications"
                checked={notifications.sms}
                onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Notificaciones push</Label>
              <Switch
                id="push-notifications"
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Alertas de clima</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="frost-threshold">Umbral de alerta de helada (°C)</Label>
              <Input id="frost-threshold" type="number" placeholder="0" />
            </div>
            <div>
              <Label htmlFor="heat-threshold">Umbral de alerta de calor extremo (°C)</Label>
              <Input id="heat-threshold" type="number" placeholder="35" />
            </div>
            <Button className="bg-[#1E2A47] text-white hover:bg-[#2D3B55]">Guardar configuración</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}