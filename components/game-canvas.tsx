"use client"

import { useEffect, useRef, useState } from "react"
import { Game } from "@/lib/game"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, SkipForward, Zap } from "lucide-react"

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Game | null>(null)
  const [gameState, setGameState] = useState<"menu" | "playing" | "paused" | "gameover" | "instructions">("menu")
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [weaponLevel, setWeaponLevel] = useState(1)
  const [shield, setShield] = useState(0)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 800 })

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setCanvasDimensions({ width, height })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    gameRef.current = new Game(canvas, ctx, {
      onScoreUpdate: setScore,
      onLevelUpdate: setLevel,
      onLivesUpdate: setLives,
      onWeaponLevelUpdate: setWeaponLevel,
      onShieldUpdate: setShield,
      onGameOver: () => setGameState("gameover"),
    })

    return () => {
      gameRef.current?.destroy()
    }
  }, [canvasDimensions])

  const handleStartGame = () => {
    setGameState("instructions")
  }

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setLevel(1)
    setLives(3)
    setWeaponLevel(1)
    setShield(0)
    gameRef.current?.start()
  }

  const togglePause = () => {
    if (gameState === "playing") {
      setGameState("paused")
      gameRef.current?.pause()
    } else if (gameState === "paused") {
      setGameState("playing")
      gameRef.current?.resume()
    }
  }

  const handleNextLevel = () => {
    gameRef.current?.nextLevel()
  }

  const handleRestartLevel = () => {
    gameRef.current?.restartLevel()
  }

  const handleSkipToBoss = () => {
    gameRef.current?.skipToBoss()
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && gameState !== "menu" && gameState !== "gameover" && gameState !== "instructions") {
        togglePause()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameState])

  return (
    <div ref={containerRef} className="w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          className="w-full h-full"
        />

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
          <div className="flex gap-2">
            {/* Score */}
            <div className="bg-black/90 border-2 border-cyan-400/60 px-2.5 py-1 rounded font-mono text-cyan-400 backdrop-blur-sm shadow-lg">
              <div className="text-[10px] opacity-60 leading-tight">SCORE</div>
              <div className="text-base font-bold leading-tight">{score.toString().padStart(8, "0")}</div>
            </div>

            {/* Level & Lives */}
            <div className="bg-black/90 border-2 border-cyan-400/60 px-2.5 py-1 rounded font-mono text-cyan-400 backdrop-blur-sm shadow-lg">
              <div className="text-[10px] opacity-60 leading-tight">LV {level}</div>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: lives }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-cyan-400 shadow-[0_0_4px_rgba(6,182,212,0.8)]"
                    style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Weapon */}
            <div className="bg-black/90 border-2 border-red-400/60 px-2.5 py-1 rounded font-mono text-red-400 backdrop-blur-sm shadow-lg">
              <div className="text-[10px] opacity-60 leading-tight">WPN</div>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-3.5 border border-red-400/50 ${
                      i < weaponLevel ? "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]" : "bg-black/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Shield */}
            <div className="bg-black/90 border-2 border-cyan-400/60 px-2.5 py-1 rounded font-mono text-cyan-400 backdrop-blur-sm shadow-lg">
              <div className="text-[10px] opacity-60 leading-tight">SHD</div>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-3.5 border border-cyan-400/50 ${
                      i < shield ? "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" : "bg-black/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Screen */}
        {gameState === "menu" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
            <h1
              className="text-6xl md:text-7xl font-bold text-cyan-400 mb-4 animate-pulse"
              style={{ textShadow: "0 0 20px rgba(6,182,212,0.8)" }}
            >
              CHICKEN INVADERS
            </h1>
            <p className="text-xl md:text-2xl text-cyan-300 mb-8">A Space Shooter Adventure</p>
            <button
              onClick={handleStartGame}
              className="px-8 py-4 bg-cyan-500 text-black font-bold text-xl rounded hover:bg-cyan-400 transition-colors pointer-events-auto"
              style={{ boxShadow: "0 0 20px rgba(6,182,212,0.6)" }}
            >
              START GAME
            </button>
          </div>
        )}

        {gameState === "instructions" && (
          <div className="absolute inset-0 flex flex-col items-center justify-start bg-black/95 overflow-y-auto p-4 md:p-8 pointer-events-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-6">GAME RULES & POWER-UPS</h2>

            <div className="max-w-2xl space-y-6 text-cyan-300 font-mono text-xs md:text-sm">
              <div>
                <h3 className="text-lg md:text-xl text-yellow-400 mb-2">OBJECTIVE</h3>
                <p>Defeat waves of chicken enemies and bosses! Every 3 levels, you'll face a boss.</p>
                <p>Destroy all enemies to advance to the next level!</p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl text-yellow-400 mb-2">CONTROLS</h3>
                <div className="bg-black/50 p-3 border border-cyan-500 space-y-1">
                  <p>
                    <span className="text-cyan-400">Desktop:</span> WASD / Arrow Keys to move
                  </p>
                  <p>
                    <span className="text-cyan-400">Shoot:</span> SPACE or Mouse Click
                  </p>
                  <p>
                    <span className="text-cyan-400">Mobile:</span> Touch to move (auto-shoot)
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-xl text-yellow-400 mb-2">POWER-UPS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-black/50 p-2 border border-red-500">
                    <span className="text-red-500">⚡ WEAPON</span> - Upgrade firepower (Max 5)
                  </div>
                  <div className="bg-black/50 p-2 border border-cyan-500">
                    <span className="text-cyan-500">🛡 SHIELD</span> - Add shield layer (Max 5)
                  </div>
                  <div className="bg-black/50 p-2 border border-green-500">
                    <span className="text-green-500">❤ HEALTH</span> - Gain extra life
                  </div>
                  <div className="bg-black/50 p-2 border border-orange-500">
                    <span className="text-orange-500">💣 EXPLOSIVE</span> - Bullets explode (10s)
                  </div>
                  <div className="bg-black/50 p-2 border border-yellow-500">
                    <span className="text-yellow-500">⭐ INVINCIBLE</span> - Immune to damage (8s)
                  </div>
                  <div className="bg-black/50 p-2 border border-yellow-500">
                    <span className="text-yellow-500">⚡ SPEED</span> - Move faster (10s)
                  </div>
                  <div className="bg-black/50 p-2 border border-red-500">
                    <span className="text-red-500">🔥 FIRE RATE</span> - Shoot faster (10s)
                  </div>
                  <div className="bg-black/50 p-2 border border-orange-500">
                    <span className="text-orange-500">✨ MULTIPLIER</span> - 2x score (15s)
                  </div>
                  <div className="bg-black/50 p-2 border border-purple-500">
                    <span className="text-purple-500">⏱ SLOW-MO</span> - Slow time (8s)
                  </div>
                  <div className="bg-black/50 p-2 border border-green-500">
                    <span className="text-green-500">🔫 LASER</span> - Continuous beam (12s)
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-xl text-yellow-400 mb-2">TIPS</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Bosses drop power-ups at 75%, 50%, and 25% health</li>
                  <li>Shield pieces orbit around you and block enemy bullets</li>
                  <li>Combine buffs for maximum effectiveness</li>
                  <li>Keep moving to avoid enemy fire</li>
                </ul>
              </div>
            </div>

            <button
              onClick={startGame}
              className="mt-8 px-8 py-4 bg-cyan-500 text-black font-bold text-xl rounded hover:bg-cyan-400 transition-colors"
            >
              CONTINUE
            </button>
          </div>
        )}

        {/* Pause Screen */}
        {gameState === "paused" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <h2 className="text-5xl font-bold text-cyan-400 mb-8 animate-pulse">PAUSED</h2>
            <button
              onClick={togglePause}
              className="px-8 py-4 bg-cyan-500 text-black font-bold text-xl rounded hover:bg-cyan-400 transition-colors pointer-events-auto"
            >
              RESUME
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
            <h2 className="text-5xl font-bold text-red-500 mb-4" style={{ textShadow: "0 0 20px rgba(239,68,68,0.8)" }}>
              GAME OVER
            </h2>
            <p className="text-3xl text-cyan-400 mb-2">Final Score</p>
            <p className="text-5xl font-bold text-yellow-400 mb-8">{score.toString().padStart(8, "0")}</p>
            <p className="text-xl text-cyan-300 mb-8">Reached Level {level}</p>
            <button
              onClick={handleStartGame}
              className="px-8 py-4 bg-cyan-500 text-black font-bold text-xl rounded hover:bg-cyan-400 transition-colors pointer-events-auto"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {gameState === "playing" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 flex-wrap justify-center pointer-events-auto">
          <Button
            onClick={togglePause}
            variant="outline"
            size="sm"
            className="bg-black/70 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono text-xs md:text-sm"
          >
            <Pause className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            Pause
          </Button>
          <Button
            onClick={handleRestartLevel}
            variant="outline"
            size="sm"
            className="bg-black/70 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black font-mono text-xs md:text-sm"
          >
            <RotateCcw className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            Restart
          </Button>
          <Button
            onClick={handleNextLevel}
            variant="outline"
            size="sm"
            className="bg-black/70 border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-mono text-xs md:text-sm"
          >
            <SkipForward className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            Next
          </Button>
          <Button
            onClick={handleSkipToBoss}
            variant="outline"
            size="sm"
            className="bg-black/70 border-red-500 text-red-400 hover:bg-red-500 hover:text-black font-mono text-xs md:text-sm"
          >
            <Zap className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            Boss
          </Button>
        </div>
      )}

      {gameState === "paused" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto">
          <Button
            onClick={togglePause}
            variant="outline"
            size="lg"
            className="bg-black/70 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono"
          >
            <Play className="mr-2 h-4 w-4" />
            Resume
          </Button>
          <Button
            onClick={handleStartGame}
            variant="outline"
            size="lg"
            className="bg-black/70 border-red-500 text-red-400 hover:bg-red-500 hover:text-black font-mono"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart Game
          </Button>
        </div>
      )}
    </div>
  )
}
