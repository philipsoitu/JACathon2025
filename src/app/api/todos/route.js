import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
  const db = await getDb();
  const todos = await db.collection('todos').find({}).toArray();
  return NextResponse.json(todos);
}

export async function POST(request) {
  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }
  const db = await getDb();
  const result = await db
    .collection('todos')
    .insertOne({ title: body.title, createdAt: new Date() });
  return NextResponse.json(result);
}
