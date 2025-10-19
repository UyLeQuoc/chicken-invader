interface Star {
  x: number
  y: number
  size: number
  speed: number
  brightness: number
  twinkleSpeed: number
  layer: number
  color: string
}

interface Nebula {
  x: number
  y: number
  size: number
  speed: number
  colors: string[]
  rotation: number
  rotationSpeed: number
  opacity: number
}

interface Planet {
  x: number
  y: number
  size: number
  speed: number
  color: string
  rings: boolean
  rotation: number
  detail: number
}

interface ShootingStar {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  brightness: number
  active: boolean
}

interface Galaxy {
  x: number
  y: number
  size: number
  rotation: number
  rotationSpeed: number
  arms: number
  color: string
}

interface Asteroid {
  x: number
  y: number
  size: number
  speed: number
  rotation: number
  rotationSpeed: number
  points: { x: number; y: number }[]
}

export class Background {
  private width: number
  private height: number
  private stars: Star[] = []
  private nebulas: Nebula[] = []
  private planets: Planet[] = []
  private shootingStars: ShootingStar[] = []
  private galaxies: Galaxy[] = []
  private asteroids: Asteroid[] = []
  private shootingStarTimer = 0

  constructor(width: number, height: number) {
    this.width = width
    this.height = height

    this.initStars()
    this.initNebulas()
    this.initPlanets()
    this.initGalaxies()
    this.initAsteroids()
  }

