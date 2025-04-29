import { describe, test, expect } from '@jest/globals'
import WalletManagerEvm from './wallet-manager-evm.js'

describe('WalletManagerEvm', () => {
  test('generates a valid 12-word seed phrase', () => {
    const seedPhrase = WalletManagerEvm.getRandomSeedPhrase()

    expect(WalletManagerEvm.isValidSeedPhrase(seedPhrase)).toBe(true)

    const words = seedPhrase.trim().split(/\s+/)
    expect(words.length).toBe(12)

    words.forEach(word => {
      expect(typeof word).toBe('string')
      expect(word.length).toBeGreaterThan(0)
    })
  })
})
