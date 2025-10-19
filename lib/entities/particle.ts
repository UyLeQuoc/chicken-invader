import type { ParticleType } from "../types"

export class Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  maxLife: number
  life: number
  size: number
  type: ParticleType
  layer: number
  gravity: number
  friction: number
  rotation: number
  rotationSpeed: number
  alpha: number

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    life: number,
    size: number,
    type: ParticleType = "circle",
  ) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.color = color
    this.maxLife = life
    this.life = life
    this.size = size
    this.type = type
    this.layer = 1
    this.gravity = 100
    this.friction = 0.98
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 10
    this.alpha = 1
  }

  update(deltaTime: number): void {
    this.vx *= this.friction
    this.vy *= this.friction
    this.vy += this.gravity * deltaTime

    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime

    this.rotation += this.rotationSpeed * deltaTime

    this.life -= deltaTime
    this.alpha = this.life / this.maxLife
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.globalAlpha = this.alpha

    switch (this.type) {
      case "circle":
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.shadowColor = this.color
        ctx.shadowBlur = this.size * 2
        ctx.fill()
        break

      case "feather":
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)

        ctx.beginPath()
        ctx.ellipse(0, 0, this.size / 2, this.size, 0, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()

        ctx.strokeStyle = "#ddd"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, -this.size)
        ctx.lineTo(0, this.size)
        ctx.stroke()
        break

      case "square":
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.fillStyle = this.color
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
        break

      case "spark":
        ctx.strokeStyle = this.color
        ctx.lineWidth = this.size
        ctx.lineCap = "round"
        ctx.shadowColor = this.color
        ctx.shadowBlur = this.size * 3
        ctx.beginPath()
        ctx.moveTo(this.x - this.vx * 0.01, this.y - this.vy * 0.01)
        ctx.lineTo(this.x, this.y)
        ctx.stroke()
        break
    }

    ctx.restore()
  }
}
