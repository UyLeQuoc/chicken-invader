export interface GameObject {
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
}

export type PowerupType =
  | "weapon"
  | "firerate"
  | "spread"
  | "shield"
  | "bomb"
  | "health"
  | "invincible"
  | "speed"
  | "multiplier"
  | "slowmo"

export type ProjectileType = "bullet" | "laser" | "egg"

export type ParticleType = "circle" | "feather" | "square" | "spark"
