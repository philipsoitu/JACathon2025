"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

// In prod, pull this from process.env
mapboxgl.accessToken = "pk.eyJ1IjoiZHJwaGlsNTA0MyIsImEiOiJjbTl5eXp5bjUxb25jMmtvcHl4Y2xlZ29zIn0.M1LN3ZUwUkCl9jamss9Oxg"

export function AddActivityDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData = null,
  initialLocation = null,
}) {
  const defaultForm = { title: "", time: "", lat: "", long: "", day: 1 }
  const [formData, setFormData] = useState(defaultForm)

  const mapContainer = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)

  // Populate form from initialData when dialog opens for editing
  useEffect(() => {
    if (open && initialData) {
      setFormData({
        title: initialData.title || "",
        time: initialData.time || "",
        lat: parseFloat(initialData.lat).toFixed(6) || "",
        long: parseFloat(initialData.long).toFixed(6) || "",
        day: initialData.day || 1,
      })
    }
  }, [open, initialData])

  // Populate coords/title from map‐click when adding a new activity
  useEffect(() => {
    if (initialLocation && !initialData) {
      setFormData((prev) => ({
        ...prev,
        lat: initialLocation.lat.toFixed(6),
        long: initialLocation.long.toFixed(6),
      }))
      // optionally fetch place name here…
    }
  }, [initialLocation, initialData])

  // Reset to blank when fully closed (so next "Add" is empty)
  useEffect(() => {
    if (!open) {
      setFormData(defaultForm)
    }
  }, [open])

  // Initialize & sync map + marker
  useEffect(() => {
    if (!mapContainer.current || !open) return

    // init once
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-73.567253, 45.501690],
        zoom: 11,
      })
      map.current.addControl(new mapboxgl.NavigationControl())
      map.current.on("click", (e) => {
        const { lng, lat } = e.lngLat
        // clear old marker
        if (marker.current) marker.current.remove()
        marker.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current)
        setFormData((prev) => ({
          ...prev,
          long: lng.toFixed(6),
          lat: lat.toFixed(6),
        }))
      })
    }

    // when editing, center on existing coords
    const hasCoords = formData.lat && formData.long
    if (hasCoords) {
      const coords = [parseFloat(formData.long), parseFloat(formData.lat)]
      if (marker.current) marker.current.remove()
      marker.current = new mapboxgl.Marker().setLngLat(coords).addTo(map.current)
      map.current.setCenter(coords)
    }

    return () => {
      // tear down map only once fully closed
      if (!open && map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [open, formData.lat, formData.long])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      title: formData.title,
      time: formData.time,
      lat: formData.lat,
      long: formData.long,
      day: formData.day,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Activity" : "Add New Activity"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            {/* Time */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">Time</Label>
              <Input
                id="time"
                value={formData.time}
                placeholder="e.g. 10:00"
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            {/* Day */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">Day</Label>
              <Input
                id="day"
                type="number"
                min="1"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
                className="col-span-3"
                required
              />
            </div>
            {/* Map picker */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Location</Label>
              <div className="col-span-3 space-y-2">
                <div ref={mapContainer} className="h-[200px] rounded-lg border" />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={formData.lat} placeholder="Latitude" readOnly />
                  <Input value={formData.long} placeholder="Longitude" readOnly />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!formData.lat || !formData.long}>
              {initialData ? "Save Changes" : "Add Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
