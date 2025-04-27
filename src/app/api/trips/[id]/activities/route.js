import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request, { params }) {
  try {
    const db = await getDb();
    const tripId = params.id;
    const activityData = await request.json();

    // Validate required fields
    if (!activityData.name || !activityData.latitude || !activityData.longitude || !activityData.dateOfVisit) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create activity object
    const activity = {
      name: activityData.name,
      location: {
        type: 'Point',
        coordinates: [parseFloat(activityData.longitude), parseFloat(activityData.latitude)]
      },
      dateOfVisit: new Date(activityData.dateOfVisit),
      gemeni: activityData.gemeni || false,
      createdAt: new Date()
    };

    // Update trip with new activity
    const result = await db.collection('trips').updateOne(
      { _id: new ObjectId(tripId) },
      { 
        $push: { activities: activity }
      }
    );

    if (result.modifiedCount === 0) {
      return Response.json({ error: 'Trip not found' }, { status: 404 });
    }

    return Response.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error adding activity:', error);
    return Response.json({ error: 'Failed to add activity' }, { status: 500 });
  }
} 