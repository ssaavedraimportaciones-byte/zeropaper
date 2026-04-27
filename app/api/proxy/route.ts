import { NextRequest, NextResponse } from 'next/server'
import { getApp } from 'firebase-admin/app'

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID!
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

// Allowed path prefixes (allowlist to prevent abuse)
const ALLOWED_PREFIXES = ['usuarios/', 'empresas/', 'codigoEmpresas/']

function isAllowed(path: string) {
  return ALLOWED_PREFIXES.some(p => path.startsWith(p))
}

async function getAccessToken(): Promise<string> {
  const app = getApp()
  const token = await (app.options.credential as any).getAccessToken()
  return token.access_token
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const fsPath = url.searchParams.get('path') ?? ''
  const pageSize = url.searchParams.get('pageSize')

  if (!isAllowed(fsPath)) {
    return NextResponse.json({ error: 'Ruta no permitida' }, { status: 403 })
  }

  try {
    const token = await getAccessToken()
    const target = `${FS_BASE}/${fsPath}${pageSize ? `?pageSize=${pageSize}` : ''}`
    const res = await fetch(target, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Error Firestore' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const fsPath = url.searchParams.get('path') ?? ''

  if (!isAllowed(fsPath)) {
    return NextResponse.json({ error: 'Ruta no permitida' }, { status: 403 })
  }

  try {
    const token = await getAccessToken()
    const body = await req.text()
    const res = await fetch(`${FS_BASE}/${fsPath}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Error Firestore' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url)
  const fsPath = url.searchParams.get('path') ?? ''

  if (!isAllowed(fsPath)) {
    return NextResponse.json({ error: 'Ruta no permitida' }, { status: 403 })
  }

  try {
    const token = await getAccessToken()
    const body = await req.text()
    const res = await fetch(`${FS_BASE}/${fsPath}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Error Firestore' }, { status: 500 })
  }
}
