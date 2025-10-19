import type { Game } from "../game"
import { Projectile } from "./projectile"
import { Particle } from "./particle"

export class Boss {
  game: Game
  x: number
  y: number
  type: number
  width: number
  height: number
  radius: number
  maxHealth: number
  health: number
  speed: number
  vx: number
  vy: number
  phase: number
  maxPhases: number
  phaseChangeTimer: number
  movementTimer: number
  movementPattern: number
  targetX: number
  targetY: number
  attackTimer: number
  attackInterval: number
  attackPattern: number
  animationFrame: number
  animationTimer: number
  wingAngle: number
  rotationAngle: number
  flashTimer: number
  glowIntensity: number
  charging: boolean
  chargingTimer: number
  weakPointActive: boolean
  weakPointTimer: number
  weakPointX: number
  weakPointY: number
  names: string[]
  name: string
  entering: boolean
  entryTimer: number

  constructor(x: number, y: number, type: number, game: Game) {
    this.game = game
    this.x = x
    this.y = y
    this.targetX = x
    this.targetY = 150
    this.type = type

    this.width = 120
    this.height = 120
    this.radius = 60

    // Health scales with both boss type and game level
    const baseHealth = 500
    const typeBonus = type * 100
    const levelBonus = Math.floor((game.level - 2) / 2) * 300 
    this.maxHealth = baseHealth + typeBonus + levelBonus
    this.health = this.maxHealth

    this.speed = 120
    this.vx = 0
    this.vy = 100

    this.phase = 0
    this.maxPhases = 4
    this.phaseChangeTimer = 0

    this.movementTimer = 0
    this.movementPattern = 0

    this.attackTimer = 0
    this.attackInterval = 1.5
    this.attackPattern = 0

    this.animationFrame = 0
    this.animationTimer = 0
    this.wingAngle = 0
    this.rotationAngle = 0

    this.flashTimer = 0
    this.glowIntensity = 0
    this.charging = false
    this.chargingTimer = 0

    this.weakPointActive = false
    this.weakPointTimer = 0
    this.weakPointX = 0
    this.weakPointY = -20

    this.names = ["COLONEL CLUCKSWORTH", "GENERAL PECKERSON", "ADMIRAL FEATHERBEAK", "SUPREME ROOSTER"]
    this.name = this.names[type % this.names.length]

    this.entering = true
    this.entryTimer = 0
  }

  update(deltaTime: number): void {
    if (this.entering) {
      this.entryTimer += deltaTime
      this.y += 150 * deltaTime

      if (this.y >= this.targetY) {
        this.y = this.targetY
        this.entering = false
        this.game.addScreenShake(0.5)
      }
      return
    }

    const healthPercent = this.health / this.maxHealth
    const newPhase = Math.floor((1 - healthPercent) * this.maxPhases)

    if (newPhase > this.phase) {
      this.phase = newPhase
      this.onPhaseChange()
    }

    this.movementTimer += deltaTime

    switch (this.movementPattern) {
      case 0:
        this.targetX = this.game.width / 2 + Math.sin(this.movementTimer * 1.5) * 200
        this.targetY = 150
        break
      case 1:
        this.targetX = this.game.width / 2 + Math.sin(this.movementTimer) * 250
        this.targetY = 150 + Math.sin(this.movementTimer * 2) * 80
        break
      case 2:
        const angle = this.movementTimer
        this.targetX = this.game.width / 2 + Math.cos(angle) * 200
        this.targetY = 200 + Math.sin(angle) * 100
        break
      case 3:
        if (Math.floor(this.movementTimer) % 5 < 2) {
          this.targetY = 300
          this.targetX = this.game.player.x
        } else {
          this.targetY = 150
        }
        break
    }

    const dx = this.targetX - this.x
    const dy = this.targetY - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist > 5) {
      this.vx = (dx / dist) * this.speed
      this.vy = (dy / dist) * this.speed
    } else {
      this.vx = 0
      this.vy = 0
    }

    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime

    this.x = Math.max(80, Math.min(this.game.width - 80, this.x))
    this.y = Math.max(80, Math.min(this.game.height * 0.5, this.y))

    this.attackTimer -= deltaTime
    if (this.attackTimer <= 0) {
      this.attack()
      this.attackInterval = 1.5 - this.phase * 0.2
      this.attackTimer = this.attackInterval
    }

    if (this.charging) {
      this.chargingTimer += deltaTime
      this.glowIntensity = Math.sin(this.chargingTimer * 10) * 0.5 + 0.5

      if (this.chargingTimer > 1) {
        this.charging = false
        this.executeAttack()
      }
    }

    if (this.weakPointActive) {
      this.weakPointTimer -= deltaTime
      if (this.weakPointTimer <= 0) {
        this.weakPointActive = false
      }
    } else {
      if (Math.random() < 0.003) {
        this.weakPointActive = true
        this.weakPointTimer = 3
      }
    }

