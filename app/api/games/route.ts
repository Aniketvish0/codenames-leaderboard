import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { games, gameParticipants } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allGames = await db.query.games.findMany({
      with: {
        redSpymaster: true,
        blueSpymaster: true,
        participants: {
          with: {
            player: true,
          },
        },
      },
      orderBy: [desc(games.playedAt)],
    })

    return NextResponse.json(allGames)
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      redTeamSpymaster, 
      blueTeamSpymaster, 
      winningTeam, 
      redTeamPlayers, 
      blueTeamPlayers,
    } = await request.json()

    if (!redTeamSpymaster || !blueTeamSpymaster || !winningTeam) {
      return NextResponse.json({ 
        error: 'Red team spymaster, blue team spymaster, and winning team are required' 
      }, { status: 400 })
    }

    if (!['red', 'blue'].includes(winningTeam)) {
      return NextResponse.json({ error: 'Winning team must be either "red" or "blue"' }, { status: 400 })
    }

    if (!redTeamPlayers?.length || !blueTeamPlayers?.length) {
      return NextResponse.json({ error: 'Both teams must have at least one player' }, { status: 400 })
    }

    const newGame = await db.insert(games).values({
      redTeamSpymaster,
      blueTeamSpymaster,
      winningTeam,
    }).returning()

    const gameId = newGame[0].id

    const participants = [
      ...redTeamPlayers.map((playerId: string) => ({
        gameId,
        playerId,
        team: 'red',
        isSpymaster: playerId === redTeamSpymaster,
      })),
      ...blueTeamPlayers.map((playerId: string) => ({
        gameId,
        playerId,
        team: 'blue',
        isSpymaster: playerId === blueTeamSpymaster,
      })),
    ]

    await db.insert(gameParticipants).values(participants)

    const completeGame = await db.query.games.findFirst({
      where: eq(games.id, gameId),
      with: {
        redSpymaster: true,
        blueSpymaster: true,
        participants: {
          with: {
            player: true,
          },
        },
      },
    })

    return NextResponse.json(completeGame, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 