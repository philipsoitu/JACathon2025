"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, MapPin, Clock, ThumbsUpIcon, MessageSquare, Plane, Home, MountainIcon as Hiking, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TripTimeline({ trip }) {
  const [votedActivities, setVotedActivities] = useState([])

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
