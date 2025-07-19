import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'smart-recipe-finder-3jik8jr1',
  authRequired: true
})

export default blink