import { Conversation } from '@/types/chat'

export interface ChatbarInitialState {
  searchTerm: string
  filteredConversations: Record<string, Conversation[]>
}

export const initialState: ChatbarInitialState = {
  searchTerm: '',
  filteredConversations: {},
}