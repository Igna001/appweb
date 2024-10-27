'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sun, Snowflake, Droplets, Wind, Thermometer, CalendarIcon, CloudRain } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, isSameDay, startOfDay } from "date-fns"
import { es } from 'date-fns/locale'
import { LucideIcon } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"

interface PropsTarjetaClima {
  icono: LucideIcon;
  titulo: string;
  valor: string;
  color?: string;
}

function TarjetaClima({ icono: Icono, titulo, valor, color }: PropsTarjetaClima) {
  return (
    <Card className={`${color || 'bg-white'} transition-all duration-300 hover:shadow-lg`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Icono className="h-8 w-8" />
          <div>
            <p className="font-semibold">{titulo}</p>
            <p className="text-2xl">{valor}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface Favorito {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
}

export default function PaginaPanel() {
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState('')
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date())
  const [favoritos, setFavoritos] = useState<Favorito[]>([])

  // Función para generar datos climáticos simulados
  const generarDatosClima = (fechaInicio: Date) => {
    return Array.from({ length: 5 }, (_, index) => {
      const fecha = addDays(fechaInicio, index)
      return {
        fecha,
        lluvia: `${Math.floor(Math.random() * 100)}%`,
        helada: ['Bajo', 'Medio', 'Alto'][Math.floor(Math.random() * 3)],
        calor: ['Bajo', 'Moderado', 'Alto', 'Extremo'][Math.floor(Math.random() * 4)]
      }
    })
  }

  const [datosClima, setDatosClima] = useState(generarDatosClima(startOfDay(new Date())))

  useEffect(() => {
    const favoritosGuardados = localStorage.getItem('favoritos')
    if (favoritosGuardados) {
      const favoritosParsed = JSON.parse(favoritosGuardados)
      setFavoritos(favoritosParsed)
      if (favoritosParsed.length > 0) {
        setUbicacionSeleccionada(favoritosParsed[0].nombre)
      }
    }
  }, [])

  const actualizarDatosClima = () => {
    setDatosClima(generarDatosClima(startOfDay(fechaSeleccionada)))
  }

  return (
    <div className="space-y-8">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Panel de Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <Select value={ubicacionSeleccionada} onValueChange={setUbicacionSeleccionada}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Selecciona una ubicación" />
              </SelectTrigger>
              <SelectContent>
                {favoritos.map((favorito) => (
                  <SelectItem key={favorito.id} value={favorito.nombre}>
                    {favorito.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(fechaSeleccionada, "PPP", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fechaSeleccionada}
                  onSelect={(date) => {
                    if (date) {
                      setFechaSeleccionada(date)
                      setDatosClima(generarDatosClima(startOfDay(date)))
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button className="bg-[#1E2A47] text-white hover:bg-[#2D3B55]" onClick={actualizarDatosClima}>
              Actualizar datos
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TarjetaClima icono={Thermometer} titulo="Temperatura" valor="20°C" />
            <TarjetaClima icono={Wind} titulo="Viento" valor="10 km/h" />
            <TarjetaClima icono={Droplets} titulo="Humedad" valor="65%" />
            <TarjetaClima icono={CloudRain} titulo="Probabilidad de lluvia" valor="20%" />
            <TarjetaClima icono={Snowflake} titulo="Riesgo de helada" valor="Bajo" color="bg-blue-100 text-blue-800" />
            <TarjetaClima icono={Sun} titulo="Riesgo de calor extremo" valor="Moderado" color="bg-orange-100 text-orange-800" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Pronóstico de 5 días</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {datosClima.map((dia, index) => (
              <Card 
                key={index} 
                className={`bg-white transition-all duration-300 hover:shadow-lg ${
                  isSameDay(dia.fecha, fechaSeleccionada) ? 'border-blue-500 border-2' : ''
                }`}
              >
                <CardContent className="p-4">
                  <p className="font-semibold text-lg">{format(dia.fecha, "EEEE d", { locale: es })}</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <CloudRain className="h-4 w-4 mr-2 text-blue-500" />
                      <p>Lluvia: {dia.lluvia}</p>
                    </div>
                    <div className="flex items-center">
                      <Snowflake className="h-4 w-4 mr-2 text-blue-300" />
                      <p>Helada: {dia.helada}</p>
                    </div>
                    <div className="flex items-center">
                      <Sun className="h-4 w-4 mr-2 text-orange-500" />
                      <p>Calor: {dia.calor}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}