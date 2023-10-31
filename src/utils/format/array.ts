export const FlattenArray = <T extends Record<string, unknown>>(
  target: T[],
  targetKey: keyof T,
  depth?: number
): T[] => {
  let result = []
  if (typeof depth === 'number' && depth === 0) {
    return result
  }

  for (const message of target) {
    result.push(message)
    const subTarget = message[targetKey] as T[]
    if (subTarget && subTarget.length > 0) {
      result = result.concat(FlattenArray(subTarget, targetKey, depth - 1))
    }
  }
  return result
}
