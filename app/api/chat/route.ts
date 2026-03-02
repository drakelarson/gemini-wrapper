import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { conversations, messages } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { streamChat, type GeminiModel } from '@/lib/gemini'
import { generateId } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const { 
      message, 
      conversationId, 
      model = 'gemini-3-flash',
      conversationTitle 
    } = body

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    let convId = conversationId

    // Create new conversation if needed
    if (!convId) {
      convId = generateId()
      const title = conversationTitle || message.slice(0, 50) + '...'
      
      await db.insert(conversations).values({
        id: convId,
        userId: user.id!,
        title,
        model,
      })
    }

    // Get conversation history
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, convId))
      .orderBy(messages.createdAt)

    // Save user message
    const userMessageId = generateId()
    await db.insert(messages).values({
      id: userMessageId,
      conversationId: convId,
      role: 'user',
      content: message,
    })

    // Prepare messages for Gemini
    const geminiMessages = history.map((msg) => ({
      role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
      content: msg.content,
    }))
    geminiMessages.push({ role: 'user' as const, content: message })

    // Stream response
    const encoder = new TextEncoder()
    let assistantMessage = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChat(geminiMessages, model as GeminiModel)) {
            assistantMessage += chunk
            const data = encoder.encode(`data: ${JSON.stringify({ chunk, conversationId: convId })}\n\n`)
            controller.enqueue(data)
          }

          // Save assistant message
          const assistantMessageId = generateId()
          await db.insert(messages).values({
            id: assistantMessageId,
            conversationId: convId,
            role: 'assistant',
            content: assistantMessage,
            metadata: { model },
          })

          // Update conversation timestamp
          await db
            .update(conversations)
            .set({ updatedAt: new Date() })
            .where(eq(conversations.id, convId))

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to process message' },
      { status: 500 }
    )
  }
}
