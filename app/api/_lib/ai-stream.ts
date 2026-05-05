/**
 * Dual-provider AI streaming helper.
 * Prefers GEMINI_API_KEY → falls back to ANTHROPIC_API_KEY.
 * Both providers emit the same SSE format: data: {"text":"..."}\n\n
 */

type Msg = { role: string; content: string }

export type Provider = 'gemini' | 'claude' | 'none'

export function detectProvider(): Provider {
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.ANTHROPIC_API_KEY) return 'claude'
  return 'none'
}

// ─── Gemini streaming ─────────────────────────────────────────────────────────

async function* streamGemini(
  messages: Msg[],
  system: string
): AsyncGenerator<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genai.getGenerativeModel({
    model: 'gemini-2.5-pro',
    systemInstruction: system,
  })

  // Convert message history — keep last 10, Gemini role: user | model
  const history = messages.slice(-10).slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const lastMsg = messages[messages.length - 1]

  const chat = model.startChat({ history })
  const result = await chat.sendMessageStream(lastMsg.content)

  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) yield text
  }
}

// Gemini OCR (vision)
async function* streamGeminiOcr(
  base64: string,
  mimeType: string,
  prompt: string
): AsyncGenerator<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genai.getGenerativeModel({ model: 'gemini-2.5-pro' })

  const result = await model.generateContentStream({
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: prompt },
        ],
      },
    ],
  })

  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) yield text
  }
}

// ─── Claude streaming ─────────────────────────────────────────────────────────

async function* streamClaude(
  messages: Msg[],
  system: string
): AsyncGenerator<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const anthropicStream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system,
    messages: messages.slice(-10) as Array<{ role: 'user' | 'assistant'; content: string }>,
  })

  for await (const event of anthropicStream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta?.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
}

// Claude OCR (vision)
async function* streamClaudeOcr(
  base64: string,
  mimeType: string,
  prompt: string
): AsyncGenerator<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const anthropicStream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg', data: base64 } },
          { type: 'text', text: prompt },
        ],
      },
    ],
  })

  for await (const event of anthropicStream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta?.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getTextStream(
  messages: Msg[],
  system: string
): AsyncGenerator<string> {
  const provider = detectProvider()
  if (provider === 'gemini') return streamGemini(messages, system)
  if (provider === 'claude') return streamClaude(messages, system)
  throw new Error('NO_KEY')
}

export function getOcrStream(
  base64: string,
  mimeType: string,
  prompt: string
): AsyncGenerator<string> {
  const provider = detectProvider()
  if (provider === 'gemini') return streamGeminiOcr(base64, mimeType, prompt)
  if (provider === 'claude') return streamClaudeOcr(base64, mimeType, prompt)
  throw new Error('NO_KEY')
}

export function noKeyError(): string {
  return '⚠️ Sin API key configurada. El administrador debe agregar GEMINI_API_KEY o ANTHROPIC_API_KEY en Vercel → Settings → Environment Variables.'
}
