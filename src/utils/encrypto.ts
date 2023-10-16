import * as crypto from 'crypto-js'

export function generateSalt() {
  return crypto.lib.WordArray.random(16).toString()
}

export function encrypt(password: string, salt: string) {
  return crypto.PBKDF2(password, salt, { keySize: 16, iterations: 1000 })
}
