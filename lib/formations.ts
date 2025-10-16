import { Enemy } from "./entities/enemy"

export class EnemyFormation {
  private enemies: Enemy[] = []

  constructor(canvasWidth: number, level: number) {
    const formationType = Math.floor(Math.random() * 8) // Increased formation types
    const enemyCount = Math.min(20 + level * 3, 50)
    const enemyType = Math.min(Math.floor(level / 3), 2)

    const behaviors: Array<"static" | "wave" | "circle" | "dive" | "zigzag"> = [
      "static",
      "wave",
      "circle",
      "dive",
      "zigzag",
    ]
    const selectedBehavior = behaviors[level % behaviors.length]

    switch (formationType) {
      case 0:
        this.createVFormation(canvasWidth, enemyCount, enemyType, selectedBehavior)
        break
      case 1:
        this.createGridFormation(canvasWidth, enemyCount, enemyType, selectedBehavior)
        break
      case 2:
        this.createSpiralFormation(canvasWidth, enemyCount, enemyType, selectedBehavior)
        break
      case 3:
        this.createWaveFormation(canvasWidth, enemyCount, enemyType, selectedBehavior)
        break
      case 4:
        this.createCircleFormation(canvasWidth, enemyCount, enemyType, selectedBehavior)
        break
      case 5:
        this.createDiamondFormation(canvasWidth, enemyCount, enemyType, selectedBehavior)
        break
      case 6:
        this.createSwarmFormation(canvasWidth, enemyCount, enemyType, selectedBehavior)
        break
      case 7:
        this.createFlockFormation(canvasWidth, enemyCount, enemyType, selectedBehavior)
        break
    }
  }

  private createVFormation(
    canvasWidth: number,
    count: number,
    type: number,
    behavior: "static" | "wave" | "circle" | "dive" | "zigzag",
  ) {
    const centerX = canvasWidth / 2
    const spacing = 40

    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 2)
      const side = i % 2 === 0 ? -1 : 1
      const x = centerX + side * row * spacing
      const y = 50 + row * spacing

