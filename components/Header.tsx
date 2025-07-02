"use client"

import Image from "next/image"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="flex items-center mb-12 relative">
      <Button
        onClick={() => signOut()}
        variant="outline"
        className="border-red-500/30 text-slate-200 bg-red-400/10 hover:bg-red-500/30 absolute right-0"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>

      <div className="flex-1 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Image src="/favicon-32x32.png" alt="Codenames" width={48} height={48} />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Codenames Leaderboard</h1>
        </div>
        <p className="text-lg text-slate-400">No more arguing about who was the spymaster!</p>
      </div>
    </header>
  )
} 