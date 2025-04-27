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