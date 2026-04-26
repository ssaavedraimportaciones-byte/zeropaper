import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'

let db: Firestore | null = null
let adminAuth: Auth | null = null

function initFirebase() {
  if (db && adminAuth) return

  const apps = getApps()
  if (!apps.length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }

  db = getFirestore()
  adminAuth = getAuth()
}

export function getDb(): Firestore {
  initFirebase()
  return db!
}

export function getAdminAuth(): Auth {
  initFirebase()
  return adminAuth!
}
