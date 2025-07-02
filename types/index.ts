export interface Player {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface PlayerStats {
  id: string
  name: string
  totalGames: number
  wins: number
  losses: number
  winRate: number
  spymasterGames: number
  spymasterWins: number
  spymasterWinRate: number
}

export interface GameParticipant {
  player: Player
  team: "red" | "blue"
  isSpymaster: boolean
}

export interface Game {
  id: string
  redTeamSpymaster: Player
  blueTeamSpymaster: Player
  winningTeam: "red" | "blue"
  playedAt: string
  notes?: string
  participants: GameParticipant[]
} 

export interface Player {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface PlayerStats {
  id: string
  name: string
  totalGames: number
  wins: number
  losses: number
  winRate: number
  spymasterGames: number
  spymasterWins: number
  spymasterWinRate: number
}

export interface Game {
  id: string
  redTeamSpymaster: Player
  blueTeamSpymaster: Player
  winningTeam: 'red' | 'blue'
  playedAt: string
  notes?: string
  participants: Array<{
    player: Player
    team: 'red' | 'blue'
    isSpymaster: boolean
  }>
}