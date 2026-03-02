'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import { useChatStore } from '@/stores/chatStore'
import { generateId } from '@/lib/utils'

export default function ChatInterface() {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { 
    setConversations, 
    setCurrentConversation, 
    clearMessages,
    currentConversation 
  } = useChatStore()

  useEffect(() => {
    fetchConversations()
  }, [])

  async function fetchConversations() {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }

  const handleNewChat = () => {
    setCurrentConversation(null)
    clearMessages()
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 ease-in-out`}>
        <Sidebar 
          onNewChat={handleNewChat}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex-1 flex items-center justify-between">
            <h1 className="font-semibold text-lg">
              {currentConversation?.title || 'New Chat'}
            </h1>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {session?.user?.email}
              </span>
              {session?.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <ChatArea />
      </div>
    </div>
  )
}
