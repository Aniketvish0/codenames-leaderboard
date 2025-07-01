"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Users, Plus, Trash2, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import CodenamesHeader from "@/components/Header"
import PlayerRankings from "@/components/PlayerRankings"
import RecentGames from "@/components/RecentGames"
import Image from "next/image"

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
        
        <CodenamesHeader />

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
            <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-slate-400" />
                  Record New Game
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Set up teams and record the game result
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                      Red Team
                    </h3>
                    
                    
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Spymaster</label>
                      <Select value={redSpymaster} onValueChange={setRedSpymaster}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select red spymaster" />
                        </SelectTrigger>
                        <SelectContent>
                          {redTeamPlayers.map(playerId => {
                            const player = players.find(p => p.id === playerId)
                            return player ? (
                              <SelectItem key={player.id} value={player.id}>
                                {player.name}
                              </SelectItem>
                            ) : null
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Team Members</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {redTeamPlayers.map(playerId => {
                          const player = players.find(p => p.id === playerId)
                          return player ? (
                            <div key={player.id} className="flex items-center justify-between p-2 bg-red-600/10 border border-red-500/30 rounded-lg">
                              <span className="text-white text-sm">{player.name}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromTeam(player.id, 'red')}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : null
                        })}
                      </div>
                      
                      <Select onValueChange={(playerId) => addToTeam(playerId, 'red')}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white mt-2">
                          <SelectValue placeholder="Add player to red team" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailablePlayers().map(player => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>


                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                      Blue Team
                    </h3>
                    
                    
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Spymaster</label>
                      <Select value={blueSpymaster} onValueChange={setBlueSpymaster}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select blue spymaster" />
                        </SelectTrigger>
                        <SelectContent>
                          {blueTeamPlayers.map(playerId => {
                            const player = players.find(p => p.id === playerId)
                            return player ? (
                              <SelectItem key={player.id} value={player.id}>
                                {player.name}
                              </SelectItem>
                            ) : null
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Team Members</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {blueTeamPlayers.map(playerId => {
                          const player = players.find(p => p.id === playerId)
                          return player ? (
                            <div key={player.id} className="flex items-center justify-between p-2 bg-blue-600/10 border border-blue-500/30 rounded-lg">
                              <span className="text-white text-sm">{player.name}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromTeam(player.id, 'blue')}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : null
                        })}
                      </div>
                      
                      <Select onValueChange={(playerId) => addToTeam(playerId, 'blue')}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white mt-2">
                          <SelectValue placeholder="Add player to blue team" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailablePlayers().map(player => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                
                <div className="flex gap-4 justify-center pt-4">
                  <Button
                    onClick={() => recordGame('red')}
                    disabled={loading || !redSpymaster || !blueSpymaster || redTeamPlayers.length === 0 || blueTeamPlayers.length === 0}
                    className="bg-red-600 hover:bg-red-700 text-white px-8"
                  >
                    Red Team Wins
                  </Button>
                  <Button
                    onClick={() => recordGame('blue')}
                    disabled={loading || !redSpymaster || !blueSpymaster || redTeamPlayers.length === 0 || blueTeamPlayers.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    Blue Team Wins
                  </Button>
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
                    <div className="text-center py-8 text-slate-400">
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
