"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut } from "lucide-react"

// Note: In a real application, you would use an environment variable for this
mapboxgl.accessToken = "pk.eyJ1IjoiZHJwaGlsNTA0MyIsImEiOiJjbTl5eXp5bjUxb25jMmtvcHl4Y2xlZ29zIn0.M1LN3ZUwUkCl9jamss9Oxg"

// Configure Mapbox to use transformRequest for CORS
const transformRequest = (url, resourceType) => {
  if (resourceType === 'Source' && url.startsWith('http')) {
    return {
      url,
      headers: {
        'Referer': window.location.origin,
        'Origin': window.location.origin
      }
    }
  }
  return { url }
}

export default function TripMap({ activities = [], onMapClick }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [error, setError] = useState(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) {
      console.error("Map container not found")
      return
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: activities[0]?.coordinates || [-73.567253, 45.501690], // default to Montreal
        zoom: 11,
        transformRequest
      })

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e)
        setError(e.error.message)
      })

      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right")

      map.current.on('click', (e) => {
        const { lat, lng } = e.lngLat
        onMapClick(lat, lng)
      })
    } catch (err) {
      console.error("Error initializing map:", err)
      setError(err.message)
    }

    return () => {
      if (map.current) map.current.remove()
    }
  }, [])

  // Render activity markers
  useEffect(() => {
    if (!map.current) return

    // Remove existing markers
    const oldMarkers = document.getElementsByClassName('mapboxgl-marker')
    while (oldMarkers[0]) {
      oldMarkers[0].remove()
    }

    if (activities.length === 0) return

    const bounds = new mapboxgl.LngLatBounds()

    activities.forEach((act) => {
      const el = document.createElement('div')
      el.className = 'w-6 h-6 bg-emerald-500 rounded-full border-2 border-white'

      new mapboxgl.Marker(el)
        .setLngLat(act.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-medium">${act.name}</h3>
              <p class="text-sm text-gray-500">
                Day ${act.day} • ${new Date(act.time).toLocaleTimeString()}
              </p>
            </div>
          `)
        )
        .addTo(map.current)

      bounds.extend(act.coordinates)

      el.addEventListener('click', () => onMapClick(act.coordinates[1], act.coordinates[0]))
    })

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 12
    })
  }, [activities])

  return (
    <div className="relative h-full w-full">
      {error && (
        <div className="absolute top-4 left-4 right-4 z-20 bg-red-100 text-red-700 p-3 rounded-lg">
          Error: {error}
        </div>
      )}

      <div
        ref={mapContainer}
        className="absolute inset-0"
        style={{ minHeight: '400px' }}
      />

      {/* Map controls */}
      <div className="absolute bottom-20 right-4 z-10 flex flex-col space-y-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full bg-white shadow-md"
          onClick={() => map.current?.zoomIn()}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full bg-white shadow-md"
          onClick={() => map.current?.zoomOut()}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
