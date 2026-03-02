'use client'

import { useRef, useEffect } from 'react'
import { useChatStore } from '@/stores/chatStore'
import Message from './Message'
import ChatInput from './ChatInput'
import ModelSelector from './ModelSelector'

export default function ChatArea() {
  const { messages, isLoading, currentConversation } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Model Selector Bar */}
      <div className="border-b border-border px-4 py-2 flex items-center justify-between">
        <ModelSelector />
        
        <div className="text-sm text-muted-foreground">
          {messages.length} messages
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="max-w-2xl">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold mb-3">
                Welcome to Gemini Chat
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Start a conversation with Gemini AI. Ask questions, get help with code, analyze documents, and more.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-4 bg-muted rounded-lg text-left">
                  <div className="font-medium mb-1">💬 Chat Naturally</div>
                  <p className="text-muted-foreground">Have a conversation like you would with a helpful assistant</p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg text-left">
                  <div className="font-medium mb-1">💻 Code Help</div>
                  <p className="text-muted-foreground">Get help writing, debugging, and understanding code</p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg text-left">
                  <div className="font-medium mb-1">📝 Writing Assistance</div>
                  <p className="text-muted-foreground">Get help with writing, editing, and brainstorming ideas</p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg text-left">
                  <div className="font-medium mb-1">🧠 Learn & Explore</div>
                  <p className="text-muted-foreground">Ask questions and learn about any topic</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
            {messages.map((message, index) => (
              <Message key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full typing-indicator" />
                  <div className="w-2 h-2 bg-primary rounded-full typing-indicator" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full typing-indicator" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput />
    </div>
  )
}