  private initStars(): void {
    const starColors = ["#ffffff", "#ffffaa", "#aaaaff", "#ffaaaa", "#aaffaa"]

    // Far stars (slow)
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1 + 0.5,
        speed: 20 + Math.random() * 20,
        brightness: Math.random(),
        twinkleSpeed: Math.random() * 2 + 1,
        layer: 0,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      })
    }

    // Mid stars (medium)
    for (let i = 0; i < 120; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.5 + 1,
        speed: 50 + Math.random() * 30,
        brightness: Math.random(),
        twinkleSpeed: Math.random() * 2 + 1,
        layer: 1,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      })
    }

    // Near stars (fast)
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 1.5,
        speed: 100 + Math.random() * 50,
        brightness: Math.random(),
        twinkleSpeed: Math.random() * 2 + 1,
        layer: 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      })
    }
  }

  private initNebulas(): void {
    for (let i = 0; i < 5; i++) {
      const colorSets = [
        ["#2a0a4a", "#4a1a8a", "#7a3aca", "#aa5afa"],
        ["#0a2a4a", "#1a4a8a", "#3a7aca", "#5aaaff"],
        ["#4a2a0a", "#8a4a1a", "#ca7a3a", "#ffaa5a"],
        ["#0a4a2a", "#1a8a4a", "#3aca7a", "#5affaa"],
        ["#4a0a2a", "#8a1a4a", "#ca3a7a", "#ff5aaa"],
      ]

      this.nebulas.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 200 + Math.random() * 150,
        speed: 8 + Math.random() * 12,
        colors: colorSets[i % colorSets.length],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        opacity: 0.2 + Math.random() * 0.2,
      })
    }
  }

  private initPlanets(): void {
    for (let i = 0; i < 3; i++) {
      const planetTypes = [
        { color: "#ff8844", rings: false },
        { color: "#6699ff", rings: true },
        { color: "#99ff66", rings: false },
        { color: "#ff6666", rings: false },
        { color: "#ffcc44", rings: true },
        { color: "#cc66ff", rings: false },
      ]

      const type = planetTypes[Math.floor(Math.random() * planetTypes.length)]

      this.planets.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.5,
        size: 35 + Math.random() * 50,
        speed: 4 + Math.random() * 8,
        color: type.color,
        rings: type.rings,
        rotation: Math.random() * Math.PI * 2,
        detail: Math.random(),
      })
    }
  }

  private initGalaxies(): void {
    for (let i = 0; i < 2; i++) {
      const galaxyColors = ["#8844ff", "#44ffff", "#ff44ff", "#ffff44"]

      this.galaxies.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.4,
        size: 60 + Math.random() * 40,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        arms: 3 + Math.floor(Math.random() * 3),
        color: galaxyColors[Math.floor(Math.random() * galaxyColors.length)],
      })
    }
  }

  private initAsteroids(): void {
    for (let i = 0; i < 8; i++) {
      const numPoints = 6 + Math.floor(Math.random() * 4)
      const points: { x: number; y: number }[] = []
      const baseSize = 3 + Math.random() * 5

      for (let j = 0; j < numPoints; j++) {
        const angle = (j / numPoints) * Math.PI * 2
        const radius = baseSize * (0.7 + Math.random() * 0.6)
        points.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        })
      }

      this.asteroids.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: baseSize,
        speed: 30 + Math.random() * 40,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2,
        points,
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

    // Update asteroids
    for (const asteroid of this.asteroids) {
      asteroid.y += asteroid.speed * deltaTime
      asteroid.rotation += asteroid.rotationSpeed * deltaTime

      if (asteroid.y > this.height + 20) {
        asteroid.y = -20
        asteroid.x = Math.random() * this.width
      }
    }

    // Spawn shooting stars
    this.shootingStarTimer -= deltaTime
    if (this.shootingStarTimer <= 0) {
      this.shootingStarTimer = 2 + Math.random() * 3
      this.shootingStars.push({
        x: Math.random() * this.width,
        y: -10,
        length: 30 + Math.random() * 50,
        speed: 400 + Math.random() * 300,
        angle: Math.PI / 4 + Math.random() * Math.PI / 6,
        brightness: 1,
        active: true,
      })
    }

    // Update shooting stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i]
      if (!star.active) continue

      star.x += Math.cos(star.angle) * star.speed * deltaTime
      star.y += Math.sin(star.angle) * star.speed * deltaTime
      star.brightness -= deltaTime * 0.8

      if (star.brightness <= 0 || star.y > this.height || star.x > this.width) {
        this.shootingStars.splice(i, 1)
      }
    }

    // Update galaxies (very slow rotation)
    for (const galaxy of this.galaxies) {
      galaxy.rotation += galaxy.rotationSpeed * deltaTime * 0.1
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Darker space gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height)
    gradient.addColorStop(0, "#000011")
    gradient.addColorStop(0.3, "#000022")
    gradient.addColorStop(0.6, "#000033")
    gradient.addColorStop(1, "#000044")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, this.width, this.height)

    // Render distant galaxies
    for (const galaxy of this.galaxies) {
      ctx.save()
      ctx.translate(galaxy.x, galaxy.y)
      ctx.rotate(galaxy.rotation)
      ctx.globalAlpha = 0.08

      // Galaxy core
      const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size * 0.3)
      coreGradient.addColorStop(0, "#ffffff")
      coreGradient.addColorStop(0.5, galaxy.color)
      coreGradient.addColorStop(1, "transparent")
      ctx.fillStyle = coreGradient
      ctx.beginPath()
      ctx.arc(0, 0, galaxy.size * 0.3, 0, Math.PI * 2)
      ctx.fill()

      // Spiral arms
      ctx.globalAlpha = 0.05
      for (let arm = 0; arm < galaxy.arms; arm++) {
        const armAngle = (arm / galaxy.arms) * Math.PI * 2
        ctx.save()
        ctx.rotate(armAngle)

        for (let i = 0; i < 20; i++) {
          const dist = (i / 20) * galaxy.size
          const angle = (i / 20) * Math.PI
          const x = Math.cos(angle) * dist
          const y = Math.sin(angle) * dist

          const armGradient = ctx.createRadialGradient(x, y, 0, x, y, 5 + i)
          armGradient.addColorStop(0, galaxy.color)
          armGradient.addColorStop(1, "transparent")
          ctx.fillStyle = armGradient
          ctx.beginPath()
          ctx.arc(x, y, 5 + i, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }

      ctx.restore()
    }

    // Render nebulas with improved visuals
    for (const nebula of this.nebulas) {
      ctx.save()
      ctx.translate(nebula.x, nebula.y)
      ctx.rotate(nebula.rotation)
      ctx.globalAlpha = nebula.opacity

      // Multiple gradient layers for depth
      for (let layer = 0; layer < 3; layer++) {
        const layerSize = nebula.size * (1 - layer * 0.2)
        const nebulaGradient = ctx.createRadialGradient(
          Math.sin(layer) * 10,
          Math.cos(layer) * 10,
          0,
          0,
          0,
          layerSize,
        )

        nebula.colors.forEach((color: string, i: number) => {
          nebulaGradient.addColorStop(i / (nebula.colors.length - 1), color)
        })
        nebulaGradient.addColorStop(1, "transparent")

        ctx.fillStyle = nebulaGradient
        ctx.beginPath()
        ctx.arc(0, 0, layerSize, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    // Render planets with improved details
    for (const planet of this.planets) {
      ctx.save()
      ctx.globalAlpha = 0.3

      // Planet shadow/terminator
      ctx.shadowColor = "rgba(0,0,0,0.5)"
      ctx.shadowBlur = 15

      // Planet body with better gradient
      const planetGradient = ctx.createRadialGradient(
        planet.x - planet.size / 2.5,
        planet.y - planet.size / 2.5,
        planet.size * 0.1,
        planet.x,
        planet.y,
        planet.size * 1.2,
      )
      planetGradient.addColorStop(0, this.lightenColor(planet.color, 60))
      planetGradient.addColorStop(0.4, planet.color)
      planetGradient.addColorStop(1, this.darkenColor(planet.color, 50))

      ctx.fillStyle = planetGradient
      ctx.beginPath()
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2)
      ctx.fill()

      // Planet details/atmosphere
      if (planet.detail > 0.5) {
        ctx.globalAlpha = 0.3
        ctx.fillStyle = this.lightenColor(planet.color, 30)
        ctx.beginPath()
        ctx.ellipse(
          planet.x,
          planet.y - planet.size * 0.3,
          planet.size * 0.6,
          planet.size * 0.2,
          0,
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }

      // Rings
      if (planet.rings) {
        ctx.save()
        ctx.translate(planet.x, planet.y)
        ctx.rotate(planet.rotation)

        // Multiple ring layers
        for (let ring = 0; ring < 3; ring++) {
          const ringSize = 1.5 + ring * 0.15
          const ringThickness = 0.3 + ring * 0.05
          const ringAlpha = 0.7 - ring * 0.2

          const ringGradient = ctx.createLinearGradient(
            -planet.size * ringSize,
            0,
            planet.size * ringSize,
            0,
          )
          ringGradient.addColorStop(0, "transparent")
          ringGradient.addColorStop(0.3, this.lightenColor(planet.color, 30))
          ringGradient.addColorStop(0.5, this.lightenColor(planet.color, 50))
          ringGradient.addColorStop(0.7, this.lightenColor(planet.color, 30))
          ringGradient.addColorStop(1, "transparent")

          ctx.strokeStyle = ringGradient
          ctx.lineWidth = 4
          ctx.globalAlpha = ringAlpha

          ctx.beginPath()
          ctx.ellipse(0, 0, planet.size * ringSize, planet.size * ringThickness, 0, 0, Math.PI * 2)
          ctx.stroke()
        }

        ctx.restore()
      }

      ctx.shadowBlur = 0
      ctx.restore()
    }

    // Render asteroids
    for (const asteroid of this.asteroids) {
      ctx.save()
      ctx.translate(asteroid.x, asteroid.y)
      ctx.rotate(asteroid.rotation)

      ctx.fillStyle = "#666666"
      ctx.strokeStyle = "#444444"
      ctx.lineWidth = 1

      ctx.beginPath()
      ctx.moveTo(asteroid.points[0].x, asteroid.points[0].y)
      for (let i = 1; i < asteroid.points.length; i++) {
        ctx.lineTo(asteroid.points[i].x, asteroid.points[i].y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.restore()
    }

    // Render stars by layer (dimmed for better visibility)
    for (let layer = 0; layer <= 2; layer++) {
      for (const star of this.stars) {
        if (star.layer !== layer) continue

        ctx.globalAlpha = star.brightness * 0.4
        ctx.fillStyle = star.color
        ctx.shadowColor = star.color
        ctx.shadowBlur = star.size

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 0.8, 0, Math.PI * 2)
        ctx.fill()

        // Star twinkle rays (dimmed)
        if (star.size > 1.5 && star.brightness > 0.8) {
          ctx.strokeStyle = star.color
          ctx.lineWidth = 0.5
          ctx.shadowBlur = 3
          ctx.globalAlpha = star.brightness * 0.3

          const rayLength = star.size * 2
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
