"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, MapIcon, MessageSquare, Share2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMobile } from "@/hooks/use-mobile"
import TripMap from "@/components/trip-map"
import TripTimeline from "@/components/trip-timeline"
import { useSession } from "@/contexts/SessionContext"
import { AddActivityDialog } from "@/components/add-activity-dialog"
import { toast } from "sonner"

export default function TripDetailPage({ params }) {
  const tripId = use(params).id
  const session = useSession()
  const isMobile = useMobile()
  const [activeTab, setActiveTab] = useState("map")
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locations, setLocations] = useState({ currentLocations: [], plannedLocations: [] })
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
  const [newActivityLocation, setNewActivityLocation] = useState(null)

  // Fetch trip data
  useEffect(() => {
    if (!tripId) return

    fetch(`/api/trips/${tripId}`)
      .then(res => res.text())
      .then(text => {
        let data
        try {
          data = JSON.parse(text)
        } catch (e) {
          throw new Error("Failed to parse response")
        }
        setTrip(data)
        setLocations({
          currentLocations: data.currentLocations || [],
          plannedLocations: data.plannedLocations || []
        })
      })
      .catch(err => {
        console.error("Failed to fetch trip:", err)
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [tripId])

  // Add new location
  const addLocation = async (location, type) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location, type })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add location');
      }

      // Update local state
      setLocations(prev => ({
        ...prev,
        [type === 'current' ? 'currentLocations' : 'plannedLocations']: [
          ...prev[type === 'current' ? 'currentLocations' : 'plannedLocations'],
          data.location
        ]
      }));
    } catch (err) {
      console.error('Error adding location:', err);
      throw err;
    }
  };

  // Update all locations
  const updateLocations = async (newLocations) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/locations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLocations)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update locations');
      }

      // Update local state
      setLocations(newLocations);
    } catch (err) {
      console.error('Error updating locations:', err);
      throw err;
    }
  };

  const handleAddActivity = async (activityData) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: activityData.title,
          time: activityData.time,
          long: parseFloat(activityData.long),
          lat: parseFloat(activityData.lat),
          day: parseInt(activityData.day)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add activity');
      }

      const data = await response.json();
      
      // Update trip data with new activity, ensuring coordinates are numbers
      setTrip(prev => ({
        ...prev,
        activities: [...(prev.activities || []), {
          ...data,
          lat: parseFloat(data.lat),
          long: parseFloat(data.long),
          day: parseInt(data.day)
        }]
      }));

      toast.success('Activity added successfully');
      setIsAddActivityOpen(false);
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error(error.message || 'Failed to add activity');
    }
  };

  const handleUpdateActivity = async (activityId, updates) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/activities`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId,
          ...updates,
          long: updates.long ? parseFloat(updates.long) : undefined,
          lat: updates.lat ? parseFloat(updates.lat) : undefined,
          day: updates.day ? parseInt(updates.day) : undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update activity');
      }

      // Update trip data with updated activity
      setTrip(prev => ({
        ...prev,
        activities: prev.activities.map(activity =>
          activity.id === activityId ? {
            ...activity,
            ...updates,
            lat: updates.lat ? parseFloat(updates.lat) : activity.lat,
            long: updates.long ? parseFloat(updates.long) : activity.long,
            day: updates.day ? parseInt(updates.day) : activity.day
          } : activity
        )
      }));

      toast.success('Activity updated successfully');
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error(error.message || 'Failed to update activity');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/activities?activityId=${activityId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete activity');
      }

      // Remove activity from trip data
      setTrip(prev => ({
        ...prev,
        activities: prev.activities.filter(activity => activity.id !== activityId)
      }));

      toast.success('Activity deleted successfully');
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error(error.message || 'Failed to delete activity');
    }
  };

  const handleMapClick = (lat, long) => {
    setNewActivityLocation({ lat, long });
    setIsAddActivityOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading trip details...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-600">Error: {error}</div>;
  }

  if (!trip) {
    return <div className="flex items-center justify-center h-screen">Trip not found</div>;
  }

  const formatDateRange = (beginDate, endDate) =>
    `${new Date(beginDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/trips">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{trip.title}</h1>
              <p className="text-sm text-gray-500">{formatDateRange(trip.beginDate, trip.endDate)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-2 px-4 py-2 bg-white border-b">
            <TabsTrigger value="map" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600">
              <MapIcon className="h-4 w-4 mr-2" />
              Map
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600">
              <Calendar className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="flex-1 p-0 m-0 overflow-hidden">
            <TripTimeline 
              trip={trip} 
              onAddActivity={handleAddActivity}
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
            />
          </TabsContent>

          <TabsContent value="map" className="flex-1 p-0 m-0 overflow-hidden">
            <TripMap
              activities={trip.activities.map(act => ({
                id: act.id,
                name: act.title,
                coordinates: [act.long, act.lat],
                time: act.time,
                day: act.day
              }))}
              onMapClick={handleMapClick}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Activity Dialog (triggered via map click) */}
      <AddActivityDialog
        open={isAddActivityOpen}
        onOpenChange={setIsAddActivityOpen}
        onSubmit={handleAddActivity}
        initialLocation={newActivityLocation}
      />

      {/* Mobile Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab("map")}
            className={`flex flex-col items-center p-2 ${activeTab === "map" ? "text-emerald-600" : "text-gray-500"}`}
          >
            <MapIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Map</span>
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex flex-col items-center p-2 ${activeTab === "timeline" ? "text-emerald-600" : "text-gray-500"}`}
          >
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Timeline</span>
          </button>
        </div>
      </div>
    </div>
  )
}
