import { OpenAIModel } from "./openai"

export interface FolderInterface {
  id: string
  ramonaModel: string
  name: string
  type: FolderType
}

export type FolderType = 'chat' | 'prompt'
