import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Note: In a real application, you would use an environment variable for this
mapboxgl.accessToken = "pk.eyJ1IjoiZHJwaGlsNTA0MyIsImEiOiJjbTl5eXp5bjUxb25jMmtvcHl4Y2xlZ29zIn0.M1LN3ZUwUkCl9jamss9Oxg";

export function AddActivityDialog({ open, onOpenChange, onSubmit, initialLocation }) {
  const [formData, setFormData] = useState({
    title: "",
    time: "",
    long: "",
    lat: "",
    day: 1
  });

  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  // Update form when initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setFormData(prev => ({
        ...prev,
        lat: initialLocation.lat.toFixed(6),
        long: initialLocation.long.toFixed(6)
      }));

      // Fetch location name using reverse geocoding
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${initialLocation.long},${initialLocation.lat}.json?access_token=${mapboxgl.accessToken}`)
        .then(res => res.json())
        .then(data => {
          if (data.features && data.features[0]) {
            setFormData(prev => ({
              ...prev,
              title: data.features[0].place_name.split(',')[0] // Use first part of place name as title
            }));
          }
        })
        .catch(error => console.error('Error fetching location name:', error));
    }
  }, [initialLocation]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: "",
        time: "",
        long: "",
        lat: "",
        day: 1
      });
    }
  }, [open]);

  useEffect(() => {
    if (!mapContainer.current || !open) return;

    // Initialize map
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-73.567253, 45.501690], // Montreal
        zoom: 11
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl());

      // Add click handler
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        
        // Remove existing marker if any
        if (marker.current) {
          marker.current.remove();
        }
        
        // Add new marker
        marker.current = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map.current);
        
        setFormData(prev => ({
          ...prev,
          long: lng.toFixed(6),
          lat: lat.toFixed(6)
        }));
      });
    }

    // If we have initial coordinates, set the marker and center the map
    if (initialLocation?.long && initialLocation?.lat) {
      const coords = [initialLocation.long, initialLocation.lat];
      
      if (marker.current) {
        marker.current.remove();
      }
      
      marker.current = new mapboxgl.Marker()
        .setLngLat(coords)
        .addTo(map.current);
      
      map.current.setCenter(coords);
    }

    return () => {
      if (map.current && !open) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [open, initialLocation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                value={formData.time}
                placeholder="e.g. 10-12"
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">
                Day
              </Label>
              <Input
                id="day"
                type="number"
                min="1"
                value={formData.day}
                onChange={(e) =>
                  setFormData({ ...formData, day: parseInt(e.target.value) })
                }
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Location</Label>
              <div className="col-span-3 space-y-2">
                <div ref={mapContainer} className="h-[200px] rounded-lg border" />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={formData.lat}
                    placeholder="Latitude"
                    readOnly
                  />
                  <Input
                    value={formData.long}
                    placeholder="Longitude"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!formData.lat || !formData.long}>
              Add Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 