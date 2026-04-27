import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me')
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-change-me')

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12)
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export async function signAccessToken(payload: { uid: string; email: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(ACCESS_SECRET)
}

export async function signRefreshToken(uid: string) {
  return new SignJWT({ uid })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(REFRESH_SECRET)
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, ACCESS_SECRET)
  return payload as { uid: string; email: string; role: string }
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, REFRESH_SECRET)
  return payload as { uid: string }
}
