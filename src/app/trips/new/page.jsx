"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSession } from "@/contexts/SessionContext"

export default function NewTripPage() {
  const router = useRouter()
  const session = useSession()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)


  function handleCreateTrip() {
    if (!title || !dateRange.from || !dateRange.to) return
    if (!session?.user?.sub) {
      setError("You must be logged in to create a trip")
      return
    }

    setLoading(true)
    setError(null)

    fetch("/api/new-trip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        beginDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        owner: session.user.sub
      }),
    })
    // first get the raw text
    .then(function(res) {
      return res.text().then(function(text) {
        var data = {}
        if (text) {
          try {
            data = JSON.parse(text)
          } catch (e) {
            throw new Error("Invalid response from server")
          }
        }
        if (!res.ok) {
          throw new Error(data.error || ("Server error (" + res.status + ")"))
        }
        // success → navigate
        router.push("/trips")
      })
    })
    // catch any parse or network errors
    .catch(function(err) {
      setError(err.message)
      console.error("Create trip failed:", err)
    })
    // always run cleanup here instead of .finally()
    .then(function() {
      setLoading(false)
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/trips">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-bold">Create New Trip</h1>
          </div>

          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleCreateTrip}
            disabled={loading || !title || !dateRange.from || !dateRange.to}
          >
            {loading ? "Creating…" : "Create"}
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <main className="p-4 max-w-md mx-auto">
          {error && <p className="text-red-600">{error}</p>}

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Trip Title</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., North America Climbing Trip"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add some details about your trip..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange
                date={dateRange}
                setDate={setDateRange}
              />
            </div>
          </div>
        </main>
      </ScrollArea>
    </div>
  )
}
