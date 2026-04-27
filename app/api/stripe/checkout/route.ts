import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe, PLANS } from '@/lib/stripe'
import { verifyAccessToken } from '@/lib/auth'

const schema = z.object({
  plan: z.enum(['starter', 'pro', 'enterprise']),
})

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const user = await verifyAccessToken(auth.slice(7))

    const { plan } = schema.parse(await req.json())

    if (plan === 'enterprise') {
      return NextResponse.json({ redirect: 'https://wa.me/56995854721?text=Quiero%20Enterprise%20ZeroPaper' })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
      metadata: { uid: user.uid, plan },
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgraded=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?cancelled=1`,
      customer_email: user.email,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 422 })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
