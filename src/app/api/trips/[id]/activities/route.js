import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request, context) {
  const params = await context.params;
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: 'Missing trip ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, type, time, location, day } = body;

    // Validate required fields
    if (!title || !type || !time || !location || !day) {
      return NextResponse.json({ 
        error: 'Missing required fields. Need: title, type, time, location, day' 
      }, { status: 400 });
    }

    const activity = {
      id: new ObjectId().toString(), // Generate a unique ID for the activity
      title,
      type,
      time,
      location,
      day,
      votes: 0,
      comments: 0,
      createdAt: new Date()
    };

    const db = await getDb();
    const result = await db
      .collection('trips')
      .updateOne(
        { _id: new ObjectId(id) },
        { 
          $push: { activities: activity },
          $set: { updatedAt: new Date() }
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Activity added successfully',
      activity 
    });
  } catch (error) {
    if (error.message.includes('ObjectId')) {
      return NextResponse.json({ error: 'Invalid trip ID format' }, { status: 400 });
    }
    
    console.error('Error adding activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 