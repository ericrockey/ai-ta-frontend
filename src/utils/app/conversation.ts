// @utils/app/conversation
import { Dispatch,  } from 'react'
import { ActionType } from '@/hooks/useCreateReducer'
import { Conversation } from '@/types/chat'
import { HomeInitialState } from '~/pages/api/home/home.state';

export const updateConversation = (
  dispatch: Dispatch<ActionType<HomeInitialState>>,
  ramonaModel: string,
  conversation: Conversation,
  conversations: Record<string, Conversation[]>,
) => {
  if (!conversation) return;
  const updatedModelConversations = conversations[ramonaModel].map((c) => {
    if (c.id === conversation.id) {
      return conversation
    }

    return c
  })
  
  const updatedAllConversations = {...conversations};
  updatedAllConversations[ramonaModel] = updatedModelConversations;
  saveConversation(dispatch, conversation);
  saveConversations(dispatch, conversations);
  saveModelConversations(dispatch, updatedModelConversations);
}

export const saveConversation = (
  dispatch: Dispatch<ActionType<HomeInitialState>>,
  conversation: Conversation | undefined,
) => {
  dispatch({ field: 'selectedConversation', value: conversation });
  localStorage.setItem('selectedConversation', JSON.stringify(conversation));
}

export const saveConversations = (
  dispatch: Dispatch<ActionType<HomeInitialState>>,
  conversations: Record<string, Conversation[]>,
) => {
  dispatch({ field: 'conversations', value: conversations });
  localStorage.setItem('conversationHistory', JSON.stringify(conversations));
}

export const saveModelConversations = (
  dispatch: Dispatch<ActionType<HomeInitialState>>,
  conversations: Conversation[],
) => {
  dispatch({ field: 'modelConversations', value: conversations });
}

