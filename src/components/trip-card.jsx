import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function TripCard({ trip }) {
  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative h-32 w-full">
          <Image src={trip.image || "/placeholder.svg"} alt={trip.title} fill className="object-cover" />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg">{trip.title}</h3>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
              {trip.dateRange}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
              {trip.locations.join(", ")}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-2 text-emerald-500" />
              {trip.participants} participants
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
