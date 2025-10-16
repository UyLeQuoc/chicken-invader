export class Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
  maxLife: number

  constructor(x: number, y: number, vx: number, vy: number, color: string, life: number) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.color = color
    this.life = life
    this.maxLife = life
  }

  update(deltaTime: number) {
    this.x += this.vx * (deltaTime / 16)
    this.y += this.vy * (deltaTime / 16)
    this.life -= deltaTime / 16
    this.vy += 0.1 // Gravity
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = this.life / this.maxLife
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}
