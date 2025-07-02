"use client"
import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Users, Plus, Trash2, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Header from "@/components/Header"
import PlayerRankings from "@/components/PlayerRankings"
import RecentGames from "@/components/RecentGames"
import TeamMembersList from "@/components/TeamMembersList"

interface Player {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

interface PlayerStats {
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

interface Game {
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

export default function CodenamesLeaderboard() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  
  const [players, setPlayers] = useState<Player[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [newPlayerName, setNewPlayerName] = useState("")
  const [loading, setLoading] = useState(false)
  
  
  const [redTeamPlayers, setRedTeamPlayers] = useState<string[]>([])
  const [blueTeamPlayers, setBlueTeamPlayers] = useState<string[]>([])
  const [redSpymaster, setRedSpymaster] = useState<string>("")
  const [blueSpymaster, setBlueSpymaster] = useState<string>("")
  const [gameNotes, setGameNotes] = useState("")

  
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn()
    }
  }, [status])


  useEffect(() => {
    if (session) {
      fetchPlayers()
      fetchStats()
    }
  }, [session])

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players')
      if (response.ok) {
        const data = await response.json()
        setPlayers(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch players",
        variant: "destructive",
      })
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setPlayerStats(data.playerStats)
        setGames(data.recentGames)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch statistics",
        variant: "destructive",
      })
    }
  }

  const addPlayer = async () => {
    if (!newPlayerName.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlayerName.trim() }),
      })
      
      if (response.ok) {
        await fetchPlayers()
        setNewPlayerName("")
        toast({
          title: "Success",
          description: "Player added successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to add player",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add player",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removePlayer = async (playerId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/players?id=${playerId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchPlayers()
        await fetchStats()
        toast({
          title: "Success",
          description: "Player removed successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove player",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addToTeam = (playerId: string, team: 'red' | 'blue') => {
    if (team === 'red') {
      setRedTeamPlayers([...redTeamPlayers, playerId])
    } else {
      setBlueTeamPlayers([...blueTeamPlayers, playerId])
    }
  }

  const removeFromTeam = (playerId: string, team: 'red' | 'blue') => {
    if (team === 'red') {
      setRedTeamPlayers(redTeamPlayers.filter(id => id !== playerId))
      if (redSpymaster === playerId) setRedSpymaster("")
    } else {
      setBlueTeamPlayers(blueTeamPlayers.filter(id => id !== playerId))
      if (blueSpymaster === playerId) setBlueSpymaster("")
    }
  }

  const recordGame = async (winningTeam: 'red' | 'blue') => {
    if (!redSpymaster || !blueSpymaster || redTeamPlayers.length === 0 || blueTeamPlayers.length === 0) {
      toast({
        title: "Error",
        description: "Please select spymasters and team members for both teams",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redTeamSpymaster: redSpymaster,
          blueTeamSpymaster: blueSpymaster,
          winningTeam,
          redTeamPlayers,
          blueTeamPlayers,
          notes: gameNotes.trim() || undefined,
        }),
      })
      
      if (response.ok) {
        
        setRedTeamPlayers([])
        setBlueTeamPlayers([])
        setRedSpymaster("")
        setBlueSpymaster("")
        setGameNotes("")
        
        
        await fetchStats()
        toast({
          title: "Success",
          description: `Game recorded! ${winningTeam === 'red' ? 'Red' : 'Blue'} team wins!`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to record game",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record game",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getAvailablePlayers = () => {
    const assignedPlayerIds = [...redTeamPlayers, ...blueTeamPlayers]
    return players.filter(player => !assignedPlayerIds.includes(player.id))
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null 
  }

  return (
    <div className="min-h-screen relative">
      <Image src="/codenames-bg.png" alt="Codenames Background" width={48} height={48} className="absolute top-0 left-0 w-full h-full object-cover opacity-70" />
      <div className="relative z-10 container mx-auto px-6 py-8">
        
        <Header />

        <Tabs defaultValue="leaderboard" className="w-full max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50">
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600/20 data-[state=active]:to-blue-600/20 data-[state=active]:text-white"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="game" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600/20 data-[state=active]:to-blue-600/20 data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-2" />
              New Game
            </TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600/20 data-[state=active]:to-blue-600/20 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Manage Players
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <div className="grid gap-6 lg:grid-cols-2">
              <PlayerRankings playerStats={playerStats} />
              <RecentGames games={games} />
            </div>
          </TabsContent>

          <TabsContent value="game">
            <Card className="relative bg-slate-900/80 backdrop-blur-sm max-w-6xl mx-auto overflow-hidden">
                
              <div
                className="absolute inset-0 bg-cover bg-center opacity-50 pointer-events-none select-none"
                style={{ backgroundImage: "url('/split-teams.webp')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-slate-900/60 to-blue-950/40 pointer-events-none" />

              <CardHeader className="relative z-10 text-center ">
                <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                  <Target className="w-6 h-6 text-red-400" />
                  Record New Game
                  <Target className="w-6 h-6 text-blue-400" />
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 p-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  
                  <div className="p-6">
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <h3 className="text-xl font-bold text-red-400">Red Team</h3>
                    </div>
                    
                    
                    <TeamMembersList
                      teamPlayers={redTeamPlayers}
                      players={players}
                      spymaster={redSpymaster}
                      teamColor="red"
                      onSetSpymaster={setRedSpymaster}
                      onRemoveFromTeam={(playerId) => removeFromTeam(playerId, 'red')}
                      onAddToTeam={(playerId) => addToTeam(playerId, 'red')}
                      getInitials={getInitials}
                      availablePlayers={getAvailablePlayers()}
                    />
                  </div>

                  
                  <div className="p-6">
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <h3 className="text-xl font-bold text-blue-400">Blue Team</h3>
                    </div>
                    
                    
                    <TeamMembersList
                      teamPlayers={blueTeamPlayers}
                      players={players}
                      spymaster={blueSpymaster}
                      teamColor="blue"
                      onSetSpymaster={setBlueSpymaster}
                      onRemoveFromTeam={(playerId) => removeFromTeam(playerId, 'blue')}
                      onAddToTeam={(playerId) => addToTeam(playerId, 'blue')}
                      getInitials={getInitials}
                      availablePlayers={getAvailablePlayers()}
                    />
                  </div>
                </div>

                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Button
                    onClick={() => recordGame('red')}
                    disabled={loading || !redSpymaster || !blueSpymaster || redTeamPlayers.length === 0 || blueTeamPlayers.length === 0}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-red-500/25 transition-all transform hover:scale-105 disabled:transform-none disabled:opacity-50"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Red Team Victory
                  </Button>
                  
                  <div className="text-slate-400 text-sm font-medium">VS</div>
                  
                  <Button
                    onClick={() => recordGame('blue')}
                    disabled={loading || !redSpymaster || !blueSpymaster || redTeamPlayers.length === 0 || blueTeamPlayers.length === 0}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-blue-500/25 transition-all transform hover:scale-105 disabled:transform-none disabled:opacity-50"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Blue Team Victory
                  </Button>
                </div>
                
                
                <div className="flex justify-between gap-8 mt-6 px-8 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${redSpymaster ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-slate-300">Red Spymaster {redSpymaster ? 'Ready' : 'Needed'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${blueSpymaster ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-slate-300">Blue Spymaster {blueSpymaster ? 'Ready' : 'Needed'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="players">
            <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-400" />
                  Manage Players
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Add or remove players from your game group
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                          
                <div className="flex gap-2">
                  <Input
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Player name"
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                    onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                  />
                  <Button 
                    onClick={addPlayer} 
                    disabled={loading || !newPlayerName.trim()}
                    className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Player
                  </Button>
                </div>

                          
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-slate-700 text-white text-xs">
                            {getInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white">{player.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePlayer(player.id)}
                        disabled={loading}
                        className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {players.length === 0 && (
                    <div className="text-center py-8 text-white">
                      No players added yet. Add your first player above!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
