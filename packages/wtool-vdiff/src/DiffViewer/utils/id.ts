let idIndex = 0

export const createUniqueId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  idIndex += 1
  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${idIndex}`
}
