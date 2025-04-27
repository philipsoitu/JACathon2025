"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, MapPin, Clock, Plus, MoreVertical, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddActivityDialog } from "@/components/add-activity-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function TripTimeline({ 
  trip,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity 
}) {
  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)

  // Group activities by day
  const activitiesByDay = {}
  ;(trip.activities || []).forEach(activity => {
    if (!activity || !activity.day) return
    if (!activitiesByDay[activity.day]) activitiesByDay[activity.day] = []
    activitiesByDay[activity.day].push(activity)
  })

  const sortedDays = Object.keys(activitiesByDay)
    .map(Number)
    .sort((a, b) => a - b)

  const handleEditActivity = (activity) => {
    setEditingActivity(activity)
    setIsAddingActivity(true)
  }

  const handleActivitySubmit = async (activityData) => {
    try {
      if (editingActivity) {
        await onUpdateActivity(editingActivity.id, activityData)
      } else {
        await onAddActivity(activityData)
      }
      setIsAddingActivity(false)
      setEditingActivity(null)
    } catch (error) {
      console.error('Error handling activity:', error)
    }
  }

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
        <Button 
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => {
            setEditingActivity(null)
            setIsAddingActivity(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          {sortedDays.map((day) => (
            <div key={day} className="space-y-3">
              <div className="sticky top-0 bg-gray-50 py-2 px-3 rounded-md">
                <h3 className="font-medium text-gray-700">Day {day}</h3>
              </div>
              <div className="space-y-3">
                {activitiesByDay[day].map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                            {`${parseFloat(activity.lat).toFixed(4)}, ${parseFloat(activity.long).toFixed(4)}`}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                            {activity.time}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDeleteActivity(activity.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <AddActivityDialog
        open={isAddingActivity}
        onOpenChange={(open) => {
          setIsAddingActivity(open)
          if (!open) setEditingActivity(null)
        }}
        onSubmit={handleActivitySubmit}
        initialData={editingActivity}
      />
    </>
  )
}
