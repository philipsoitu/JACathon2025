"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Button } from "@/components/ui/button"
import { MapPin, ZoomIn, ZoomOut } from "lucide-react"

// Note: In a real application, you would use an environment variable for this
// and not hardcode it in the client-side code
mapboxgl.accessToken = "pk.eyJ1IjoiZHJwaGlsNTA0MyIsImEiOiJjbTl5eXp5bjUxb25jMmtvcHl4Y2xlZ29zIn0.M1LN3ZUwUkCl9jamss9Oxg"

// Configure Mapbox to use transformRequest for CORS
const transformRequest = (url, resourceType) => {
  if (resourceType === 'Source' && url.startsWith('http')) {
    return {
      url: url,
      headers: {
        'Referer': window.location.origin,
        'Origin': window.location.origin
      }
    }
  }
  return { url }
}

export default function TripMap({ trip }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!mapContainer.current) {
      console.error("Map container not found")
      return
    }

    try {
      console.log("Initializing map with container:", mapContainer.current)
      console.log("Container dimensions:", mapContainer.current.offsetWidth, mapContainer.current.offsetHeight)

      // Initialize map with transformRequest
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: trip.locations[0]?.coordinates || [-98.5795, 39.8283], // Default to US center if no locations
        zoom: 5,
        transformRequest
      })

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError(e.error.message);
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right")

      console.log("Map initialized successfully")
    } catch (err) {
      console.error("Error initializing map:", err)
      setError(err.message)
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        console.log("Cleaning up map")
        map.current.remove()
      }
    }
  }, [])

  // Add markers when map is loaded
  useEffect(() => {
    if (!map.current) {
      console.log("Map not initialized yet")
      return
    }

    const addMarkers = () => {
      try {
        console.log("Adding markers for locations:", trip.locations)
        // Create bounds to fit all markers
        const bounds = new mapboxgl.LngLatBounds()

        // Add markers for each location
        trip.locations.forEach((location) => {
          // Create custom marker element
          const el = document.createElement("div")
          el.className = "flex items-center justify-center w-8 h-8"
          el.innerHTML = `
            <div class="absolute flex items-center justify-center w-8 h-8 cursor-pointer">
              <div class="absolute w-4 h-4 bg-white rounded-full"></div>
              <div class="absolute w-3 h-3 bg-emerald-500 rounded-full"></div>
            </div>
          `

          // Add marker to map
          new mapboxgl.Marker(el)
            .setLngLat(location.coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3 class="font-medium">${location.name}</h3>`))
            .addTo(map.current)

          // Add location to bounds
          bounds.extend(location.coordinates)

          // Add click event
          el.addEventListener("click", () => {
            setSelectedLocation(location)
          })
        })

        // Fit map to bounds with padding
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 10,
        })
      } catch (err) {
        console.error("Error adding markers:", err)
        setError(err.message)
      }
    }

    // If map is already loaded, add markers
    if (map.current.loaded()) {
      addMarkers()
    } else {
      // Otherwise wait for map to load
      map.current.on("load", addMarkers)
    }
  }, [trip.locations])

  const handleZoomIn = () => {
    map.current?.zoomIn()
  }

  const handleZoomOut = () => {
    map.current?.zoomOut()
  }

  const handleFlyToLocation = (location) => {
    map.current?.flyTo({
      center: location.coordinates,
      zoom: 12,
      essential: true,
    })
    setSelectedLocation(location)
  }

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
        style={{ minHeight: "400px" }}
      />

      {/* Location list */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-md p-2 max-h-60 overflow-auto w-64">
          <h3 className="font-medium text-gray-700 px-2 py-1 border-b">Locations</h3>
          <ul className="mt-1">
            {trip.locations.map((location) => (
              <li key={location.id}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm h-auto py-2 ${selectedLocation?.id === location.id ? "bg-emerald-50 text-emerald-600" : ""}`}
                  onClick={() => handleFlyToLocation(location)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {location.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute bottom-20 right-4 z-10 flex flex-col space-y-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full bg-white shadow-md"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full bg-white shadow-md"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
