"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function NewTripPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })
  const [locations, setLocations] = useState([])
  const [newLocation, setNewLocation] = useState("")

  const handleAddLocation = () => {
    if (newLocation.trim() !== "") {
      setLocations([...locations, newLocation.trim()])
      setNewLocation("")
    }
  }

  const handleRemoveLocation = (index) => {
    setLocations(locations.filter((_, i) => i !== index))
  }

  const handleCreateTrip = () => {
    // In a real app, this would save the trip to a database
    // For now, we'll just navigate back to the trips page
    router.push("/trips")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/trips">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-bold text-gray-900">Create New Trip</h1>
          </div>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleCreateTrip}
            disabled={!title || !dateRange.from || !dateRange.to || locations.length === 0}
          >
            Create
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <main className="p-4 max-w-md mx-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Trip Title</Label>
              <Input
                id="title"
                placeholder="e.g., North America Climbing Trip"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add some details about your trip..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>

            <div className="space-y-2">
              <Label>Locations</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddLocation()
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={handleAddLocation}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {locations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {locations.map((location, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-full pl-3 pr-2 py-1">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                      <span className="text-sm">{location}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-1"
                        onClick={() => handleRemoveLocation(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Invite Participants (Optional)</Label>
              <div className="flex space-x-2">
                <Input placeholder="Enter email address" />
                <Button type="button" variant="outline">
                  Invite
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">You can also share a link after creating the trip</p>
            </div>
          </div>
        </main>
      </ScrollArea>
    </div>
  )
}
