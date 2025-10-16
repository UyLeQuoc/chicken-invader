import { Bullet } from "./bullet"

export class Boss {
  x: number
  y: number
  health: number
  maxHealth: number
  name: string
  type: number
  dropped75 = false
  dropped50 = false
  dropped25 = false
  private angle = 0
  private phase = 0
  private attackTimer = 0
  private attackCooldown = 2000
  private movePattern = 0
  private moveTimer = 0
  private targetX = 0
  private targetY = 0
  private velocityX = 0
  private velocityY = 0

  constructor(x: number, y: number, type: number, level: number) {
    this.x = x
    this.y = y
    this.targetX = x
    this.targetY = y
    this.type = type
    this.maxHealth = 50 + level * 20
    this.health = this.maxHealth
    this.name = [
      "COLONEL CLUCKSWORTH",
      "GENERAL PECKINGTON",
      "ADMIRAL FEATHERBEARD",
      "CAPTAIN WINGNUT",
      "MAJOR DRUMSTICK",
      "SERGEANT SCRAMBLES",
      "COMMANDER COOP",
      "LORD EGGBERT",
    ][type % 8]
  }

  update(deltaTime: number) {
    this.angle += deltaTime * 0.002
    this.attackTimer += deltaTime
    this.moveTimer += deltaTime

    switch (this.movePattern) {
      case 0: // Side to side
        this.targetX = 400 + Math.sin(this.moveTimer * 0.001) * 300
        this.targetY = 150
        break
      case 1: // Figure 8
        this.targetX = 400 + Math.sin(this.moveTimer * 0.001) * 250
        this.targetY = 150 + Math.sin(this.moveTimer * 0.002) * 50
        break
      case 2: // Circular
        this.targetX = 400 + Math.cos(this.moveTimer * 0.001) * 200
        this.targetY = 150 + Math.sin(this.moveTimer * 0.001) * 100
        break
      case 3: // Vertical wave
        this.targetX = 400 + Math.sin(this.moveTimer * 0.002) * 150
        this.targetY = 120 + Math.sin(this.moveTimer * 0.001) * 80
        break
    }

    const smoothing = 0.05
    this.velocityX = (this.targetX - this.x) * smoothing
    this.velocityY = (this.targetY - this.y) * smoothing
    this.x += this.velocityX
    this.y += this.velocityY

    // Change movement pattern periodically
    if (this.moveTimer > 5000) {
      this.moveTimer = 0
      this.movePattern = (this.movePattern + 1) % 4
    }

    // Update phase based on health
    const healthPercent = this.health / this.maxHealth
    if (healthPercent < 0.25 && !this.dropped25) {
      this.phase = 3
      this.attackCooldown = 1000
      this.dropped25 = true
    } else if (healthPercent < 0.5 && !this.dropped50) {
      this.phase = 2
      this.attackCooldown = 1500
      this.dropped50 = true
    } else if (healthPercent < 0.75 && !this.dropped75) {
      this.phase = 1
      this.attackCooldown = 1800
      this.dropped75 = true
    }
  }

  takeDamage(amount: number) {
    this.health -= amount
  }

  shoot(playerX: number, playerY: number): Bullet[] {
    if (this.attackTimer < this.attackCooldown) {
      return []
    }

    this.attackTimer = 0
    const bullets: Bullet[] = []

    const basePattern = [
      this.spiralPattern.bind(this),
      this.shotgunPattern.bind(this),
      this.circlePattern.bind(this),
      this.aimedPattern.bind(this, playerX, playerY),
      this.wavePattern.bind(this),
      this.crossPattern.bind(this),
      this.randomPattern.bind(this),
      this.burstPattern.bind(this, playerX, playerY),
    ][this.type % 8]

    bullets.push(...basePattern())

    // Add extra patterns based on phase
    if (this.phase >= 1) {
      bullets.push(...this.spiralPattern())
    }
    if (this.phase >= 2) {
      bullets.push(...this.aimedPattern(playerX, playerY))
    }
    if (this.phase >= 3) {
      bullets.push(...this.circlePattern())
      bullets.push(...this.crossPattern())
    }

    return bullets
  }

