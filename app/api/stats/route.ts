import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { games, gameParticipants, players } from '@/lib/schema'
import { sql, eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const playerStats = await db
      .select({
        id: players.id,
        name: players.name,
        totalGames: sql<number>`count(${gameParticipants.gameId})`,
        wins: sql<number>`sum(case 
          when (${gameParticipants.team} = 'red' and ${games.winningTeam} = 'red') 
            or (${gameParticipants.team} = 'blue' and ${games.winningTeam} = 'blue') 
          then 1 else 0 end)`,
        losses: sql<number>`sum(case 
          when (${gameParticipants.team} = 'red' and ${games.winningTeam} = 'blue') 
            or (${gameParticipants.team} = 'blue' and ${games.winningTeam} = 'red') 
          then 1 else 0 end)`,
        spymasterGames: sql<number>`sum(case when ${gameParticipants.isSpymaster} = true then 1 else 0 end)`,
        spymasterWins: sql<number>`sum(case 
          when ${gameParticipants.isSpymaster} = true 
            and ((${gameParticipants.team} = 'red' and ${games.winningTeam} = 'red') 
              or (${gameParticipants.team} = 'blue' and ${games.winningTeam} = 'blue'))
          then 1 else 0 end)`,
      })
      .from(players)
      .leftJoin(gameParticipants, eq(players.id, gameParticipants.playerId))
      .leftJoin(games, eq(gameParticipants.gameId, games.id))
      .groupBy(players.id, players.name)
      .orderBy(sql`sum(case 
        when (${gameParticipants.team} = 'red' and ${games.winningTeam} = 'red') 
          or (${gameParticipants.team} = 'blue' and ${games.winningTeam} = 'blue') 
        then 1 else 0 end) desc`)

    const formattedStats = playerStats.map(player => ({
      ...player,
      winRate: player.totalGames > 0 ? (player.wins / player.totalGames) * 100 : 0,
      spymasterWinRate: player.spymasterGames > 0 ? (player.spymasterWins / player.spymasterGames) * 100 : 0,
    }))

    const recentGames = await db.query.games.findMany({
      with: {
        redSpymaster: true,
        blueSpymaster: true,
        participants: {
          with: {
            player: true,
          },
        },
      },
      orderBy: sql`${games.playedAt} desc`,
      limit: 10,
    })

    return NextResponse.json({
      playerStats: formattedStats,
      recentGames,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 