"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Button } from "@/components/ui/button"
import { MapPin, ZoomIn, ZoomOut, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePickerWithRange } from "@/components/date-range-picker"

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

export default function TripMap({ trip, onAddLocation, onUpdateLocations }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [error, setError] = useState(null)
  const [isAddingLocation, setIsAddingLocation] = useState(false)
  const [newLocation, setNewLocation] = useState({
    name: "",
    latitude: "",
    longitude: "",
    type: "planned",
    dateRange: { from: undefined, to: undefined }
  })

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

      // Add click handler for adding new locations
      map.current.on('click', (e) => {
        if (isAddingLocation) {
          setNewLocation(prev => ({
            ...prev,
            latitude: e.lngLat.lat.toFixed(6),
            longitude: e.lngLat.lng.toFixed(6)
          }));
        }
      });

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

  // Add markers when map is loaded or locations change
  useEffect(() => {
    if (!map.current) {
      console.log("Map not initialized yet")
      return
    }

    const addMarkers = () => {
      try {
        console.log("Adding markers for locations:", trip.locations)
        // Remove existing markers
        const markers = document.getElementsByClassName('mapboxgl-marker');
        while(markers[0]) {
          markers[0].remove();
        }

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
              <div class="absolute w-3 h-3 ${location.type === 'current' ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full"></div>
            </div>
          `

          // Add marker to map
          new mapboxgl.Marker(el)
            .setLngLat(location.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div class="p-2">
                  <h3 class="font-medium">${location.name}</h3>
                  <p class="text-sm text-gray-500">
                    ${new Date(location.startDate).toLocaleDateString()} - ${new Date(location.endDate).toLocaleDateString()}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    ${location.type === 'current' ? 'Current Location' : 'Planned Location'}
                  </p>
                </div>
              `)
            )
            .addTo(map.current)

          // Add location to bounds
          bounds.extend(location.coordinates)

          // Add click event
          el.addEventListener("click", () => {
            setSelectedLocation(location)
          })
        })

        // Fit map to bounds with padding if there are locations
        if (trip.locations.length > 0) {
          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 10,
          })
        }
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

  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude || !newLocation.dateRange.from || !newLocation.dateRange.to) {
      setError("Please fill in all location details");
      return;
    }

    try {
      await onAddLocation({
        name: newLocation.name,
        latitude: parseFloat(newLocation.latitude),
        longitude: parseFloat(newLocation.longitude),
        startDate: newLocation.dateRange.from.toISOString(),
        endDate: newLocation.dateRange.to.toISOString()
      }, newLocation.type);

      // Reset form
      setNewLocation({
        name: "",
        latitude: "",
        longitude: "",
        type: "planned",
        dateRange: { from: undefined, to: undefined }
      });
      setIsAddingLocation(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative h-full w-full">
      {error && (
        <div className="absolute top-4 left-4 right-4 z-20 bg-red-100 text-red-700 p-3 rounded-lg">
          Error: {error}
        </div>
      )}
      <div 
        ref={mapContainer} 
        className={`absolute inset-0 ${isAddingLocation ? 'cursor-crosshair' : 'cursor-default'}`}
        style={{ minHeight: "400px" }}
      />

      {/* Location list */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-md p-2 max-h-60 overflow-auto w-64">
          <div className="flex items-center justify-between px-2 py-1 border-b">
            <h3 className="font-medium text-gray-700">Locations</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setIsAddingLocation(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Location Name</Label>
                    <Input
                      value={newLocation.name}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter location name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input
                        value={newLocation.latitude}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, latitude: e.target.value }))}
                        placeholder="Click on map"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input
                        value={newLocation.longitude}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, longitude: e.target.value }))}
                        placeholder="Click on map"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={newLocation.type}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="current">Current Location</option>
                      <option value="planned">Planned Location</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <DatePickerWithRange
                      date={newLocation.dateRange}
                      setDate={(range) => setNewLocation(prev => ({ ...prev, dateRange: range }))}
                    />
                  </div>
                  <Button onClick={handleAddLocation} className="w-full">
                    Add Location
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ul className="mt-1">
            {trip.locations.map((location) => (
              <li key={location.id}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm h-auto py-2 ${selectedLocation?.id === location.id ? "bg-emerald-50 text-emerald-600" : ""}`}
                  onClick={() => {
                    setSelectedLocation(location)
                    map.current?.flyTo({
                      center: location.coordinates,
                      zoom: 12,
                      essential: true,
                    })
                  }}
                >
                  <MapPin className={`h-4 w-4 mr-2 ${location.type === 'current' ? 'text-emerald-500' : 'text-amber-500'}`} />
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
