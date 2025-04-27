import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';

// Add a new activity to a trip
export async function POST(request, { params }) {
  try {
    const db = await getDb();
    const { id } = params;
    const activity = await request.json();

    // Add default values for votes and comments if not provided
    activity.votes = activity.votes || 0;
    activity.comments = activity.comments || 0;
    activity.createdAt = new Date();
    activity.id = new ObjectId().toString();

    const result = await db.collection('trips').updateOne(
      { _id: new ObjectId(id) },
      { $push: { activities: activity } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Trip not found or activity not added' },
        { status: 404 }
      );
    }

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error adding activity:', error);
    return NextResponse.json(
      { error: 'Failed to add activity' },
      { status: 500 }
    );
  }
}

// Update an existing activity
export async function PUT(request, { params }) {
  try {
    const db = await getDb();
    const { id } = params;
    const { activityId, ...updates } = await request.json();

    const result = await db.collection('trips').updateOne(
      { 
        _id: new ObjectId(id),
        'activities.id': activityId
      },
      { 
        $set: {
          'activities.$': {
            ...updates,
            id: activityId
          }
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Trip or activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Activity updated successfully' });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}

// Delete an activity
export async function DELETE(request, { params }) {
  try {
    const db = await getDb();
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');

    if (!activityId) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }

    const result = await db.collection('trips').updateOne(
      { _id: new ObjectId(id) },
      { $pull: { activities: { id: activityId } } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Trip or activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
} 