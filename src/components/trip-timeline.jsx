"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, MapPin, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, parseISO } from "date-fns"
import { AddActivityDialog } from "@/components/add-activity-dialog"

export default function TripTimeline({ trip }) {
  const [isAddingActivity, setIsAddingActivity] = useState(false)

  const handleAddActivity = async (activityData) => {
    try {
      const response = await fetch(`/api/trips/${trip._id}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        throw new Error('Failed to add activity');
      }

      // Refresh the page to show new activity
      window.location.reload();
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Failed to add activity');
    }
  };

  // Group activities by date
  const activitiesByDate = {};
  (trip.activities || []).forEach(activity => {
    if (!activity || !activity.dateOfVisit) {
      console.warn('Activity missing dateOfVisit:', activity);
      return; // Skip activities without dates
    }

    try {
      // Ensure we have a valid date string
      const dateStr = activity.dateOfVisit.split('T')[0]; // Get just the date part
      if (!activitiesByDate[dateStr]) {
        activitiesByDate[dateStr] = [];
      }
      activitiesByDate[dateStr].push(activity);
    } catch (error) {
      console.warn('Error processing activity:', activity, error);
    }
  });

  // Sort dates
  const sortedDates = Object.keys(activitiesByDate).sort((a, b) => 
    new Date(a) - new Date(b)
  );

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
        <Button 
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setIsAddingActivity(true)}
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
          {sortedDates.map((date) => (
            <div key={date} className="space-y-3">
              <div className="sticky top-0 bg-gray-50 py-2 px-3 rounded-md">
                <h3 className="font-medium text-gray-700">
                  {format(parseISO(date), "MMMM d, yyyy")}
                </h3>
              </div>
              <div className="space-y-3">
                {activitiesByDate[date].map((activity, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-medium text-gray-900">{activity.name}</h4>
                    <div className="mt-2 space-y-1">
                      {activity.location?.coordinates && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          {`${activity.location.coordinates[1].toFixed(4)}, ${activity.location.coordinates[0].toFixed(4)}`}
                        </div>
                      )}
                      {activity.dateOfVisit && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          {format(parseISO(activity.dateOfVisit), "h:mm a")}
                        </div>
                      )}
                    </div>
                    {activity.gemeni && (
                      <div className="mt-2">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          Gemeni Enabled
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="fixed bottom-20 right-4 z-10">
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setIsAddingActivity(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <AddActivityDialog
        open={isAddingActivity}
        onOpenChange={setIsAddingActivity}
        onSubmit={handleAddActivity}
      />
    </>
  )
}
