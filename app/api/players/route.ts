import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { players } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allPlayers = await db.select().from(players)
    return NextResponse.json(allPlayers)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const newPlayer = await db.insert(players).values({
      name: name.trim(),
    }).returning()

    return NextResponse.json(newPlayer[0], { status: 201 })
  } catch (error) {
    console.error('Error creating player:', error)
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json({ error: 'Player name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('id')

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
    }

    await db.delete(players).where(eq(players.id, playerId))
    return NextResponse.json({ message: 'Player deleted successfully' })
  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 