"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Filter, Calendar, Map, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import TripCard from "@/components/trip-card"
import { useSession } from "@/contexts/SessionContext"

export default function TripsPage() {
  const session = useSession()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!session?.user?.sub) return

    fetch(`/api/trips?userId=${session.user.sub}`)
      .then(res => res.text())
      .then(text => {
        let data
        try {
          data = JSON.parse(text)
        } catch (e) {
          throw new Error("Failed to parse response")
        }
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format")
        }
        setTrips(data)
      })
      .catch(err => {
        console.error("Failed to fetch trips:", err)
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [session?.user?.sub])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            TripSync
          </Link>
          <Button size="icon" variant="ghost" className="rounded-full">
            <span className="sr-only">User menu</span>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-medium">
              {session?.user?.name?.[0] || "U"}
            </div>
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Trips</h1>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <Link href="/trips/new">
              <Plus className="h-4 w-4 mr-1" /> New Trip
            </Link>
          </Button>
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input type="search" placeholder="Search trips..." className="pl-8 bg-gray-50 border-gray-200" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading your trips...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error loading trips: {error}
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              You don't have any trips yet. Create one to get started!
            </div>
          ) : (
            trips.map((trip) => (
              <TripCard 
                key={trip._id} 
                trip={{
                  id: trip._id,
                  title: trip.title,
                  dateRange: `${new Date(trip.beginDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`,
                  participants: (trip.participants || []).length + 1, // +1 for owner, default to empty array if undefined
                  locations: trip.locations || [],
                  image: trip.image || "/placeholder.svg?height=100&width=200"
                }} 
              />
            ))
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2">
        <div className="flex justify-around">
          <Link href="/trips" className="flex flex-col items-center p-2 text-emerald-600">
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Trips</span>
          </Link>
          <Link href="/explore" className="flex flex-col items-center p-2 text-gray-500">
            <Map className="h-6 w-6" />
            <span className="text-xs mt-1">Explore</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center p-2 text-gray-500">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