      if (x >= 50 && x <= canvasWidth - 50) {
        const enemy = new Enemy(x, y, type)
        enemy.setBehavior(behavior, 0, 0.2)
        this.enemies.push(enemy)
      }
    }
  }

  private createGridFormation(
    canvasWidth: number,
    count: number,
    type: number,
    behavior: "static" | "wave" | "circle" | "dive" | "zigzag",
  ) {
    const cols = Math.ceil(Math.sqrt(count))
    const rows = Math.ceil(count / cols)
    const spacing = 50
    const padding = 60
    const availableWidth = canvasWidth - padding * 2
    const actualSpacing = Math.min(spacing, availableWidth / (cols - 1))
    const startX = padding

    for (let i = 0; i < count; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = startX + col * actualSpacing
      const y = 50 + row * spacing

      if (x >= padding && x <= canvasWidth - padding) {
        const enemy = new Enemy(x, y, type)
        enemy.setBehavior(behavior, 0, 0.1)
        this.enemies.push(enemy)
      }
    }
  }

  private createSpiralFormation(
    canvasWidth: number,
    count: number,
    type: number,
    behavior: "static" | "wave" | "circle" | "dive" | "zigzag",
  ) {
    const centerX = canvasWidth / 2
    const centerY = 150
    const maxRadius = Math.min(canvasWidth / 2 - 60, 200)

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 4
      const radius = 50 + (i / count) * maxRadius
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius * 0.5

      if (x >= 50 && x <= canvasWidth - 50 && y >= 30 && y <= 300) {
        const enemy = new Enemy(x, y, type)
        enemy.setBehavior(behavior, 0, 0.15)
        this.enemies.push(enemy)
      }
    }
  }

  private createWaveFormation(
    canvasWidth: number,
    count: number,
    type: number,
    behavior: "static" | "wave" | "circle" | "dive" | "zigzag",
  ) {
    const padding = 60
    const availableWidth = canvasWidth - padding * 2
    const spacing = Math.max(40, availableWidth / count)
    const actualCount = Math.floor(availableWidth / spacing)

    for (let i = 0; i < actualCount; i++) {
      const x = padding + spacing * i
      const y = 100 + Math.sin((i / actualCount) * Math.PI * 4) * 50

      if (x >= padding && x <= canvasWidth - padding) {
        const enemy = new Enemy(x, y, type)
        enemy.setBehavior(behavior, 0, 0.2)
        this.enemies.push(enemy)
      }
    }
  }

  private createCircleFormation(
    canvasWidth: number,
    count: number,
    type: number,
    behavior: "static" | "wave" | "circle" | "dive" | "zigzag",
  ) {
    const centerX = canvasWidth / 2
    const centerY = 150
    const radius = Math.min(150, canvasWidth / 3)

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius * 0.6

      if (x >= 50 && x <= canvasWidth - 50 && y >= 30 && y <= 300) {
        const enemy = new Enemy(x, y, type)
        enemy.setBehavior(behavior, 0, 0.1)
        this.enemies.push(enemy)
      }
    }
  }

  private createDiamondFormation(
    canvasWidth: number,
    count: number,
    type: number,
    behavior: "static" | "wave" | "circle" | "dive" | "zigzag",
  ) {
    const centerX = canvasWidth / 2
    const centerY = 120
    const size = Math.min(150, canvasWidth / 4)
    const perSide = Math.ceil(count / 4)

    for (let i = 0; i < count; i++) {
      const side = Math.floor(i / perSide)
      const pos = (i % perSide) / perSide
      let x = centerX
      let y = centerY

      switch (side) {
        case 0: // Top
          x = centerX + (pos - 0.5) * size * 2
          y = centerY - size * pos
          break
        case 1: // Right
          x = centerX + size * pos
          y = centerY + (pos - 0.5) * size * 2
          break
        case 2: // Bottom
          x = centerX - (pos - 0.5) * size * 2
          y = centerY + size * pos
          break
        case 3: // Left
          x = centerX - size * pos
          y = centerY - (pos - 0.5) * size * 2
          break
      }

      if (x >= 50 && x <= canvasWidth - 50 && y >= 30 && y <= 300) {
        const enemy = new Enemy(x, y, type)
        enemy.setBehavior(behavior, 0, 0.15)
        this.enemies.push(enemy)
      }
    }
  }

  private createSwarmFormation(
    canvasWidth: number,
    count: number,
    type: number,
    behavior: "static" | "wave" | "circle" | "dive" | "zigzag",
  ) {
    const clusters = Math.min(5, Math.ceil(count / 8))
    const enemiesPerCluster = Math.ceil(count / clusters)

    for (let c = 0; c < clusters; c++) {
      const clusterX = 100 + (c / clusters) * (canvasWidth - 200)
      const clusterY = 80 + Math.random() * 100

      for (let i = 0; i < enemiesPerCluster && this.enemies.length < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = Math.random() * 50
        const x = clusterX + Math.cos(angle) * distance
        const y = clusterY + Math.sin(angle) * distance * 0.6

        if (x >= 50 && x <= canvasWidth - 50 && y >= 30 && y <= 300) {
          const enemy = new Enemy(x, y, type)
          enemy.setBehavior(behavior, (Math.random() - 0.5) * 0.5, 0.1)
          this.enemies.push(enemy)
        }
      }
    }
  }

  private createFlockFormation(
    canvasWidth: number,
    count: number,
    type: number,
    behavior: "static" | "wave" | "circle" | "dive" | "zigzag",
  ) {
    const flocks = Math.min(3, Math.ceil(count / 10))
    const enemiesPerFlock = Math.ceil(count / flocks)

    for (let f = 0; f < flocks; f++) {
      const flockX = 100 + (f / flocks) * (canvasWidth - 200)
      const flockY = 60 + f * 60
      const flockVx = (Math.random() - 0.5) * 1

      for (let i = 0; i < enemiesPerFlock && this.enemies.length < count; i++) {
        const offsetX = (i % 5) * 40 - 80
        const offsetY = Math.floor(i / 5) * 35
        const x = flockX + offsetX
        const y = flockY + offsetY

        if (x >= 50 && x <= canvasWidth - 50 && y >= 30 && y <= 300) {
          const enemy = new Enemy(x, y, type)
          enemy.setBehavior(behavior, flockVx, 0.15)
          this.enemies.push(enemy)
        }
      }
    }
  }

  getEnemies(): Enemy[] {
    return this.enemies
  }
}
