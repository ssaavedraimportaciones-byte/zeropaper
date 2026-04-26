import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/firebase-admin'
import { verifyAccessToken } from '@/lib/auth'

async function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) throw new Error('No autorizado')
  return verifyAccessToken(auth.slice(7))
}

const operationSchema = z.object({
  type: z.enum(['EIR', 'DAM', 'DUS', 'BL', 'OTRO']),
  plate: z.string().min(1),
  company: z.string().min(1),
  folio: z.string().optional(),
  notes: z.string().optional(),
  photoUrl: z.string().url().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    const url = new URL(req.url)
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200)
    const after = url.searchParams.get('after')

    let query = db.collection('operations')
      .where('companyId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)

    if (after) query = query.startAfter(after)

    const snap = await query.get()
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req)
    const body = operationSchema.parse(await req.json())

    const ref = await db.collection('operations').add({
      ...body,
      companyId: user.uid,
      createdBy: user.email,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ id: ref.id }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 422 })
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser(req)
    const { id } = await req.json()
    const doc = await db.collection('operations').doc(id).get()
    if (!doc.exists || doc.data()?.companyId !== user.uid) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }
    await db.collection('operations').doc(id).delete()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
}
