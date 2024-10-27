'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MapPin, Star, Trash2, Edit2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyADUwiTwvaIZ8pcKuPL8JhPGaXBUp2zJ2Y'

const mapContainerStyle = {
  width: '100%',
  height: '400px'
}

const defaultCenter = {
  lat: -33.4569, // Santiago, Chile
  lng: -70.6483
}

interface Favorito {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
}

export default function PaginaMapa() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  })

  const { toast } = useToast()

  const [,setMap] = useState<google.maps.Map | null>(null)
  const [centro, setCentro] = useState(defaultCenter)
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(defaultCenter)
  const [favoritos, setFavoritos] = useState<Favorito[]>([])
  const [editandoId, setEditandoId] = useState<number | null>(null)

  const [pais, setPais] = useState('')
  const [areaAdministrativa, setAreaAdministrativa] = useState('')
  const [localidad, setLocalidad] = useState('')

  const referenciaAutocompletado = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    const favoritosGuardados = localStorage.getItem('favoritos')
    if (favoritosGuardados) {
      setFavoritos(JSON.parse(favoritosGuardados))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('favoritos', JSON.stringify(favoritos))
  }, [favoritos])

  const alCargar = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const alDesmontar = useCallback(() => {
    setMap(null)
  }, [])

  const manejarClicMapa = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setUbicacionSeleccionada({ lat: e.latLng.lat(), lng: e.latLng.lng() })
      geocodificarLatLng(e.latLng)
    }
  }

  const geocodificarLatLng = (latLng: google.maps.LatLng) => {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        llenarComponentesDireccion(results[0].address_components)
      }
    })
  }

  const llenarComponentesDireccion = (componentes: google.maps.GeocoderAddressComponent[]) => {
    let nuevoPais = ''
    let nuevaAreaAdministrativa = ''
    let nuevaLocalidad = ''

    for (const componente of componentes) {
      const tipos = componente.types

      if (tipos.includes('country')) {
        nuevoPais = componente.long_name
      } else if (tipos.includes('administrative_area_level_1')) {
        nuevaAreaAdministrativa = componente.long_name
      } else if (tipos.includes('locality')) {
        nuevaLocalidad = componente.long_name
      }
    }

    setPais(nuevoPais)
    setAreaAdministrativa(nuevaAreaAdministrativa)
    setLocalidad(nuevaLocalidad)
  }

  const manejarSeleccionLugar = () => {
    const lugar = referenciaAutocompletado.current?.getPlace()
    if (lugar && lugar.geometry && lugar.geometry.location) {
      const lat = lugar.geometry.location.lat()
      const lng = lugar.geometry.location.lng()
      setUbicacionSeleccionada({ lat, lng })
      setCentro({ lat, lng })
      if (lugar.address_components) {
        llenarComponentesDireccion(lugar.address_components)
      }
    }
  }

  const manejarAgregarFavorito = () => {
    const nuevoFavorito: Favorito = {
      id: Date.now(),
      nombre: `${localidad}, ${areaAdministrativa}, ${pais}`,
      lat: ubicacionSeleccionada.lat,
      lng: ubicacionSeleccionada.lng
    }
    const nuevosFavoritos = [...favoritos, nuevoFavorito]
    setFavoritos(nuevosFavoritos)
    localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos))
    toast({
      title: "Favorito agregado",
      description: `Se ha agregado ${nuevoFavorito.nombre} a tus favoritos.`,
    })
  }

  const manejarEliminar = (id: number) => {
    const nuevosFavoritos = favoritos.filter(fav => fav.id !== id)
    setFavoritos(nuevosFavoritos)
    localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos))
    toast({
      title: "Favorito eliminado",
      description: "Se ha eliminado la ubicación de tus favoritos.",
      variant: "destructive",
    })
  }

  const manejarEditar = (id: number) => {
    setEditandoId(id)
  }

  const manejarGuardar = (id: number, nuevoNombre: string) => {
    const nuevosFavoritos = favoritos.map(fav => 
      fav.id === id ? { ...fav, nombre: nuevoNombre } : fav
    )
    setFavoritos(nuevosFavoritos)
    localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos))
    setEditandoId(null)
    toast({
      title: "Favorito actualizado",
      description: "Se ha actualizado el nombre del favorito.",
    })
  }

  useEffect(() => {
    if (isLoaded && window.google) {
      const autocompletado = new window.google.maps.places.Autocomplete(
        document.getElementById('input-ubicacion') as HTMLInputElement,
        { types: ['geocode'] }
      )
      referenciaAutocompletado.current = autocompletado
      autocompletado.addListener('place_changed', manejarSeleccionLugar)

      return () => {
        window.google.maps.event.clearInstanceListeners(autocompletado)
      }
    }
  }, [isLoaded])

  if (loadError) {
    return <div>Error al cargar los mapas: {loadError.message}</div>
  }

  if (!isLoaded) return <div>Cargando...</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Seleccione la ubicación de interés</h1>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                id="input-ubicacion"
                placeholder="Buscar ubicación"
              />
            </div>
            <Input placeholder="País" value={pais} readOnly />
            <Input placeholder="Región/Estado" value={areaAdministrativa} readOnly />
            <Input placeholder="Ciudad" value={localidad} readOnly />
          </div>
          <Button 
            onClick={manejarAgregarFavorito} 
            className="mt-4"
          >
            <Star className="mr-2 h-4 w-4" />
            Agregar a favoritos
          </Button>
        </CardContent>
      </Card>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <MapPin className="mr-2" />
          <span>Lat: {ubicacionSeleccionada.lat.toFixed(4)}, Lng: {ubicacionSeleccionada.lng.toFixed(4)}</span>
        </div>
      </div>
      <div className="h-[400px] rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={centro}
          zoom={10}
          onLoad={alCargar}
          onUnmount={alDesmontar}
          onClick={manejarClicMapa}
        >
          <Marker position={ubicacionSeleccionada} />
          {favoritos.map((fav) => (
            <Marker
              key={fav.id}
              position={{ lat: fav.lat, lng: fav.lng }}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
            />
          ))}
        </GoogleMap>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center">
            <Star className="mr-2 h-4 w-4" />
            Ver Favoritos
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Ubicaciones Favoritas</SheetTitle>
            <SheetDescription>
              Aquí puedes ver, editar o eliminar tus ubicaciones favoritas.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {favoritos.map((fav) => (
              <div key={fav.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                {editandoId === fav.id ? (
                  <Input 
                    defaultValue={fav.nombre}
                    onBlur={(e) => manejarGuardar(fav.id, e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        manejarGuardar(fav.id, (e.target as HTMLInputElement).value)
                      }
                    }}
                  />
                ) : (
                  <span>{fav.nombre}</span>
                )}
                <div>
                  <Button variant="ghost" size="sm" onClick={() => manejarEditar(fav.id)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => manejarEliminar(fav.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}