  private spiralPattern(): Bullet[] {
    const bullets: Bullet[] = []
    const count = 12 + this.phase * 4
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + this.angle
      const speed = 3 + this.phase
      bullets.push(new Bullet(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed, "#ffaa00", 8, false))
    }
    return bullets
  }

  private shotgunPattern(): Bullet[] {
    const bullets: Bullet[] = []
    const count = 8 + this.phase * 2
    const spreadAngle = Math.PI / 3
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (i / (count - 1) - 0.5) * spreadAngle
      const speed = 4 + this.phase
      bullets.push(new Bullet(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed, "#ff6600", 8, false))
    }
    return bullets
  }

  private circlePattern(): Bullet[] {
    const bullets: Bullet[] = []
    const count = 16 + this.phase * 4
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const speed = 2 + this.phase * 0.5
      bullets.push(new Bullet(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed, "#ff00ff", 8, false))
    }
    return bullets
  }

  private aimedPattern(playerX: number, playerY: number): Bullet[] {
    const bullets: Bullet[] = []
    const count = 3 + this.phase
    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(playerY - this.y, playerX - this.x)
      const spreadOffset = (i - count / 2) * 0.2
      const speed = 5 + this.phase
      bullets.push(
        new Bullet(
          this.x,
          this.y,
          Math.cos(angle + spreadOffset) * speed,
          Math.sin(angle + spreadOffset) * speed,
          "#ff0000",
          8,
          false,
        ),
      )
    }
    return bullets
  }

  private wavePattern(): Bullet[] {
    const bullets: Bullet[] = []
    const count = 10 + this.phase * 3
    for (let i = 0; i < count; i++) {
      const xOffset = (i / count - 0.5) * 600
      const speed = 3 + this.phase * 0.5
      bullets.push(new Bullet(this.x + xOffset, this.y, 0, speed, "#00ff00", 8, false))
    }
    return bullets
  }

  private crossPattern(): Bullet[] {
    const bullets: Bullet[] = []
    const directions = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]
    const speed = 4 + this.phase
    for (const angle of directions) {
      for (let i = 0; i < 3 + this.phase; i++) {
        bullets.push(
          new Bullet(
            this.x,
            this.y,
            Math.cos(angle) * speed * (1 + i * 0.3),
            Math.sin(angle) * speed * (1 + i * 0.3),
            "#00ffff",
            8,
            false,
          ),
        )
      }
    }
    return bullets
  }

  private randomPattern(): Bullet[] {
    const bullets: Bullet[] = []
    const count = 15 + this.phase * 5
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 3 + this.phase
      bullets.push(new Bullet(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed, "#ff88ff", 8, false))
    }
    return bullets
  }

  private burstPattern(playerX: number, playerY: number): Bullet[] {
    const bullets: Bullet[] = []
    const angle = Math.atan2(playerY - this.y, playerX - this.x)
    const bursts = 5 + this.phase * 2
    for (let i = 0; i < bursts; i++) {
      const spreadAngle = (i - bursts / 2) * 0.15
      const speed = 6 + this.phase
      bullets.push(
        new Bullet(
          this.x,
          this.y,
          Math.cos(angle + spreadAngle) * speed,
          Math.sin(angle + spreadAngle) * speed,
          "#ffff00",
          8,
          false,
        ),
      )
    }
    return bullets
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y)

    const size = 50
    const wingFlap = Math.sin(this.angle * 3) * 10

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.beginPath()
    ctx.ellipse(0, size + 10, size * 1.2, size * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()

    const colors = [
      { wing: "#8b00ff", body: "#aa00ff", glow: "#aa00ff" },
      { wing: "#00ff88", body: "#00ffaa", glow: "#00ffaa" },
      { wing: "#ffaa00", body: "#ffcc00", glow: "#ffcc00" },
      { wing: "#ff0088", body: "#ff0099", glow: "#ff0099" },
      { wing: "#ff0000", body: "#ff3333", glow: "#ff3333" },
      { wing: "#00aaff", body: "#00ccff", glow: "#00ccff" },
      { wing: "#88ff00", body: "#aaff00", glow: "#aaff00" },
      { wing: "#ff00ff", body: "#ff33ff", glow: "#ff33ff" },
    ]
    const color = colors[this.type % 8]

    // Wings
    ctx.fillStyle = color.wing
    ctx.beginPath()
    ctx.ellipse(-size - wingFlap, 0, size * 0.8, size * 0.6, -0.4, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.ellipse(size + wingFlap, 0, size * 0.8, size * 0.6, 0.4, 0, Math.PI * 2)
    ctx.fill()

    // Body
    ctx.fillStyle = color.body
    ctx.beginPath()
    ctx.ellipse(0, 0, size, size * 1.2, 0, 0, Math.PI * 2)
    ctx.fill()

    // Glow effect
    ctx.shadowBlur = 20
    ctx.shadowColor = color.glow
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 3
    ctx.stroke()

    // Eyes (glowing)
    ctx.shadowBlur = 10
    ctx.fillStyle = "#ff0000"
    ctx.beginPath()
    ctx.arc(-15, -10, 6, 0, Math.PI * 2)
    ctx.arc(15, -10, 6, 0, Math.PI * 2)
    ctx.fill()

    // Crown/accessories
    ctx.shadowBlur = 0
    ctx.fillStyle = "#ffff00"
    ctx.beginPath()
    ctx.moveTo(-10, -size)
    ctx.lineTo(-5, -size - 10)
    ctx.lineTo(0, -size)
    ctx.lineTo(5, -size - 10)
    ctx.lineTo(10, -size)
    ctx.lineTo(0, -size + 5)
    ctx.closePath()
    ctx.fill()

    // Damage cracks
    if (this.health < this.maxHealth * 0.5) {
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-20, -10)
      ctx.lineTo(-10, 10)
      ctx.moveTo(20, -10)
      ctx.lineTo(10, 10)
      ctx.stroke()
    }

    ctx.restore()
  }
}
