"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, MapIcon, MessageSquare, Share2, Plus, MoreHorizontal } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState("timeline")
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locations, setLocations] = useState({ currentLocations: [], plannedLocations: [] })
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)

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
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        throw new Error('Failed to add activity');
      }

      const data = await response.json();
      
      // Update trip data with new activity
      setTrip(prev => ({
        ...prev,
        activities: [...(prev.activities || []), data]
      }));

      toast.success('Activity added successfully');
      setIsAddActivityOpen(false);
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add activity');
    }
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

  const formatDateRange = (beginDate, endDate) => {
    return `${new Date(beginDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
  };

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
        <Tabs defaultValue="timeline" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-2 px-4 py-2 bg-white border-b">
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600">
              <MapIcon className="h-4 w-4 mr-2" />
              Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="flex-1 p-0 m-0 overflow-hidden">
            <TripTimeline trip={trip} />
          </TabsContent>

          <TabsContent value="map" className="flex-1 p-0 m-0 overflow-hidden">
            <TripMap 
              trip={{
                ...trip,
                locations: [
                  ...locations.currentLocations.map(loc => ({
                    id: loc.name,
                    name: loc.name,
                    coordinates: [loc.longitude, loc.latitude],
                    startDate: loc.startDate,
                    endDate: loc.endDate,
                    type: 'current'
                  })),
                  ...locations.plannedLocations.map(loc => ({
                    id: loc.name,
                    name: loc.name,
                    coordinates: [loc.longitude, loc.latitude],
                    startDate: loc.startDate,
                    endDate: loc.endDate,
                    type: 'planned'
                  }))
                ]
              }}
              onAddLocation={addLocation}
              onUpdateLocations={updateLocations}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Action button */}
      <div className="fixed bottom-20 right-4 z-10">
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setIsAddActivityOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <AddActivityDialog
        open={isAddActivityOpen}
        onOpenChange={setIsAddActivityOpen}
        onSubmit={handleAddActivity}
      />

      {/* Mobile Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex flex-col items-center p-2 ${activeTab === "timeline" ? "text-emerald-600" : "text-gray-500"}`}
          >
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`flex flex-col items-center p-2 ${activeTab === "map" ? "text-emerald-600" : "text-gray-500"}`}
          >
            <MapIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Map</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-500">
            <MessageSquare className="h-6 w-6" />
            <span className="text-xs mt-1">Chat</span>
          </button>
        </div>
      </div>
    </div>
  )
}
