"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Eye } from "lucide-react"
import { Game } from "@/types/leaderboard"

interface Props {
  games: Game[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function RecentGames({ games }: Props) {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-slate-400" />
          Recent Games
        </CardTitle>
        <CardDescription className="text-slate-400">Latest game results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {games.slice(0, 5).map((game) => (
            <div
              key={game.id}
              className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-slate-400">{formatDate(game.playedAt)}</div>
                <Badge
                  className={
                    game.winningTeam === "red"
                      ? "bg-red-600/20 text-red-400 border-red-500/30"
                      : "bg-blue-600/20 text-blue-400 border-blue-500/30"
                  }
                >
                  {game.winningTeam === "red" ? "Red" : "Blue"} Team Wins
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-red-400 font-medium mb-1">Red Team</div>
                  <div className="text-white text-xs mb-1">
                    Spymaster: {game.redTeamSpymaster.name}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {game.participants
                      .filter((p) => p.team === "red" && !p.isSpymaster)
                      .map((p) => p.player.name)
                      .join(", ")}
                  </div>
                </div>

                <div>
                  <div className="text-blue-400 font-medium mb-1">Blue Team</div>
                  <div className="text-white text-xs mb-1">
                    Spymaster: {game.blueTeamSpymaster.name}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {game.participants
                      .filter((p) => p.team === "blue" && !p.isSpymaster)
                      .map((p) => p.player.name)
                      .join(", ")}
                  </div>
                </div>
              </div>

              {game.notes && (
                <div className="mt-3 text-xs text-slate-400 italic border-t border-slate-700/50 pt-2">
                  {game.notes}
                </div>
              )}
            </div>
          ))}
          {games.length === 0 && (
            <div className="text-center py-8 text-slate-400">No games recorded yet</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 