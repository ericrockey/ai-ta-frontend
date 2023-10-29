import { Conversation } from '@/types/chat'
import { OpenAIModelID, OpenAIModels } from '@/types/openai'

import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from './const'

export const cleanSelectedConversation = (conversation: Conversation) => {
  // added model for each conversation (3/20/23)
  // added system prompt for each conversation (3/21/23)
  // added folders (3/23/23)
  // added prompts (3/26/23)
  // added messages (4/16/23)


  const updatedConversation = {...conversation}
  // check for model on each conversation
  if (!updatedConversation.model) {
    updatedConversation.model = updatedConversation.model || OpenAIModels[OpenAIModelID.GPT_3_5]
  }

  // check for system prompt on each conversation
  if (!updatedConversation.prompt) {
    updatedConversation.prompt = updatedConversation.prompt || DEFAULT_SYSTEM_PROMPT
  }

  if (!updatedConversation.temperature) {
    updatedConversation.temperature = updatedConversation.temperature || DEFAULT_TEMPERATURE
  }

  if (!updatedConversation.folderId) {
    updatedConversation.folderId = updatedConversation.folderId || null
  }

  if (!updatedConversation.messages) {
    updatedConversation.messages = updatedConversation.messages || []
  }
  return updatedConversation
}

export const cleanConversationHistory = (conversationHistory: Record<string, any[]>): Record<string, Conversation[]> => {
  // added model for each conversation (3/20/23)
  // added system prompt for each conversation (3/21/23)
  // added folders (3/23/23)
  // added prompts (3/26/23)
  // added messages (4/16/23)

  const cleanedHistory: Record<string, Conversation[]> = {};
  for (const key in conversationHistory) {
    const history = conversationHistory[key];

    if (history === undefined || !Array.isArray(history)) {
      console.warn('history is not an array. Returning an empty array.')
      cleanedHistory[key] = [];
    } else {
      cleanedHistory[key] = history.reduce((acc: any[], conversation) => {
        try {
          if (!conversation.model) {
            conversation.model = OpenAIModels[OpenAIModelID.GPT_3_5]
          }

          if (!conversation.prompt) {
            conversation.prompt = DEFAULT_SYSTEM_PROMPT
          }

          if (!conversation.temperature) {
            conversation.temperature = DEFAULT_TEMPERATURE
          }

          if (!conversation.folderId) {
            conversation.folderId = null
          }

          if (!conversation.messages) {
            conversation.messages = []
          }

          acc.push(conversation)
          return acc
        } catch (error) {
          console.warn(
            `error while cleaning conversations' history. Removing culprit`,
            error,
          )
        }
        return acc
      }, [])
    } 
  }
  return cleanedHistory;
}
