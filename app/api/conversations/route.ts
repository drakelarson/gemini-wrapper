import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { conversations, messages } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const user = await requireAuth()
    
    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, user.id!))
      .orderBy(desc(conversations.updatedAt))

    return Response.json({ conversations: userConversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return Response.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const { title, model = 'gemini-3-flash' } = body

    if (!title) {
      return Response.json({ error: 'Title is required' }, { status: 400 })
    }

    const conversationId = Math.random().toString(36).substring(2) + Date.now().toString(36)

    await db.insert(conversations).values({
      id: conversationId,
      userId: user.id!,
      title,
      model,
    })

    const [newConversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))

    return Response.json({ conversation: newConversation })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return Response.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
