import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/firebase-admin'
import { hashPassword, verifyPassword, signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  company: z.string().min(2),
})

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const action = url.searchParams.get('action') ?? 'login'

  try {
    if (action === 'register') {
      const body = registerSchema.parse(await req.json())
      const existing = await db.collection('users').where('email', '==', body.email).limit(1).get()
      if (!existing.empty) return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })

      const hash = await hashPassword(body.password)
      const ref = await db.collection('users').add({
        email: body.email,
        name: body.name,
        company: body.company,
        passwordHash: hash,
        role: 'operator',
        plan: 'trial',
        createdAt: new Date().toISOString(),
      })

      const access = await signAccessToken({ uid: ref.id, email: body.email, role: 'operator' })
      const refresh = await signRefreshToken(ref.id)
      return NextResponse.json({ access, refresh }, { status: 201 })
    }

    if (action === 'login') {
      const body = loginSchema.parse(await req.json())
      const snap = await db.collection('users').where('email', '==', body.email).limit(1).get()
      if (snap.empty) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })

      const doc = snap.docs[0]
      const data = doc.data()
      const ok = await verifyPassword(body.password, data.passwordHash)
      if (!ok) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })

      const access = await signAccessToken({ uid: doc.id, email: data.email, role: data.role })
      const refresh = await signRefreshToken(doc.id)
      return NextResponse.json({ access, refresh })
    }

    if (action === 'refresh') {
      const { refresh } = await req.json()
      const { uid } = await verifyRefreshToken(refresh)
      const snap = await db.collection('users').doc(uid).get()
      if (!snap.exists) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

      const data = snap.data()!
      const access = await signAccessToken({ uid, email: data.email, role: data.role })
      return NextResponse.json({ access })
    }

    return NextResponse.json({ error: 'Acción desconocida' }, { status: 400 })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 422 })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
