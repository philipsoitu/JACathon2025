import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Get all locations for a trip
export async function GET(request, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Missing trip ID' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const trip = await db
      .collection('trips')
      .findOne(
        { _id: new ObjectId(id) },
        { projection: { currentLocations: 1, plannedLocations: 1 } }
      );

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({
      currentLocations: trip.currentLocations || [],
      plannedLocations: trip.plannedLocations || []
    });
  } catch (error) {
    if (error.message.includes('ObjectId')) {
      return NextResponse.json({ error: 'Invalid trip ID format' }, { status: 400 });
    }
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update locations for a trip
export async function PUT(request, { params }) {
  const { id } = params;
  
  if (!id) {
    return NextResponse.json({ error: 'Missing trip ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { currentLocations, plannedLocations } = body;

    // Validate location arrays
    if (!Array.isArray(currentLocations) || !Array.isArray(plannedLocations)) {
      return NextResponse.json({ error: 'Invalid location arrays' }, { status: 400 });
    }

    // Validate each location object
    const validateLocation = (location) => {
      return (
        location &&
        typeof location.name === 'string' &&
        typeof location.latitude === 'number' &&
        typeof location.longitude === 'number' &&
        !isNaN(new Date(location.startDate)) &&
        !isNaN(new Date(location.endDate))
      );
    };

    if (!currentLocations.every(validateLocation) || !plannedLocations.every(validateLocation)) {
      return NextResponse.json({ 
        error: 'Invalid location format. Each location must have: name, latitude, longitude, startDate, and endDate' 
      }, { status: 400 });
    }

    const db = await getDb();
    const result = await db
      .collection('trips')
      .updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            currentLocations,
            plannedLocations,
            updatedAt: new Date()
          } 
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Locations updated successfully',
      currentLocations,
      plannedLocations
    });
  } catch (error) {
    if (error.message.includes('ObjectId')) {
      return NextResponse.json({ error: 'Invalid trip ID format' }, { status: 400 });
    }
    console.error('Error updating locations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add a single location to either current or planned locations
export async function POST(request, { params }) {
  const { id } = params;
  
  if (!id) {
    return NextResponse.json({ error: 'Missing trip ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { location, type } = body;

    if (!location || !type) {
      return NextResponse.json({ error: 'Missing location or type' }, { status: 400 });
    }

    if (type !== 'current' && type !== 'planned') {
      return NextResponse.json({ error: 'Invalid location type. Must be "current" or "planned"' }, { status: 400 });
    }

    // Validate location object
    if (
      !location.name ||
      typeof location.latitude !== 'number' ||
      typeof location.longitude !== 'number' ||
      !location.startDate ||
      !location.endDate
    ) {
      return NextResponse.json({ 
        error: 'Invalid location format. Must include: name, latitude, longitude, startDate, and endDate' 
      }, { status: 400 });
    }

    const arrayField = type === 'current' ? 'currentLocations' : 'plannedLocations';

    const db = await getDb();
    const result = await db
      .collection('trips')
      .updateOne(
        { _id: new ObjectId(id) },
        { 
          $push: { [arrayField]: location },
          $set: { updatedAt: new Date() }
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Location added successfully',
      location
    });
  } catch (error) {
    if (error.message.includes('ObjectId')) {
      return NextResponse.json({ error: 'Invalid trip ID format' }, { status: 400 });
    }
    console.error('Error adding location:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 