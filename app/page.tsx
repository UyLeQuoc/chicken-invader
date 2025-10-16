"use client"

import { GameCanvas } from "@/components/game-canvas"

export default function Home() {
  return (
    <main className="w-full h-screen bg-black overflow-hidden">
      <GameCanvas />
    </main>
  )
}
