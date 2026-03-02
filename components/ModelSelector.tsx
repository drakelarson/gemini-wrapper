'use client'

import { useChatStore } from '@/stores/chatStore'

const models = [
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', description: 'Fast and efficient' },
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', description: 'Most capable' },
]

export default function ModelSelector() {
  const { selectedModel, setSelectedModel } = useChatStore()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Model:</span>
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  )
}
