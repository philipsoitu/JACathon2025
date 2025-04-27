"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, MapIcon, MessageSquare, Share2, Plus, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMobile } from "@/hooks/use-mobile"
import TripMap from "@/components/trip-map"
import TripTimeline from "@/components/trip-timeline"

export default function TripDetailPage({ params }) {
  const tripId = use(params).id
  const isMobile = useMobile()
  const [activeTab, setActiveTab] = useState("timeline")
  const [isConnected, setIsConnected] = useState(false)

  // Simulate Socket.IO connection
  useEffect(() => {
    // In a real app, this would be a Socket.IO connection
    const timer = setTimeout(() => {
      setIsConnected(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Sample trip data
  const trip = {
    id: tripId,
    title: "North America Climbing Trip",
    dateRange: "May 15 - June 10, 2025",
    days: 27,
    participants: [
      { id: "1", name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "2", name: "Sam Wilson", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "3", name: "Taylor Kim", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "4", name: "Jordan Smith", avatar: "/placeholder.svg?height=40&width=40" },
    ],
    locations: [
      { id: "1", name: "Yosemite National Park", coordinates: [-119.5383, 37.8651] },
      { id: "2", name: "Joshua Tree National Park", coordinates: [-115.901, 33.8734] },
      { id: "3", name: "Red Rock Canyon", coordinates: [-115.4255, 36.1311] },
    ],
    activities: [
      {
        id: "1",
        day: 1,
        title: "Arrival at Yosemite",
        type: "travel",
        time: "10:00 AM - 12:00 PM",
        location: "Yosemite National Park",
        votes: 4,
        comments: 2,
      },
      {
        id: "2",
        day: 1,
        title: "Camp Setup",
        type: "accommodation",
        time: "12:30 PM - 2:00 PM",
        location: "Upper Pines Campground",
        votes: 3,
        comments: 1,
      },
      {
        id: "3",
        day: 1,
        title: "El Capitan Hike",
        type: "activity",
        time: "2:30 PM - 6:00 PM",
        location: "El Capitan",
        votes: 5,
        comments: 3,
      },
      {
        id: "4",
        day: 2,
        title: "Climbing at Half Dome",
        type: "activity",
        time: "8:00 AM - 4:00 PM",
        location: "Half Dome",
        votes: 5,
        comments: 2,
      },
      {
        id: "5",
        day: 3,
        title: "Travel to Joshua Tree",
        type: "travel",
        time: "9:00 AM - 3:00 PM",
        location: "Joshua Tree National Park",
        votes: 4,
        comments: 1,
      },
    ],
  }

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
              <p className="text-sm text-gray-500">{trip.dateRange}</p>
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

        {/* Connection status */}
        <div className="mt-2 flex items-center">
          <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-amber-500"}`}></div>
          <span className="text-xs text-gray-500">{isConnected ? "Connected - Live updates on" : "Connecting..."}</span>
        </div>

        {/* Participants */}
        <div className="mt-3 flex items-center">
          <div className="flex -space-x-2 mr-2">
            {trip.participants.slice(0, 3).map((participant) => (
              <Avatar key={participant.id} className="h-6 w-6 border-2 border-white">
                <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {trip.participants.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                +{trip.participants.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">{trip.participants.length} participants</span>
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
            <TripMap trip={trip} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Action button */}
      <div className="fixed bottom-20 right-4 z-10">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-6 w-6" />
        </Button>
      </div>

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
