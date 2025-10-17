"use client"

import { useEffect, useRef, useState } from "react"
import { Game } from "@/lib/game"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, SkipForward, Zap } from "lucide-react"
import { getTopScores, submitScore, type LeaderboardEntry } from "@/lib/leaderboard"

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Game | null>(null)
  const [gameState, setGameState] = useState<
    "menu" | "ship-select" | "playing" | "paused" | "gameover" | "instructions" | "boss-complete" | "leaderboard-submit"
  >("menu")
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [weaponLevel, setWeaponLevel] = useState(1)
  const [shield, setShield] = useState(0)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 800 })
  const [selectedShip, setSelectedShip] = useState<"bullet" | "explosive" | "laser" | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [playerName, setPlayerName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [leaderboardAvailable, setLeaderboardAvailable] = useState(true)

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
      onBossDefeated: () => setGameState("boss-complete"),
    })

    return () => {
      gameRef.current?.destroy()
    }
  }, [canvasDimensions])

  const handleStartGame = () => {
    setGameState("ship-select")
  }

  const handleShipSelect = (ship: "bullet" | "explosive" | "laser") => {
    setSelectedShip(ship)
    setGameState("instructions")
  }

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setLevel(1)
    setLives(3)
    setWeaponLevel(1)
    setShield(0)
    gameRef.current?.start(selectedShip || "bullet")
  }

  const handleBossComplete = () => {
    setWeaponLevel(1)
    setShield(0)
    setGameState("ship-select")
    gameRef.current?.nextLevel()
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
    if (!playerName.trim() || !selectedShip) return

    setSubmitting(true)
    try {
      await submitScore(playerName, selectedShip, score, level)
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
      if (
        e.key === "Escape" &&
        gameState !== "menu" &&
        gameState !== "gameover" &&
        gameState !== "instructions" &&
        gameState !== "ship-select" &&
        gameState !== "boss-complete" &&
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
            {/* Bullet Weapon */}
            <div
              className={`bg-black/90 border-2 px-2.5 py-1 rounded font-mono backdrop-blur-sm shadow-lg text-xs md:text-sm transition-all ${
                selectedShip === "bullet" ? "border-cyan-400/60 text-cyan-400" : "border-gray-600/40 text-gray-600"
              }`}
            >
              <div className="text-[8px] md:text-[10px] opacity-60 leading-tight">BULLET</div>
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

            {/* Explosive Weapon */}
            <div
              className={`bg-black/90 border-2 px-2.5 py-1 rounded font-mono backdrop-blur-sm shadow-lg text-xs md:text-sm transition-all ${
                selectedShip === "explosive"
                  ? "border-orange-500/60 text-orange-500"
                  : "border-gray-600/40 text-gray-600"
              }`}
            >
              <div className="text-[8px] md:text-[10px] opacity-60 leading-tight">EXPLOSIVE</div>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 md:w-1.5 h-2.5 md:h-3.5 border border-orange-500/50 ${
                      i < weaponLevel ? "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]" : "bg-black/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Laser Weapon */}
            <div
              className={`bg-black/90 border-2 px-2.5 py-1 rounded font-mono backdrop-blur-sm shadow-lg text-xs md:text-sm transition-all ${
                selectedShip === "laser" ? "border-green-400/60 text-green-400" : "border-gray-600/40 text-gray-600"
              }`}
            >
              <div className="text-[8px] md:text-[10px] opacity-60 leading-tight">LASER</div>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 md:w-1.5 h-2.5 md:h-3.5 border border-green-400/50 ${
                      i < weaponLevel ? "bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.6)]" : "bg-black/50"
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
                          <span className="text-yellow-400 font-bold w-6">#{index + 1}</span>
                          <span className="flex-1">{entry.name}</span>
                          <span className="text-green-400">{entry.ship_type}</span>
                          <span className="text-orange-400 w-20 text-right">{entry.score}</span>
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

        {/* Ship Selection Screen */}
        {gameState === "ship-select" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 pointer-events-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-12">SELECT YOUR SHIP</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Bullet Ship */}
              <div
                onClick={() => handleShipSelect("bullet")}
                className="cursor-pointer p-6 border-2 border-cyan-400 rounded-lg hover:border-cyan-300 hover:bg-cyan-400/10 transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">🔫</div>
                  <h3 className="text-2xl font-bold text-cyan-400 mb-2">BULLET SHIP</h3>
                  <p className="text-cyan-300 text-sm mb-4">Standard rapid-fire weapon</p>
                  <div className="text-xs text-cyan-200">
                    <p>• Fast fire rate</p>
                    <p>• Balanced damage</p>
                    <p>• Spread pattern</p>
                  </div>
                </div>
              </div>

              {/* Explosive Ship */}
              <div
                onClick={() => handleShipSelect("explosive")}
                className="cursor-pointer p-6 border-2 border-orange-500 rounded-lg hover:border-orange-400 hover:bg-orange-500/10 transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">💣</div>
                  <h3 className="text-2xl font-bold text-orange-500 mb-2">EXPLOSIVE SHIP</h3>
                  <p className="text-orange-300 text-sm mb-4">Single explosive bullets</p>
                  <div className="text-xs text-orange-200">
                    <p>• One bullet per shot</p>
                    <p>• Grows with level</p>
                    <p>• Area explosion</p>
                  </div>
                </div>
              </div>

              {/* Laser Ship */}
              <div
                onClick={() => handleShipSelect("laser")}
                className="cursor-pointer p-6 border-2 border-green-400 rounded-lg hover:border-green-300 hover:bg-green-400/10 transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">🔫</div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">LASER SHIP</h3>
                  <p className="text-green-300 text-sm mb-4">Continuous beam weapon</p>
                  <div className="text-xs text-green-200">
                    <p>• Laser beam</p>
                    <p>• Grows with level</p>
                    <p>• Piercing damage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Boss Complete Screen */}
        {gameState === "boss-complete" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 pointer-events-auto">
            <h2
              className="text-5xl font-bold text-green-400 mb-4"
              style={{ textShadow: "0 0 20px rgba(34,197,94,0.8)" }}
            >
              BOSS DEFEATED!
            </h2>
            <p className="text-2xl text-cyan-300 mb-8">Select a new ship to continue</p>
            <button
              onClick={handleBossComplete}
              className="px-8 py-4 bg-green-500 text-black font-bold text-xl rounded hover:bg-green-400 transition-colors"
            >
              NEXT LEVEL
            </button>
          </div>
        )}

        {/* Instructions Screen */}
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
                <h3 className="text-lg md:text-xl text-yellow-400 mb-2">YOUR SHIP</h3>
                <div className="bg-black/50 p-3 border border-cyan-500">
                  {selectedShip === "bullet" && (
                    <>
                      <p className="text-cyan-400 font-bold mb-2">🔫 BULLET SHIP</p>
                      <p>Fast-firing standard weapon with spread patterns. Great for beginners!</p>
                    </>
                  )}
                  {selectedShip === "explosive" && (
                    <>
                      <p className="text-orange-400 font-bold mb-2">💣 EXPLOSIVE SHIP</p>
                      <p>Fires one explosive bullet per shot that grows bigger with level!</p>
                    </>
                  )}
                  {selectedShip === "laser" && (
                    <>
                      <p className="text-green-400 font-bold mb-2">🔫 LASER SHIP</p>
                      <p>Continuous laser beam that grows bigger and stronger with level!</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-xl text-yellow-400 mb-2">POWER-UPS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-black/50 p-2 border border-red-500">
                    <span className="text-red-500">⚡ WEAPON</span> - Upgrade weapon level (Max 5)
                  </div>
                  <div className="bg-black/50 p-2 border border-cyan-500">
                    <span className="text-cyan-500">🛡 SHIELD</span> - Add shield layer (Max 5)
                  </div>
                  <div className="bg-black/50 p-2 border border-green-500">
                    <span className="text-green-500">❤ HEALTH</span> - Gain extra life
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

                  <div>
                    <p className="text-cyan-300 font-mono text-sm mb-2">SHIP TYPE</p>
                    <p className="text-cyan-400 font-bold text-lg capitalize">{selectedShip}</p>
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
