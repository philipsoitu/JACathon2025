import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Missing trip ID' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const trip = await db
      .collection('trips')
      .findOne({ _id: new ObjectId(id) });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.message.includes('ObjectId')) {
      return NextResponse.json({ error: 'Invalid trip ID format' }, { status: 400 });
    }
    
    console.error('Error fetching trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 