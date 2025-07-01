"use client"

import { BarChart3, Crown } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PlayerStats } from "@/types/leaderboard"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface Props {
  playerStats: PlayerStats[]
}

export default function PlayerRankings({ playerStats }: Props) {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-slate-400" />
          Player Rankings
        </CardTitle>
        <CardDescription className="text-slate-400">
          Ranked by wins and win percentage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {playerStats.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-slate-400 font-mono text-sm w-6">#{index + 1}</div>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-slate-700 text-white text-sm">
                    {getInitials(player.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-white font-medium">{player.name}</div>
                  <div className="text-slate-400 text-sm">
                    {player.totalGames} games • {player.spymasterGames} as spymaster
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">
                  {player.wins}W / {player.losses}L
                </div>
                <div className="text-slate-400 text-sm">
                  {player.winRate.toFixed(1)}% win rate
                </div>
                {player.spymasterGames > 0 && (
                  <div className="text-yellow-400 text-xs flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    {player.spymasterWinRate.toFixed(1)}% as spy
                  </div>
                )}
              </div>
            </div>
          ))}
          {playerStats.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No games recorded yet. Start by adding players and recording your first game!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 