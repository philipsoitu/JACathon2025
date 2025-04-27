import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
  // Get the user ID from the session
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const db = await getDb();
  
  // Query for trips where user is either owner or participant
  const trips = await db
    .collection('trips')
    .find({
      $or: [
        { owner: userId },
        { participants: userId }
      ]
    })
    .sort({ createdAt: -1 }) // Sort by newest first
    .toArray();

  return NextResponse.json(trips);
}

export async function POST(request) {
  try {
    const tripData = await request.json();
    
    // Validate required fields
    if (!tripData.title || !tripData.beginDate || !tripData.endDate || !tripData.owner) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    
    // Create trip with empty activities array
    const trip = {
      ...tripData,
      activities: [],
      currentLocations: [],
      plannedLocations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('trips').insertOne(trip);
    
    return NextResponse.json({ ...trip, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
} 