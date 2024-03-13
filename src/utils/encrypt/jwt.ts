import * as crypto from 'crypto-js'

// JWT
export function generateSalt() {
  return crypto.lib.WordArray.random(16).toString()
}

export function encrypt(password: string, salt: string) {
  return crypto.PBKDF2(password, salt, { keySize: 16, iterations: 1000 }).toString()
}

export function compare(pwd: string, hashPwd: string, salt: string) {
  return encrypt(pwd, salt) === hashPwd
}
