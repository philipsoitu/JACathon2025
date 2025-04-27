import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request) {
  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }
  if (!body.description) {
    return NextResponse.json({ error: 'Missing description' }, { status: 400 });
  }
  if (!body.beginDate || !body.endDate) {
    return NextResponse.json({ error: 'Missing one or more dates' }, { status: 400 });
  }
  if (!body.owner) {
    return NextResponse.json({ error: 'Missing auth' }, { status: 400 });
  }

  const db = await getDb();
  const result = await db
    .collection('trips')
    .insertOne({ 
      title: body.title,
      description: body.description,
      beginDate: body.beginDate,
      endDate: body.endDate,
      createdAt: new Date(),
      owner: body.owner
    });

  return NextResponse.json(result);
}
