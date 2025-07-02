"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Crown, Trash2, Users, ChevronDown, ChevronUp } from "lucide-react"
import { Player } from "@/types"

interface Props {
  teamPlayers: string[]
  players: Player[]
  spymaster: string
  teamColor: "red" | "blue"
  onSetSpymaster: (playerId: string) => void
  onRemoveFromTeam: (playerId: string) => void
  onAddToTeam: (playerId: string) => void
  getInitials: (name: string) => string
  availablePlayers: Player[]
}

export default function TeamMembersList({
  teamPlayers,
  players,
  spymaster,
  teamColor,
  onSetSpymaster,
  onRemoveFromTeam,
  onAddToTeam,
  getInitials,
  availablePlayers,
}: Props) {
  const [showTopIndicator, setShowTopIndicator] = useState(false)
  const [showBottomIndicator, setShowBottomIndicator] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const checkScrollIndicators = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    setShowTopIndicator(scrollTop > 0)
    setShowBottomIndicator(scrollTop + clientHeight < scrollHeight - 1)
  }

  useEffect(() => {
    checkScrollIndicators()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollIndicators)
      return () => container.removeEventListener("scroll", checkScrollIndicators)
    }
  }, [teamPlayers])

  const colorClasses = {
    red: {
      bg: "bg-red-600/10",
      border: "border-red-500/20",
      hover: "hover:bg-red-600/20",
      text: "text-red-400",
      avatar: "bg-red-700",
      indicator: "bg-red-500/80",
      scrollbar: "scrollbar-red",
      selectBg: "bg-red-950/30",
      selectBorder: "border-red-500/30",
      selectHover: "hover:bg-red-950/50",
    },
    blue: {
      bg: "bg-blue-600/10",
      border: "border-blue-500/20", 
      hover: "hover:bg-blue-600/20",
      text: "text-blue-400",
      avatar: "bg-blue-700",
      indicator: "bg-blue-500/80",
      scrollbar: "scrollbar-blue",
      selectBg: "bg-blue-950/30",
      selectBorder: "border-blue-500/30",
      selectHover: "hover:bg-blue-950/50",
    },
  }

  const colors = colorClasses[teamColor]

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-white">Team Members</label>
          <Badge variant="outline" className={`border-${teamColor}-500/50 text-${teamColor}-400`}>
            {teamPlayers.length} {teamPlayers.length === 1 ? 'Player' : 'Players'}
          </Badge>
        </div>

        <div className="relative">
          {showTopIndicator && (
            <div className={`absolute top-0 left-0 right-0 h-6 z-10 flex items-center justify-center rounded-t-lg`}>
              <ChevronUp className="w-4 h-4 text-white animate-pulse" onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}/>
            </div>
          )}

          <div
            ref={scrollContainerRef}
            className={`space-y-2 max-h-48 overflow-y-auto ${colors.scrollbar}`}
          >
            {teamPlayers.map((playerId) => {
              const player = players.find((p) => p.id === playerId)
              const isSpymaster = spymaster === playerId
              return player ? (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 ${colors.bg} ${colors.border} border rounded-lg ${colors.hover} transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={`${colors.avatar} text-white text-xs`}>
                        {getInitials(player.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white font-medium">{player.name}</span>
                    {isSpymaster && (
                      <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30 text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Spymaster
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isSpymaster && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSetSpymaster(player.id)}
                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-600/10 px-2"
                        title="Make Spymaster"
                      >
                        <Crown className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveFromTeam(player.id)}
                      className={`${colors.text} hover:text-${teamColor}-300 hover:bg-${teamColor}-600/10 px-2`}
                      title="Remove from team"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : null
            })}

            {teamPlayers.length === 0 && (
              <div className={`text-center py-8 text-${teamColor}-300/60 ${colors.border} border rounded-lg bg-${teamColor}-950/20`}>
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No players added yet</p>
              </div>
            )}
          </div>

            
          {showBottomIndicator && (
            <div className={`absolute bottom-0 left-0 right-0 h-6 z-10 flex items-center justify-center rounded-b-lg`}>
              <ChevronDown className="w-4 h-4 text-white animate-pulse" onClick={() => scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' })}/>
            </div>
          )}
        </div>

        <Select onValueChange={onAddToTeam}>
          <SelectTrigger className={`${colors.selectBg} ${colors.selectBorder} text-white ${colors.selectHover} transition-colors`}>
            <SelectValue placeholder="+ Add Player" />
          </SelectTrigger>
          <SelectContent>
            {availablePlayers.map(player => (
              <SelectItem key={player.id} value={player.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="bg-slate-700 text-white text-xs">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  {player.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
} 