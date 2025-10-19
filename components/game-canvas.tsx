"use client"

import { useEffect, useRef, useState } from "react"
import { Game } from "@/lib/game"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, SkipForward, Zap } from "lucide-react"
import { getTopScores, submitScore, type LeaderboardEntry } from "@/lib/actions/leaderboard"

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Game | null>(null)
  const [gameState, setGameState] = useState<
    "menu" | "playing" | "paused" | "gameover" | "instructions" | "leaderboard-submit"
  >("menu")
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [weaponLevel, setWeaponLevel] = useState(1)
  const [shield, setShield] = useState(0)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 800 })
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [playerName, setPlayerName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [leaderboardAvailable, setLeaderboardAvailable] = useState(true)
  const [bossHealth, setBossHealth] = useState(0)
  const [bossMaxHealth, setBossMaxHealth] = useState(100)
  const [activeEffects, setActiveEffects] = useState<string[]>([])

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const scores = await getTopScores(10)
        setLeaderboard(scores)
        setLeaderboardAvailable(true)
      } catch (error) {
        console.log("[v0] Leaderboard unavailable - database not configured")
        setLeaderboardAvailable(false)
      }
    }
    loadLeaderboard()
  }, [])

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
      onGameOver: () => setGameState("leaderboard-submit"),
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

  const handleNextLevel = () => {
    gameRef.current?.nextLevel()
  }

  const handleRestartLevel = () => {
    gameRef.current?.restartLevel()
  }

  const handleSkipToBoss = () => {
    gameRef.current?.skipToBoss()
  }

  const handleSubmitScore = async () => {
    if (!playerName.trim()) return

    setSubmitting(true)
    try {
      await submitScore(playerName, score, level)
      const updatedScores = await getTopScores(10)
      setLeaderboard(updatedScores)
      setPlayerName("")
      setGameState("menu")
    } catch (error) {
      console.log("[v0] Score submission failed - database not configured")
      setPlayerName("")
      setGameState("menu")
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Instructions screen - any key to continue
      if (gameState === "instructions") {
        startGame()
        return
      }

      // Escape to pause during gameplay
      if (
        e.key === "Escape" &&
        gameState !== "menu" &&
        gameState !== "gameover" &&
        gameState !== "leaderboard-submit"
      ) {
        togglePause()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameState])

  const togglePause = () => {
    if (gameState === "playing") {
      setGameState("paused")
      gameRef.current?.pause()
    } else if (gameState === "paused") {
      setGameState("playing")
      gameRef.current?.resume()
    }
  }

  return (
    <div ref={containerRef} className="w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          className="w-full h-full"
        />

        {/* Level Transition */}
        <div
          id="level-transition"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-[1000] pointer-events-none"
          style={{ display: "none" }}
        >
          <h1
            id="transition-text"
            className="text-5xl md:text-6xl font-bold text-cyan-400 tracking-[5px]"
            style={{
              textShadow: "0 0 30px rgba(0, 255, 255, 1), 0 0 60px rgba(0, 255, 255, 0.5)",
              animation: "fadeInOut 2s ease-in-out",
            }}
          ></h1>
        </div>

        {/* Boss Warning */}
        <div
          id="boss-warning"
          className="absolute inset-0 flex justify-center items-center z-[999] pointer-events-none"
          style={{ display: "none" }}
        >
          <div
            className="absolute inset-0 border-[20px] border-red-500"
            style={{
              boxShadow: "inset 0 0 50px rgba(255, 0, 0, 0.5)",
              animation: "borderPulse 0.5s ease-in-out infinite, warningFlash 0.5s ease-in-out infinite",
            }}
          />
          <h1
            className="text-5xl md:text-7xl font-bold text-yellow-400 tracking-[10px] z-10"
            style={{ textShadow: "0 0 30px rgba(255, 0, 0, 1), 0 0 60px rgba(255, 0, 0, 0.8)" }}
          >
            ⚠ BOSS WARNING ⚠
          </h1>
        </div>

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
          <div className="flex gap-2">
            {/* Score */}
            <div className="bg-black/90 border-2 border-cyan-400/60 px-2.5 py-1 rounded font-mono text-cyan-400 backdrop-blur-sm shadow-lg text-xs md:text-sm">
              <div className="text-[8px] md:text-[10px] opacity-60 leading-tight">SCORE</div>
              <div className="text-sm md:text-base font-bold leading-tight">{score.toString().padStart(8, "0")}</div>
            </div>

            {/* Level & Lives */}
            <div className="bg-black/90 border-2 border-cyan-400/60 px-2.5 py-1 rounded font-mono text-cyan-400 backdrop-blur-sm shadow-lg text-xs md:text-sm">
              <div className="text-[8px] md:text-[10px] opacity-60 leading-tight">LV {level}</div>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: lives }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 md:w-3 h-2 md:h-3 bg-cyan-400 shadow-[0_0_4px_rgba(6,182,212,0.8)]"
                    style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Weapon Level */}
            <div className="bg-black/90 border-2 border-cyan-400/60 px-2.5 py-1 rounded font-mono text-cyan-400 backdrop-blur-sm shadow-lg text-xs md:text-sm">
              <div className="text-[8px] md:text-[10px] opacity-60 leading-tight">WEAPON</div>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 md:w-1.5 h-2.5 md:h-3.5 border border-cyan-400/50 ${
                      i < weaponLevel ? "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" : "bg-black/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Shield */}
            <div className="bg-black/90 border-2 border-cyan-400/60 px-2.5 py-1 rounded font-mono text-cyan-400 backdrop-blur-sm shadow-lg text-xs md:text-sm">
              <div className="text-[8px] md:text-[10px] opacity-60 leading-tight">SHD</div>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 md:w-1.5 h-2.5 md:h-3.5 border border-cyan-400/50 ${
                      i < shield ? "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" : "bg-black/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {bossMaxHealth > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 pointer-events-none">
            <div className="bg-black/80 border-2 border-red-500 px-4 py-2 rounded">
              <div className="text-red-500 font-mono text-sm mb-2 text-center">BOSS HEALTH</div>
              <div className="w-full h-6 bg-black/50 border border-red-500 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                  style={{ width: `${(bossHealth / bossMaxHealth) * 100}%` }}
                />
              </div>
              <div className="text-red-400 font-mono text-xs mt-1 text-center">
                {Math.ceil(bossHealth)} / {bossMaxHealth}
              </div>
            </div>
          </div>
        )}

        {activeEffects.length > 0 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
            {activeEffects.map((effect) => (
              <div
                key={effect}
                className="bg-black/80 border-2 border-yellow-400 px-3 py-1 rounded font-mono text-xs text-yellow-400"
              >
                {effect === "invincible" && "⭐ INVINCIBLE"}
                {effect === "speed" && "⚡ SPEED"}
                {effect === "multiplier" && "✨ 2x SCORE"}
                {effect === "slowmo" && "⏱ SLOW-MO"}
              </div>
            ))}
          </div>
        )}

        {/* Menu Screen with Leaderboard */}
        {gameState === "menu" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 overflow-y-auto p-4">
            <h1
              className="text-6xl md:text-7xl font-bold text-cyan-400 mb-4 animate-pulse"
              style={{ textShadow: "0 0 20px rgba(6,182,212,0.8)" }}
            >
              CHICKEN INVADERS
            </h1>
            <p className="text-xl md:text-2xl text-cyan-300 mb-8">A Space Shooter Adventure</p>

            {leaderboardAvailable && (
              <div className="mb-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">TOP 10 SCORES</h2>
                <div className="bg-black/70 border-2 border-cyan-400/60 rounded p-4 max-h-64 overflow-y-auto">
                  {leaderboard.length > 0 ? (
                    <div className="space-y-2 font-mono text-sm">
                      {leaderboard.map((entry, index) => (
                        <div key={entry.id} className="flex justify-between items-center text-cyan-300">
                          <span className="text-yellow-400 font-bold w-8">#{index + 1}</span>
                          <span className="flex-1 text-left">{entry.name}</span>
                          <span className="text-orange-400 w-24 text-right">{entry.score}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-cyan-300">No scores yet. Be the first!</p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleStartGame}
              className="px-8 py-4 bg-cyan-500 text-black font-bold text-xl rounded hover:bg-cyan-400 transition-colors pointer-events-auto"
              style={{ boxShadow: "0 0 20px rgba(6,182,212,0.6)" }}
            >
              START GAME
            </button>
          </div>
        )}

        {/* Instructions Screen */}
        {gameState === "instructions" && (
          <div className="absolute inset-0 flex flex-col items-center justify-start bg-black/95 overflow-y-auto p-4 md:p-8 pointer-events-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-6">HOW TO PLAY</h2>

            <div className="max-w-2xl space-y-6 text-cyan-300 font-mono text-xs md:text-sm">
              <div>
                <h3 className="text-lg md:text-xl text-yellow-400 mb-2">OBJECTIVE</h3>
                <p>Defeat waves of chicken enemies and mighty bosses!</p>
                <p className="mt-2">🎯 Fight through waves on odd levels (1, 3, 5...)</p>
                <p>⚠️ Face a BOSS on every even level (2, 4, 6...)</p>
                <p className="mt-2">Destroy all enemies to advance! Survive as long as you can!</p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl text-yellow-400 mb-2">CONTROLS</h3>
                <div className="bg-black/50 p-3 border border-cyan-500 space-y-1">
                  <p>
                    <span className="text-cyan-400">Move:</span> WASD / Arrow Keys
                  </p>
                  <p>
                    <span className="text-cyan-400">Shoot:</span> SPACE or Mouse Click
                  </p>
                  <p>
                    <span className="text-cyan-400">Pause:</span> ESC
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-xl text-yellow-400 mb-2">POWER-UPS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-black/50 p-2 border border-red-500">
                    <span className="text-red-500">⚡ WEAPON</span> - Upgrade firepower (Max 5)
                  </div>
                  <div className="bg-black/50 p-2 border border-green-500">
                    <span className="text-green-500">🛡 SHIELD</span> - Temporary protection
                  </div>
                  <div className="bg-black/50 p-2 border border-blue-500">
                    <span className="text-blue-500">🔥 FIRE RATE</span> - Shoot faster
                  </div>
                  <div className="bg-black/50 p-2 border border-yellow-500">
                    <span className="text-yellow-500">⭐ SPREAD</span> - Multi-directional shots
                  </div>
                  <div className="bg-black/50 p-2 border border-purple-500">
                    <span className="text-purple-500">💣 BOMB</span> - Clear screen attack
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-xl text-yellow-400 mb-2">TIPS</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Enemies drop power-ups when defeated</li>
                  <li>Bosses have multiple attack patterns - stay alert!</li>
                  <li>Build combo chains for higher scores</li>
                  <li>Your weapons reset after defeating a boss</li>
                  <li>Keep moving to dodge incoming fire!</li>
                </ul>
              </div>
            </div>

            <p
              className="mt-8 text-xl md:text-2xl text-cyan-400 font-bold animate-pulse"
              style={{ textShadow: "0 0 20px rgba(6,182,212,0.8)" }}
            >
              Press any key to continue
            </p>
          </div>
        )}

        {gameState === "leaderboard-submit" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 pointer-events-auto p-4">
            <h2 className="text-5xl font-bold text-red-500 mb-4" style={{ textShadow: "0 0 20px rgba(239,68,68,0.8)" }}>
              GAME OVER
            </h2>
            <p className="text-3xl text-cyan-400 mb-2">Final Score</p>
            <p className="text-5xl font-bold text-yellow-400 mb-2">{score.toString().padStart(8, "0")}</p>
            <p className="text-xl text-cyan-300 mb-8">Reached Level {level}</p>

            {leaderboardAvailable ? (
              <div className="bg-black/70 border-2 border-cyan-400/60 rounded p-6 max-w-md w-full">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4 text-center">SUBMIT YOUR SCORE</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-cyan-300 mb-2 font-mono text-sm">PLAYER NAME</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.slice(0, 50))}
                      placeholder="Enter your name"
                      maxLength={50}
                      className="w-full px-3 py-2 bg-black/50 border border-cyan-400/60 rounded text-cyan-300 placeholder-cyan-600 focus:outline-none focus:border-cyan-400 font-mono"
                      onKeyPress={(e) => e.key === "Enter" && handleSubmitScore()}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-cyan-300 font-mono text-sm">SCORE</p>
                      <p className="text-yellow-400 font-bold">{score}</p>
                    </div>
                    <div>
                      <p className="text-cyan-300 font-mono text-sm">LEVEL</p>
                      <p className="text-orange-400 font-bold">{level}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitScore}
                    disabled={!playerName.trim() || submitting}
                    className="w-full px-4 py-3 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "SUBMITTING..." : "SUBMIT SCORE"}
                  </button>

                  <button
                    onClick={() => setGameState("menu")}
                    className="w-full px-4 py-2 bg-gray-600 text-white font-bold rounded hover:bg-gray-500 transition-colors"
                  >
                    SKIP
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-black/70 border-2 border-cyan-400/60 rounded p-6 max-w-md w-full text-center">
                <p className="text-cyan-300 mb-6">Leaderboard is not available. Thanks for playing!</p>
                <button
                  onClick={() => setGameState("menu")}
                  className="w-full px-4 py-3 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-colors"
                >
                  RETURN TO MENU
                </button>
              </div>
            )}
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
