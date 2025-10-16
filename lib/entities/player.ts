export class Player {
  x: number
  y: number
  invulnerable = false
  private invulnerableTimer = 0
  private shieldAngle = 0

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  update(deltaTime: number, shieldCount: number) {
    if (this.invulnerable) {
      this.invulnerableTimer += deltaTime
    }
    this.shieldAngle += deltaTime * 0.003
  }

  checkShieldCollision(bulletX: number, bulletY: number, shieldRadius: number): boolean {
    // Shield pieces orbit around player
    const shieldCount = 10 // Max shield pieces
    for (let i = 0; i < shieldCount; i++) {
      const angle = this.shieldAngle + (i / shieldCount) * Math.PI * 2
      const shieldX = this.x + Math.cos(angle) * shieldRadius
      const shieldY = this.y + Math.sin(angle) * shieldRadius
      const dx = bulletX - shieldX
      const dy = bulletY - shieldY
      if (Math.sqrt(dx * dx + dy * dy) < 10) {
        return true
      }
    }
    return false
  }

  draw(ctx: CanvasRenderingContext2D, shieldCount = 0) {
    if (shieldCount > 0) {
      const shieldRadius = 40
      for (let i = 0; i < shieldCount; i++) {
        const angle = this.shieldAngle + (i / 10) * Math.PI * 2
        const shieldX = this.x + Math.cos(angle) * shieldRadius
        const shieldY = this.y + Math.sin(angle) * shieldRadius

        ctx.save()
        ctx.translate(shieldX, shieldY)
        ctx.rotate(angle)

        // Shield piece - larger and more visible
        ctx.fillStyle = "#00ffff"
        ctx.shadowBlur = 15
        ctx.shadowColor = "#00ffff"
        ctx.beginPath()
        ctx.arc(0, 0, 8, 0, Math.PI * 2)
        ctx.fill()

        // Shield glow ring
        ctx.strokeStyle = "#00ffff"
        ctx.lineWidth = 3
        ctx.stroke()

        // Inner glow
        ctx.fillStyle = "rgba(0, 255, 255, 0.5)"
        ctx.beginPath()
        ctx.arc(0, 0, 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }

      // Shield orbit ring - more visible
      ctx.strokeStyle = "rgba(0, 255, 255, 0.4)"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.arc(this.x, this.y, shieldRadius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Flicker when invulnerable
    if (this.invulnerable && Math.floor(this.invulnerableTimer / 100) % 2 === 0) {
      return
    }

    ctx.save()
    ctx.translate(this.x, this.y)

    // Ship body (triangle)
    ctx.fillStyle = "#00ffff"
    ctx.beginPath()
    ctx.moveTo(0, -20)
    ctx.lineTo(-15, 15)
    ctx.lineTo(15, 15)
    ctx.closePath()
    ctx.fill()

    // Glow effect
    ctx.shadowBlur = 15
    ctx.shadowColor = "#00ffff"
    ctx.strokeStyle = "#00ffff"
    ctx.lineWidth = 2
    ctx.stroke()

    // Cockpit
    ctx.shadowBlur = 0
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(0, -5, 4, 0, Math.PI * 2)
    ctx.fill()

    // Engine thrusters
    const thrusterFlicker = Math.random() * 0.3 + 0.7
    ctx.fillStyle = `rgba(255, 150, 0, ${thrusterFlicker})`
    ctx.beginPath()
    ctx.moveTo(-10, 15)
    ctx.lineTo(-8, 25)
    ctx.lineTo(-12, 25)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(10, 15)
    ctx.lineTo(8, 25)
    ctx.lineTo(12, 25)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }
}
