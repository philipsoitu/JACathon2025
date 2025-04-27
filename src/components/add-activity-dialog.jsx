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
import { Checkbox } from "@/components/ui/checkbox";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Note: In a real application, you would use an environment variable for this
mapboxgl.accessToken = "pk.eyJ1IjoiZHJwaGlsNTA0MyIsImEiOiJjbTl5eXp5bjUxb25jMmtvcHl4Y2xlZ29zIn0.M1LN3ZUwUkCl9jamss9Oxg";

export function AddActivityDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    dateOfVisit: "",
    gemeni: false,
  });

  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || !open) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-98.5795, 39.8283], // Center of US
      zoom: 3
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
        longitude: lng.toFixed(6),
        latitude: lat.toFixed(6)
      }));
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format the data for submission
    const submissionData = {
      name: formData.name,
      location: {
        type: 'Point',
        coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
      },
      dateOfVisit: new Date(formData.dateOfVisit).toISOString(),
      gemeni: formData.gemeni
    };

    onSubmit(submissionData);
    
    // Reset form
    setFormData({
      name: "",
      latitude: "",
      longitude: "",
      dateOfVisit: "",
      gemeni: false,
    });
    
    if (marker.current) {
      marker.current.remove();
    }
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
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateOfVisit" className="text-right">
                Date of Visit
              </Label>
              <Input
                id="dateOfVisit"
                type="datetime-local"
                value={formData.dateOfVisit}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfVisit: e.target.value })
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
                    value={formData.latitude}
                    placeholder="Latitude"
                    readOnly
                  />
                  <Input
                    value={formData.longitude}
                    placeholder="Longitude"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gemeni" className="text-right">
                Use Gemeni
              </Label>
              <div className="col-span-3">
                <Checkbox
                  id="gemeni"
                  checked={formData.gemeni}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, gemeni: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!formData.latitude || !formData.longitude}>Add Activity</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 