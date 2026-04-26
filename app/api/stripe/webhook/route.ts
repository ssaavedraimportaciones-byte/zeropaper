import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/firebase-admin'

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!
  const raw = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature inválida' }, { status: 400 })
  }

  const session = event.data.object as any

  if (event.type === 'checkout.session.completed') {
    const { uid, plan } = session.metadata
    await db.collection('users').doc(uid).update({
      plan,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      planActivatedAt: new Date().toISOString(),
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    const snap = await db.collection('users')
      .where('stripeSubscriptionId', '==', session.id)
      .limit(1).get()
    if (!snap.empty) {
      await snap.docs[0].ref.update({ plan: 'trial', stripeSubscriptionId: null })
    }
  }

  return NextResponse.json({ received: true })
}
