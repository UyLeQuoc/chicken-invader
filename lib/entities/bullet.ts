export class Bullet {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  explosive: boolean

  constructor(x: number, y: number, vx: number, vy: number, color: string, size: number, explosive = false) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.color = color
    this.size = size
    this.explosive = explosive
  }

  update(deltaTime: number) {
    this.x += this.vx * (deltaTime / 16)
    this.y += this.vy * (deltaTime / 16)
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()

    if (this.explosive) {
      ctx.shadowBlur = 20
      ctx.shadowColor = "#ff8800"

      // Outer explosive ring
      ctx.strokeStyle = "#ff8800"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      ctx.shadowBlur = 10
      ctx.shadowColor = this.color
    }

    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()

    // Bright center
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
}
