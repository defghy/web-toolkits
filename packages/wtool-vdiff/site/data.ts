import oldJson from './assets/old.json'
import newJson from './assets/new.json'
import miniPatch from './assets/miniPatch.json'
import largePatch from './assets/largePatch.json'
import oldE1 from './assets/oldE1.json'
import newE1 from './assets/newE1.json'

export const pair = [
  { filename: 'old.json', content: JSON.stringify(oldJson, null, 4) },
  { filename: 'new.json', content: JSON.stringify(newJson, null, 4) },
]

export const pairLarge = [
  { filename: 'old.json', content: JSON.stringify(oldE1, null, 4) },
  { filename: 'new.json', content: JSON.stringify(newE1, null, 4) },
]

export const patch = miniPatch.patch
export const patchLarge = largePatch.patch
