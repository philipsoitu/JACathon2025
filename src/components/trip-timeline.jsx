"use client"

import { useState, useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, MapPin, Clock, ThumbsUpIcon, MessageSquare, Plane, Home, MountainIcon as Hiking, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, addDays } from "date-fns"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Note: In a real application, you would use an environment variable for this
mapboxgl.accessToken = "pk.eyJ1IjoiZHJwaGlsNTA0MyIsImEiOiJjbTl5eXp5bjUxb25jMmtvcHl4Y2xlZ29zIn0.M1LN3ZUwUkCl9jamss9Oxg"

export default function TripTimeline({ trip }) {
  const [votedActivities, setVotedActivities] = useState([])
  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [newActivity, setNewActivity] = useState({
    title: "",
    type: "activity",
    time: "",
    location: "",
    longitude: null,
    latitude: null,
    day: 1
  })
  const [error, setError] = useState(null)
  const mapContainer = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)

  // Calculate total days in trip
  const tripStart = new Date(trip.beginDate)
  const tripEnd = new Date(trip.endDate)
  const totalDays = Math.ceil((tripEnd - tripStart) / (1000 * 60 * 60 * 24))

  useEffect(() => {
    if (!mapContainer.current || !isAddingActivity) return;

    try {
      // Always remove existing map before creating a new one
      if (map.current) {
        map.current.remove();
        map.current = null;
      }

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [-98.5795, 39.8283], // Default to US center
        zoom: 4,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

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
        
        setNewActivity(prev => ({
          ...prev,
          longitude: lng,
          latitude: lat
        }));

        // Reverse geocode
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`, {
          headers: {
            'Origin': window.location.origin
          }
        })
          .then(response => response.json())
          .then(data => {
            if (data.features && data.features.length > 0) {
              setNewActivity(prev => ({
                ...prev,
                location: data.features[0].place_name
              }));
            }
          })
          .catch(err => {
            console.error('Error reverse geocoding:', err);
          });
      });

      // Force map resize after render
      setTimeout(() => {
        map.current.resize();
      }, 100);

    } catch (err) {
      console.error("Error initializing map:", err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
    };
  }, [isAddingActivity]);

  // Group activities by day (handle undefined activities)
  const activitiesByDay = (trip.activities || []).reduce((acc, activity) => {
    if (!acc[activity.day]) {
      acc[activity.day] = []
    }
    acc[activity.day].push(activity)
    return acc
  }, {})

  const handleVote = (activityId) => {
    setVotedActivities((prev) => {
      if (prev.includes(activityId)) {
        return prev.filter((id) => id !== activityId)
      } else {
        return [...prev, activityId]
      }
    })
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "travel":
        return <Plane className="h-5 w-5 text-blue-600" />
      case "accommodation":
        return <Home className="h-5 w-5 text-amber-600" />
      case "activity":
        return <Hiking className="h-5 w-5 text-emerald-600" />
      default:
        return <Calendar className="h-5 w-5 text-gray-600" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case "travel":
        return "bg-blue-100"
      case "accommodation":
        return "bg-amber-100"
      case "activity":
        return "bg-emerald-100"
      default:
        return "bg-gray-100"
    }
  }

  // If there are no activities, show a placeholder
  if (!trip.activities || trip.activities.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-gray-50 rounded-full p-3 mb-4">
          <Calendar className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Yet</h3>
        <p className="text-sm text-gray-500 mb-4">
          Start planning your trip by adding some activities to your timeline.
        </p>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {Object.keys(activitiesByDay).map((day) => (
          <div key={day} className="space-y-3">
            <div className="sticky top-0 bg-gray-50 py-2 px-3 rounded-md">
              <h3 className="font-medium text-gray-700">
                Day {day} -{" "}
                {new Date(new Date(trip.beginDate).getTime() + (Number.parseInt(day) - 1) * 24 * 60 * 60 * 1000)
                  .toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
              </h3>
            </div>
            <div className="space-y-3">
              {activitiesByDay[Number.parseInt(day)].map((activity) => (
                <div key={activity.id} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          {activity.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          {activity.location}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-2 text-xs ${votedActivities.includes(activity.id) ? "text-emerald-600" : "text-gray-500"}`}
                            onClick={() => handleVote(activity.id)}
                          >
                            <ThumbsUpIcon className="h-3.5 w-3.5 mr-1.5" />
                            {activity.votes + (votedActivities.includes(activity.id) ? 1 : 0)}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-gray-500">
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                            {activity.comments}
                          </Button>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
