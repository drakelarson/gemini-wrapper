import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { conversations, messages } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const conversationId = params.id

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, user.id!)
        )
      )

    if (!conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt)

    return Response.json({
      conversation,
      messages: conversationMessages,
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return Response.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const conversationId = params.id

    // Verify ownership
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, user.id!)
        )
      )

    if (!conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Delete conversation (messages will cascade)
    await db.delete(conversations).where(eq(conversations.id, conversationId))

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return Response.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const conversationId = params.id
    const body = await req.json()
    
    const { title, model } = body

    // Verify ownership
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, user.id!)
        )
      )

    if (!conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Update conversation
    await db
      .update(conversations)
      .set({
        ...(title && { title }),
        ...(model && { model }),
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId))

    const [updatedConversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))

    return Response.json({ conversation: updatedConversation })
  } catch (error) {
    console.error('Error updating conversation:', error)
    return Response.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}
