"use client"

import Image from "next/image"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="flex justify-between items-center mb-12">
      
      <div className="text-center flex-1">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Image src="/favicon-32x32.png" alt="Codenames" width={48} height={48} />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Codenames Leaderboard</h1>
        </div>
        <p className="text-lg text-slate-400">Track your spy team performance and statistics</p>
      </div>

      <Button
        onClick={() => signOut()}
        variant="outline"
        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </header>
  )
} 