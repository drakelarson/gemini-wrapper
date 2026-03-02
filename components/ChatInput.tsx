'use client'

import { useState, useRef, FormEvent } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { generateId } from '@/lib/utils'
import type { Message } from '@/lib/schema'

export default function ChatInput() {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const {
    addMessage,
    setIsLoading,
    isLoading,
    selectedModel,
    currentConversation,
    setCurrentConversation,
    setConversations,
    conversations,
  } = useChatStore()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: generateId(),
      conversationId: currentConversation?.id || '',
      role: 'user',
      content: input,
      metadata: null,
      createdAt: new Date(),
    }

    addMessage(userMessage)
    setInput('')
    setFiles([])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationId: currentConversation?.id,
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      let conversationId = currentConversation?.id

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              assistantContent += data.chunk
              conversationId = data.conversationId

              // Update or add assistant message
              useChatStore.setState((state) => {
                const messages = state.messages
                const lastMessage = messages[messages.length - 1]
                
                if (lastMessage?.role === 'assistant') {
                  lastMessage.content = assistantContent
                  return { messages: [...messages] }
                } else {
                  const assistantMessage: Message = {
                    id: generateId(),
                    conversationId: conversationId || '',
                    role: 'assistant',
                    content: assistantContent,
                    createdAt: new Date(),
                    metadata: { model: selectedModel },
                  }
                  return { messages: [...messages, assistantMessage] }
                }
              })
            } catch (e) {
              console.error('Failed to parse chunk:', e)
            }
          }
        }
      }

      // Update current conversation if it's new
      if (!currentConversation && conversationId) {
        const [newConv] = await (await fetch(`/api/conversations/${conversationId}`)).json()
        setCurrentConversation(newConv)
        setConversations([newConv, ...conversations])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="border-t border-border p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* File Previews */}
        {files.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg text-sm"
              >
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[52px] max-h-[200px]"
              rows={1}
              disabled={isLoading}
            />
            
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Upload file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.go,.rs"
            />
          </div>
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          Gemini may produce inaccurate information. Always verify important facts.
        </p>
      </form>
    </div>
  )
}
