export const debugLog = function (...args: unknown[]) {
  if (import.meta.env.DEV) {
    console.log(...args)
  }
}
