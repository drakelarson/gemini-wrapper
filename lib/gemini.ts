import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const geminiModels = {
  flash: 'gemini-3-flash',
  pro: 'gemini-3-pro',
} as const

export type GeminiModel = (typeof geminiModels)[keyof typeof geminiModels]

export interface ChatMessage {
  role: 'user' | 'model'
  content: string
  files?: File[]
}

export interface GenerationConfig {
  temperature?: number
  topP?: number
  topK?: number
  maxOutputTokens?: number
}

export async function* streamChat(
  messages: ChatMessage[],
  model: GeminiModel = geminiModels.flash,
  config: GenerationConfig = {}
) {
  const geminiModel = genAI.getGenerativeModel({ model })

  const chat = geminiModel.startChat({
    history: messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      temperature: config.temperature ?? 0.7,
      topP: config.topP ?? 0.8,
      topK: config.topK ?? 40,
      maxOutputTokens: config.maxOutputTokens ?? 2048,
    },
  })

  const lastMessage = messages[messages.length - 1]
  const result = await chat.sendMessageStream(lastMessage.content)

  for await (const chunk of result.stream) {
    const chunkText = chunk.text()
    yield chunkText
  }
}

export async function generateText(
  prompt: string,
  model: GeminiModel = geminiModels.flash
) {
  const geminiModel = genAI.getGenerativeModel({ model })
  const result = await geminiModel.generateContent(prompt)
  return result.response.text()
}

export async function analyzeImage(
  imageBuffer: Buffer,
  prompt: string,
  model: GeminiModel = geminiModels.flash
) {
  const geminiModel = genAI.getGenerativeModel({ model })
  
  const result = await geminiModel.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBuffer.toString('base64'),
      },
    },
  ])

  return result.response.text()
}

export async function analyzeDocument(
  documentBuffer: Buffer,
  mimeType: string,
  prompt: string,
  model: GeminiModel = geminiModels.flash
) {
  const geminiModel = genAI.getGenerativeModel({ model })
  
  const result = await geminiModel.generateContent([
    prompt,
    {
      inlineData: {
        mimeType,
        data: documentBuffer.toString('base64'),
      },
    },
  ])

  return result.response.text()
}
