interface Star {
  x: number
  y: number
  size: number
  speed: number
  brightness: number
  twinkleSpeed: number
  layer: number
}

interface Nebula {
  x: number
  y: number
  size: number
  speed: number
  colors: string[]
  rotation: number
  rotationSpeed: number
}

interface Planet {
  x: number
  y: number
  size: number
  speed: number
  color: string
  rings: boolean
  rotation: number
}

export class Background {
  private width: number
  private height: number
  private stars: Star[] = []
  private nebulas: Nebula[] = []
  private planets: Planet[] = []

  constructor(width: number, height: number) {
    this.width = width
    this.height = height

    this.initStars()
    this.initNebulas()
    this.initPlanets()
  }

  private initStars(): void {
    // Far stars (slow)
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1 + 0.5,
        speed: 20 + Math.random() * 20,
        brightness: Math.random(),
        twinkleSpeed: Math.random() * 2 + 1,
        layer: 0,
      })
    }

    // Mid stars (medium)
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.5 + 1,
        speed: 50 + Math.random() * 30,
        brightness: Math.random(),
        twinkleSpeed: Math.random() * 2 + 1,
        layer: 1,
      })
    }

    // Near stars (fast)
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 1,
        speed: 100 + Math.random() * 50,
        brightness: Math.random(),
        twinkleSpeed: Math.random() * 2 + 1,
        layer: 2,
      })
    }
  }

  private initNebulas(): void {
    for (let i = 0; i < 3; i++) {
      const colors = [
        ["#1a0033", "#330066", "#660099"],
        ["#001a33", "#003366", "#006699"],
        ["#331a00", "#663300", "#996633"],
      ]

      this.nebulas.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 150 + Math.random() * 100,
        speed: 10 + Math.random() * 10,
        colors: colors[i % colors.length],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      })
    }
  }

  private initPlanets(): void {
    for (let i = 0; i < 2; i++) {
      const planetTypes = [
        { color: "#f90", rings: false },
        { color: "#69f", rings: true },
        { color: "#9f6", rings: false },
        { color: "#f66", rings: false },
      ]

      const type = planetTypes[Math.floor(Math.random() * planetTypes.length)]

      this.planets.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.5,
        size: 30 + Math.random() * 40,
        speed: 5 + Math.random() * 10,
        color: type.color,
        rings: type.rings,
        rotation: Math.random() * Math.PI * 2,
      })
    }
  }

  update(deltaTime: number): void {
    // Update stars
    for (const star of this.stars) {
      star.y += star.speed * deltaTime
      star.brightness = Math.sin((Date.now() / 1000) * star.twinkleSpeed) * 0.3 + 0.7

      if (star.y > this.height) {
        star.y = 0
        star.x = Math.random() * this.width
      }
    }

    // Update nebulas
    for (const nebula of this.nebulas) {
      nebula.y += nebula.speed * deltaTime
      nebula.rotation += nebula.rotationSpeed * deltaTime

      if (nebula.y - nebula.size > this.height) {
        nebula.y = -nebula.size
        nebula.x = Math.random() * this.width
      }
    }

    // Update planets
    for (const planet of this.planets) {
      planet.y += planet.speed * deltaTime
      planet.rotation += 0.1 * deltaTime

      if (planet.y - planet.size > this.height) {
        planet.y = -planet.size
        planet.x = Math.random() * this.width
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Space gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height)
    gradient.addColorStop(0, "#000011")
    gradient.addColorStop(0.5, "#000033")
    gradient.addColorStop(1, "#000055")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, this.width, this.height)

    // Render nebulas
    for (const nebula of this.nebulas) {
      ctx.save()
      ctx.translate(nebula.x, nebula.y)
      ctx.rotate(nebula.rotation)
      ctx.globalAlpha = 0.3

      const nebulaGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.size)
      nebula.colors.forEach((color: string, i: number) => {
        nebulaGradient.addColorStop(i / (nebula.colors.length - 1), color)
      })

      ctx.fillStyle = nebulaGradient
      ctx.beginPath()
      ctx.arc(0, 0, nebula.size, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    // Render planets
    for (const planet of this.planets) {
      ctx.save()
      ctx.globalAlpha = 0.8

      // Planet body
      const planetGradient = ctx.createRadialGradient(
        planet.x - planet.size / 3,
        planet.y - planet.size / 3,
        0,
        planet.x,
        planet.y,
        planet.size,
      )
      planetGradient.addColorStop(0, this.lightenColor(planet.color, 40))
      planetGradient.addColorStop(1, this.darkenColor(planet.color, 40))

      ctx.fillStyle = planetGradient
      ctx.beginPath()
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2)
      ctx.fill()

      // Rings
      if (planet.rings) {
        ctx.save()
        ctx.translate(planet.x, planet.y)
        ctx.rotate(planet.rotation)

        ctx.strokeStyle = this.lightenColor(planet.color, 20)
        ctx.lineWidth = 3
        ctx.globalAlpha = 0.6

        ctx.beginPath()
        ctx.ellipse(0, 0, planet.size * 1.5, planet.size * 0.3, 0, 0, Math.PI * 2)
        ctx.stroke()

        ctx.lineWidth = 2
        ctx.globalAlpha = 0.4
        ctx.beginPath()
        ctx.ellipse(0, 0, planet.size * 1.7, planet.size * 0.35, 0, 0, Math.PI * 2)
        ctx.stroke()

        ctx.restore()
      }

      ctx.restore()
    }

    // Render stars by layer
    for (let layer = 0; layer <= 2; layer++) {
      for (const star of this.stars) {
        if (star.layer !== layer) continue

        ctx.globalAlpha = star.brightness
        ctx.fillStyle = "#fff"
        ctx.shadowColor = "#fff"
        ctx.shadowBlur = star.size * 2

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()

        // Star twinkle rays
        if (star.size > 1.5 && star.brightness > 0.8) {
          ctx.strokeStyle = "#fff"
          ctx.lineWidth = 1
          ctx.shadowBlur = 5

          const rayLength = star.size * 3
          ctx.beginPath()
          ctx.moveTo(star.x - rayLength, star.y)
          ctx.lineTo(star.x + rayLength, star.y)
          ctx.moveTo(star.x, star.y - rayLength)
          ctx.lineTo(star.x, star.y + rayLength)
          ctx.stroke()
        }
      }
    }

    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  }

  private lightenColor(color: string, percent: number): string {
    const num = Number.parseInt(color.replace("#", ""), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.min(255, (num >> 16) + amt)
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
    const B = Math.min(255, (num & 0x0000ff) + amt)
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
  }

  private darkenColor(color: string, percent: number): string {
    const num = Number.parseInt(color.replace("#", ""), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.max(0, (num >> 16) - amt)
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt)
    const B = Math.max(0, (num & 0x0000ff) - amt)
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
  }
}
