import type { GameObject } from "./types"

export function checkCircleCollision(
  obj1: GameObject,
  obj2: GameObject,
  radius1: number,
  radius2: number,
): boolean {
  const dx = obj1.x - obj2.x
  const dy = obj1.y - obj2.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < radius1 + radius2
}

export function checkRectCollision(
  obj1: GameObject,
  obj2: GameObject,
  width1: number,
  height1: number,
  width2: number,
  height2: number,
): boolean {
  return (
    obj1.x < obj2.x + width2 &&
    obj1.x + width1 > obj2.x &&
    obj1.y < obj2.y + height2 &&
    obj1.y + height1 > obj2.y
  )
}
