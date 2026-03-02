import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Conversation, Message } from '@/lib/schema'

interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  selectedModel: string
  isLoading: boolean
  
  // Actions
  setConversations: (conversations: Conversation[]) => void
  setCurrentConversation: (conversation: Conversation | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setSelectedModel: (model: string) => void
  setIsLoading: (loading: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      currentConversation: null,
      messages: [],
      selectedModel: 'gemini-3-flash',
      isLoading: false,

      setConversations: (conversations) => set({ conversations }),
      setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'gemini-chat-storage',
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        currentConversation: state.currentConversation,
      }),
    }
  )
)
