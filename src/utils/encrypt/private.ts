import * as CryptoJs from 'crypto-js'

const step = CryptoJs.enc.Utf8.parse('pW8vYTxqLm5kZJ3n')

export function EncryptPrivateInfo(text: string): string {
  const key = CryptoJs.enc.Utf8.parse(process.env.NEST_APP_KEY)
  const srcs = CryptoJs.enc.Utf8.parse(text)
  const encrypted = CryptoJs.AES.encrypt(srcs, key, {
    iv: step,
    mode: CryptoJs.mode.CBC,
    padding: CryptoJs.pad.Pkcs7
  })
  return encrypted.ciphertext.toString().toUpperCase()
}

export function DecryptPrivateInfo(text: string): string {
  const key = CryptoJs.enc.Utf8.parse(process.env.NEST_APP_KEY)
  const encrytedStr = CryptoJs.enc.Hex.parse(text)
  const srcs = CryptoJs.enc.Base64.stringify(encrytedStr)
  const decrypt = CryptoJs.AES.decrypt(srcs, key, {
    iv: step,
    mode: CryptoJs.mode.CBC,
    padding: CryptoJs.pad.Pkcs7
  })
  const decryptedStr = decrypt.toString(CryptoJs.enc.Utf8)
  return decryptedStr.toString()
}
