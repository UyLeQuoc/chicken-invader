interface Star {
  x: number
  y: number
  size: number
  speed: number
  brightness: number
}

export class StarField {
  private stars: Star[] = []
  private width: number
  private height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height

    // Create stars in multiple layers
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.5,
      })
    }
  }

  update(deltaTime: number) {
    this.stars.forEach((star) => {
      star.y += star.speed * (deltaTime / 16)
      if (star.y > this.height) {
        star.y = 0
        star.x = Math.random() * this.width
      }
    })
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.stars.forEach((star) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fill()
    })
  }
}
