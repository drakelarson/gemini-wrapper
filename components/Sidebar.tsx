'use client'

import { useChatStore } from '@/stores/chatStore'
import { formatDate, truncate } from '@/lib/utils'
import type { Conversation } from '@/lib/schema'

interface SidebarProps {
  onNewChat: () => void
  onClose: () => void
}

export default function Sidebar({ onNewChat, onClose }: SidebarProps) {
  const { 
    conversations, 
    setCurrentConversation, 
    setMessages,
    currentConversation,
    isLoading 
  } = useChatStore()

  const handleSelectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation)
    
    try {
      const response = await fetch(`/api/conversations/${conversation.id}`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return
    }

    try {
      await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      })
      
      // Refresh conversations list
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  return (
    <div className="h-full bg-muted/30 border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`group p-3 rounded-lg cursor-pointer transition-all ${
                currentConversation?.id === conversation.id
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {truncate(conversation.title, 30)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(conversation.updatedAt)}
                  </p>
                </div>
                
                <button
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive hover:text-destructive-foreground rounded transition-all"
                  aria-label="Delete conversation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          Powered by Gemini AI
        </div>
      </div>
    </div>
  )
}
