import Link from "next/link"
import { Plus, Search, Filter, Calendar, Map, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import TripCard from "@/components/trip-card"

export default function TripsPage() {
  // Sample trip data
  const trips = [
    {
      id: "1",
      title: "North America Climbing Trip",
      dateRange: "May 15 - June 10, 2025",
      participants: 4,
      locations: ["Yosemite", "Joshua Tree", "Red Rocks"],
      image: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "2",
      title: "European Backpacking",
      dateRange: "July 5 - July 25, 2025",
      participants: 3,
      locations: ["Paris", "Barcelona", "Rome"],
      image: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "3",
      title: "Weekend Camping",
      dateRange: "August 12 - August 14, 2025",
      participants: 6,
      locations: ["Big Sur"],
      image: "/placeholder.svg?height=100&width=200",
    },
  ]

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
              JS
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
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
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