    this.animationTimer += deltaTime
    if (this.animationTimer > 0.1) {
      this.animationFrame = (this.animationFrame + 1) % 4
      this.animationTimer = 0
    }

    this.wingAngle += deltaTime * 8
    this.rotationAngle += deltaTime * 0.5

    if (this.flashTimer > 0) {
      this.flashTimer -= deltaTime
    }
  }

  private onPhaseChange(): void {
    this.game.flash("red", 0.3)
    this.game.addScreenShake(0.4)

    this.movementPattern = (this.movementPattern + 1) % 4
    this.movementTimer = 0

    this.attackPattern = this.phase

    this.speed = 120 + this.phase * 40

    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 300 + 100
      const colors = ["#f00", "#f90", "#ff0"]
      const color = colors[Math.floor(Math.random() * colors.length)]

      this.game.particles.push(
        new Particle(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 0.8, 6),
      )
    }
  }

  private attack(): void {
    this.charging = true
    this.chargingTimer = 0
    this.attackPattern = (this.attackPattern + 1) % 18
  }

  private executeAttack(): void {
    const patterns = [
      this.spiralStorm.bind(this),
      this.shotgunBlast.bind(this),
      this.verticalColumns.bind(this),
      this.circleBarrage.bind(this),
      this.waveFormation.bind(this),
      this.aimedShots.bind(this),
      this.rotatingCannon.bind(this),
      this.rainChaos.bind(this),
      this.crossPattern.bind(this),
      this.homingEggs.bind(this),
      this.doubleHelix.bind(this),
      this.machineGun.bind(this),
      this.laserSweep.bind(this),
      this.burstFire.bind(this),
      this.meteorShower.bind(this),
      this.spiralLaser.bind(this),
      this.diamondPattern.bind(this),
      this.chaosStorm.bind(this),
    ]

    const pattern = patterns[this.attackPattern % patterns.length]
    pattern()
  }

  private spiralStorm(): void {
    const count = 8 + this.phase * 2
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const angle = (i / count) * Math.PI * 2 + this.rotationAngle
        const speed = 160
        this.spawnProjectile(Math.cos(angle) * speed, Math.sin(angle) * speed)
      }, i * 60)
    }
  }

  private shotgunBlast(): void {
    const count = 10 + this.phase * 2
    const spreadAngle = Math.PI / 2

    for (let i = 0; i < count; i++) {
      const angle = -spreadAngle / 2 + (i / count) * spreadAngle + Math.PI / 2
      const speed = 250 + Math.random() * 80
      this.spawnProjectile(Math.cos(angle) * speed, Math.sin(angle) * speed)
    }
  }

  private verticalColumns(): void {
    const columns = 5 + this.phase
    for (let i = 0; i < columns; i++) {
      const x = (this.game.width / (columns + 1)) * (i + 1)
      for (let j = 0; j < 3; j++) {
        setTimeout(() => {
          this.game.enemyProjectiles.push(new Projectile(x, this.y, 0, 200, 15, this.game, "egg"))
        }, j * 300)
      }
    }
  }

  private circleBarrage(): void {
    const count = 12 + this.phase * 3
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const speed = 180
      this.spawnProjectile(Math.cos(angle) * speed, Math.sin(angle) * speed)
    }
  }

  private waveFormation(): void {
    const count = 15
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const offset = Math.sin((i / count) * Math.PI * 2) * 200
        this.game.enemyProjectiles.push(new Projectile(this.x + offset, this.y, 0, 200, 15, this.game, "egg"))
      }, i * 100)
    }
  }

  private aimedShots(): void {
    const count = 4 + this.phase
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const dx = this.game.player.x - this.x
        const dy = this.game.player.y - this.y
        const angle = Math.atan2(dy, dx)
        const speed = 280
        this.spawnProjectile(Math.cos(angle) * speed, Math.sin(angle) * speed)
      }, i * 300)
    }
  }

  private rotatingCannon(): void {
    const count = 20 + this.phase * 5
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const angle = (i / count) * Math.PI * 4
        const speed = 200
        this.spawnProjectile(Math.cos(angle) * speed, Math.sin(angle) * speed)
      }, i * 50)
    }
  }

  private rainChaos(): void {
    const count = 12 + this.phase * 3
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const x = Math.random() * this.game.width
        const speed = 140 + Math.random() * 80
        this.game.enemyProjectiles.push(
          new Projectile(x, this.y, (Math.random() - 0.5) * 80, speed, 15, this.game, "egg"),
        )
      }, i * 80)
    }
  }

  private crossPattern(): void {
    const directions: Array<[number, number]> = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [0.707, 0.707],
      [-0.707, 0.707],
      [0.707, -0.707],
      [-0.707, -0.707],
    ]

    for (const [dx, dy] of directions) {
      const speed = 200
      this.spawnProjectile(dx * speed, dy * speed)
    }
  }

  private homingEggs(): void {
    const count = 3 + this.phase
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const angle = Math.random() * Math.PI * 2
        const speed = 150
        const proj = new Projectile(
          this.x,
          this.y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          15,
          this.game,
          "egg",
        )
        proj.homing = true
        this.game.enemyProjectiles.push(proj)
      }, i * 500)
    }
  }

  private doubleHelix(): void {
    const count = 30
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const angle1 = (i / count) * Math.PI * 4
        const angle2 = angle1 + Math.PI
        const speed = 180
        const radius = 50

        this.spawnProjectile(Math.cos(angle1) * speed + Math.cos(angle1 * 3) * radius, Math.sin(angle1) * speed)
        this.spawnProjectile(Math.cos(angle2) * speed + Math.cos(angle2 * 3) * radius, Math.sin(angle2) * speed)
      }, i * 50)
    }
  }

  private machineGun(): void {
    const count = 25 + this.phase * 8
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const dx = this.game.player.x - this.x
        const dy = this.game.player.y - this.y
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.3
        const speed = 320
        this.spawnProjectile(Math.cos(angle) * speed, Math.sin(angle) * speed)
      }, i * 40)
    }
  }

  private laserSweep(): void {
    const sweeps = 1 + this.phase
    for (let sweep = 0; sweep < sweeps; sweep++) {
      const startAngle = sweep % 2 === 0 ? 0 : Math.PI
      const count = 20
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const angle = startAngle + (i / count) * Math.PI
          const speed = 220
          for (let j = 0; j < 2; j++) {
            setTimeout(() => {
              this.spawnProjectile(Math.cos(angle) * speed, Math.sin(angle) * speed)
            }, j * 60)
          }
        }, sweep * 1500 + i * 30)
      }
    }
  }

  private burstFire(): void {
    const bursts = 4 + this.phase
    for (let burst = 0; burst < bursts; burst++) {
      setTimeout(() => {
        const dx = this.game.player.x - this.x
        const dy = this.game.player.y - this.y
        const baseAngle = Math.atan2(dy, dx)
        
        for (let i = 0; i < 5; i++) {
          const angle = baseAngle + (i - 2) * 0.2
          const speed = 280
          this.spawnProjectile(Math.cos(angle) * speed, Math.sin(angle) * speed)
        }
      }, burst * 500)
    }
  }

  private meteorShower(): void {
    const count = 15 + this.phase * 5
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const x = Math.random() * this.game.width
        const speed = 180 + Math.random() * 100
        const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.3
        this.game.enemyProjectiles.push(
          new Projectile(x, 0, Math.cos(angle) * speed, Math.sin(angle) * speed, 15, this.game, "egg"),
        )
      }, i * 60)
    }
  }

  private spiralLaser(): void {
    const rotations = 2 + this.phase
    const count = 30 * rotations
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const angle = (i / count) * Math.PI * 2 * rotations
        const speed = 200
        this.spawnProjectile(Math.cos(angle) * speed, Math.sin(angle) * speed)
      }, i * 30)
    }
  }

  private diamondPattern(): void {
    const layers = 3 + this.phase
    for (let layer = 0; layer < layers; layer++) {
      setTimeout(() => {
        const sides = 4
        const points = 8
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2 + Math.PI / 4
          const speed = 180 + layer * 40
          this.spawnProjectile(Math.cos(angle) * speed, Math.sin(angle) * speed)
        }
      }, layer * 200)
    }
  }

  private chaosStorm(): void {
    const waves = 3 + this.phase
    for (let wave = 0; wave < waves; wave++) {
      setTimeout(() => {
        // Circular burst
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const speed = 180
          this.spawnProjectile(Math.cos(angle) * speed, Math.sin(angle) * speed)
        }
        
        // Aimed shots
        setTimeout(() => {
          for (let i = 0; i < 3; i++) {
            const dx = this.game.player.x - this.x
            const dy = this.game.player.y - this.y
            const angle = Math.atan2(dy, dx) + (i - 1) * 0.25
            const speed = 260
            this.spawnProjectile(Math.cos(angle) * speed, Math.sin(angle) * speed)
          }
        }, 250)
      }, wave * 700)
    }
  }

  private spawnProjectile(vx: number, vy: number): void {
    this.game.enemyProjectiles.push(new Projectile(this.x, this.y, vx, vy, 15, this.game, "egg"))
  }

  isWeakPointHit(x: number, y: number): boolean {
    if (!this.weakPointActive) return false

    const wpX = this.x + this.weakPointX
    const wpY = this.y + this.weakPointY
    const dist = Math.sqrt((x - wpX) ** 2 + (y - wpY) ** 2)

    return dist < 15
  }

  takeDamage(damage: number, isCritical = false): void {
    const actualDamage = isCritical ? damage * 3 : damage
    this.health -= actualDamage
    this.flashTimer = 0.1

    this.game.ui.updateBossHealth(this.health / this.maxHealth)
    this.game.ui.showDamage(actualDamage, this.x, this.y, isCritical)

    if (this.health < this.maxHealth * 0.5) {
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 50 + 25
        this.game.particles.push(
          new Particle(
            this.x + (Math.random() - 0.5) * this.width,
            this.y + (Math.random() - 0.5) * this.height,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed - 50,
            "#444",
            1,
            8,
          ),
        )
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    ctx.translate(this.x, this.y)

    if (this.flashTimer > 0) {
      ctx.shadowColor = "#fff"
      ctx.shadowBlur = 30
    } else {
      ctx.shadowColor = "#f00"
      ctx.shadowBlur = 20
    }

    if (this.charging) {
      ctx.shadowColor = "#ff0"
      ctx.shadowBlur = 40 * this.glowIntensity
    }

    const wingFlap = Math.sin(this.wingAngle) * 0.4

    ctx.beginPath()
    ctx.ellipse(-this.width / 3, 0, this.width / 2.5, this.height / 1.8, -wingFlap, 0, Math.PI * 2)
    const wingGradient1 = ctx.createRadialGradient(-this.width / 3, 0, 0, -this.width / 3, 0, this.width / 2.5)
    wingGradient1.addColorStop(0, "#f90")
    wingGradient1.addColorStop(1, "#f00")
    ctx.fillStyle = wingGradient1
    ctx.fill()
    ctx.strokeStyle = "#ff0"
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(this.width / 3, 0, this.width / 2.5, this.height / 1.8, wingFlap, 0, Math.PI * 2)
    const wingGradient2 = ctx.createRadialGradient(this.width / 3, 0, 0, this.width / 3, 0, this.width / 2.5)
    wingGradient2.addColorStop(0, "#f90")
    wingGradient2.addColorStop(1, "#f00")
    ctx.fillStyle = wingGradient2
    ctx.fill()
    ctx.strokeStyle = "#ff0"
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(0, 0, this.width / 2.5, this.height / 2, 0, 0, Math.PI * 2)

    const bodyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius)
    bodyGradient.addColorStop(0, "#ff0")
    bodyGradient.addColorStop(0.5, "#f90")
    bodyGradient.addColorStop(1, "#f00")
    ctx.fillStyle = bodyGradient
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 4
    ctx.stroke()

    ctx.strokeStyle = "#0ff"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(-20, -10, 8, 0, Math.PI * 2)
    ctx.arc(20, -10, 8, 0, Math.PI * 2)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(0, -this.height / 2.5, this.width / 3.5, 0, Math.PI * 2)
    ctx.fillStyle = "#f90"
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = "#f00"
    ctx.beginPath()
    ctx.moveTo(-10, -this.height / 2.5 - 10)
    ctx.lineTo(0, -this.height / 2.5 - 25)
    ctx.lineTo(10, -this.height / 2.5 - 10)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = "#ff0"
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = "#f00"
    ctx.beginPath()
    ctx.arc(-12, -this.height / 2.5, 6, 0, Math.PI * 2)
    ctx.arc(12, -this.height / 2.5, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#000"
    ctx.beginPath()
    ctx.arc(-12, -this.height / 2.5, 3, 0, Math.PI * 2)
    ctx.arc(12, -this.height / 2.5, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#ff0"
    ctx.beginPath()
    ctx.moveTo(0, -this.height / 3)
    ctx.lineTo(-8, -this.height / 4)
    ctx.lineTo(8, -this.height / 4)
    ctx.closePath()
    ctx.fill()

    if (this.weakPointActive) {
      ctx.save()
      const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7
      ctx.globalAlpha = pulse
      ctx.fillStyle = "#f00"
      ctx.shadowColor = "#f00"
      ctx.shadowBlur = 20
      ctx.beginPath()
      ctx.arc(this.weakPointX, this.weakPointY, 10, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = "#ff0"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(this.weakPointX, this.weakPointY, 15, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    const healthPercent = this.health / this.maxHealth
    if (healthPercent < 0.7) {
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-20, -10)
      ctx.lineTo(-30, 5)
      ctx.moveTo(20, -10)
      ctx.lineTo(30, 5)
      ctx.stroke()
    }

    if (healthPercent < 0.3) {
      ctx.beginPath()
      ctx.moveTo(0, 20)
      ctx.lineTo(-15, 35)
      ctx.moveTo(0, 20)
      ctx.lineTo(15, 35)
      ctx.stroke()
    }

    ctx.restore()
  }
}
