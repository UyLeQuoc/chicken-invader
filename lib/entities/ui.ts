import type { Game } from "../game"

export class UI {
  game: Game
  scoreElement: HTMLElement | null
  levelElement: HTMLElement | null
  livesContainer: HTMLElement | null
  bombCountElement: HTMLElement | null
  weaponLevelContainer: HTMLElement | null
  bossHealthContainer: HTMLElement | null
  bossHealthInner: HTMLElement | null
  bossNameElement: HTMLElement | null
  levelTransition: HTMLElement | null
  transitionText: HTMLElement | null
  bossWarning: HTMLElement | null
  gameOver: HTMLElement | null
  finalScore: HTMLElement | null
  comboContainer: HTMLElement | null

  constructor(game: Game) {
    this.game = game

    this.scoreElement = document.getElementById("score-value")
    this.levelElement = document.getElementById("level-value")
    this.livesContainer = document.getElementById("lives-icons")
    this.bombCountElement = document.getElementById("bomb-count")
    this.weaponLevelContainer = document.getElementById("weapon-level-bars")

    this.bossHealthContainer = document.getElementById("boss-health-container")
    this.bossHealthInner = document.getElementById("boss-health-inner")
    this.bossNameElement = document.getElementById("boss-name")

    this.levelTransition = document.getElementById("level-transition")
    this.transitionText = document.getElementById("transition-text")

    this.bossWarning = document.getElementById("boss-warning")

    this.gameOver = document.getElementById("game-over")
    this.finalScore = document.getElementById("final-score")

    this.comboContainer = document.getElementById("combo-container")

    this.initWeaponBars()
  }

  private initWeaponBars(): void {
    if (!this.weaponLevelContainer) return
    this.weaponLevelContainer.innerHTML = ""
    for (let i = 0; i < 5; i++) {
      const bar = document.createElement("div")
      bar.className = "weapon-bar"
      bar.id = `weapon-bar-${i}`
      this.weaponLevelContainer.appendChild(bar)
    }
  }

  updateScore(score: number): void {
    if (this.scoreElement) {
      this.scoreElement.textContent = score.toString().padStart(8, "0")
    }
  }

  updateLevel(level: number): void {
    if (this.levelElement) {
      this.levelElement.textContent = level.toString()
    }
  }

  updateLives(lives: number): void {
    if (!this.livesContainer) return
    this.livesContainer.innerHTML = ""
    for (let i = 0; i < lives; i++) {
      const icon = document.createElement("div")
      icon.className = "life-icon"
      this.livesContainer.appendChild(icon)
    }
  }

  updateBombs(bombs: number): void {
    if (this.bombCountElement) {
      this.bombCountElement.textContent = bombs.toString()
    }
  }

  updateWeaponLevel(level: number): void {
    for (let i = 0; i < 5; i++) {
      const bar = document.getElementById(`weapon-bar-${i}`)
      if (bar) {
        if (i < level) {
          bar.classList.add("active")
        } else {
          bar.classList.remove("active")
        }
      }
    }
  }

  showBossHealth(boss: { name: string }): void {
    if (this.bossHealthContainer) {
      this.bossHealthContainer.style.display = "block"
    }
    if (this.bossNameElement) {
      this.bossNameElement.textContent = boss.name
    }
    this.updateBossHealth(1)
  }

  updateBossHealth(percent: number): void {
    if (this.bossHealthInner) {
      this.bossHealthInner.style.width = percent * 100 + "%"

      if (percent > 0.6) {
        this.bossHealthInner.style.background = "linear-gradient(90deg, #0f0, #0f0)"
      } else if (percent > 0.3) {
        this.bossHealthInner.style.background = "linear-gradient(90deg, #ff0, #ff0)"
      } else {
        this.bossHealthInner.style.background = "linear-gradient(90deg, #f00, #f00)"
      }
    }
  }

  hideBossHealth(): void {
    if (this.bossHealthContainer) {
      this.bossHealthContainer.style.display = "none"
    }
  }

  showLevelTransition(text: string, victory = false): void {
    if (this.transitionText) {
      this.transitionText.textContent = text
      this.transitionText.style.color = victory ? "#0f0" : "#0ff"
    }
    if (this.levelTransition) {
      this.levelTransition.style.display = "block"

      setTimeout(() => {
        if (this.levelTransition) {
          this.levelTransition.style.display = "none"
        }
      }, 2000)
    }
  }

  showBossWarning(): void {
    if (this.bossWarning) {
      this.bossWarning.style.display = "flex"

      let flashes = 0
      const interval = setInterval(() => {
        flashes++
        if (flashes > 6) {
          clearInterval(interval)
          if (this.bossWarning) {
            this.bossWarning.style.display = "none"
          }
        }
      }, 500)
    }
  }

  showCombo(combo: number, x: number, y: number): void {
    if (!this.comboContainer) return
    const comboText = document.createElement("div")
    comboText.className = "combo-text"
    comboText.textContent = `${combo}x COMBO!`
    comboText.style.left = x + "px"
    comboText.style.top = y + "px"

    this.comboContainer.appendChild(comboText)

    setTimeout(() => {
      comboText.remove()
    }, 1000)
  }

  showDamage(damage: number, x: number, y: number, isCritical: boolean): void {
    const canvas = document.getElementById("gameCanvas")
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()

    const damageText = document.createElement("div")
    damageText.className = isCritical ? "damage-number critical" : "damage-number"
    damageText.textContent = isCritical ? `${damage}!` : damage.toString()
    damageText.style.position = "absolute"
    damageText.style.left = rect.left + x + "px"
    damageText.style.top = rect.top + y + "px"
    damageText.style.pointerEvents = "none"
    damageText.style.zIndex = "1000"

    document.body.appendChild(damageText)

    setTimeout(() => {
      damageText.remove()
    }, 800)
  }

  showGameOver(score: number): void {
    if (this.finalScore) {
      this.finalScore.textContent = score.toString().padStart(8, "0")
    }
    if (this.gameOver) {
      this.gameOver.style.display = "block"
    }
  }
}

