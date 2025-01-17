import { useCallback, useContext, useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { useCreateReducer } from '@/hooks/useCreateReducer'

import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const'
import { saveConversation, saveConversations } from '@/utils/app/conversation'
import { saveFolders } from '@/utils/app/folders'
import { exportData, /* importData */ } from '@/utils/app/importExport'

import { Conversation } from '@/types/chat'
import { LatestExportFormat, SupportedExportFormats } from '@/types/export'
import { OpenAIModels } from '@/types/openai'
import { PluginKey } from '@/types/plugin'

import HomeContext from '~/pages/api/home/home.context'

import { ChatFolders } from './components/ChatFolders'
import { ChatbarSettings } from './components/ChatbarSettings'
import { Conversations } from './components/Conversations'

import Sidebar from '../Sidebar'
import ChatbarContext from './Chatbar.context'
import { ChatbarInitialState, initialState } from './Chatbar.state'

import { v4 as uuidv4 } from 'uuid'

export const Chatbar = () => {
  console.log('chatbar')
  const { t } = useTranslation('sidebar')

  const chatBarContextValue = useCreateReducer<ChatbarInitialState>({
    initialState,
  })

  const {
    state: { conversations, modelConversations, selectedConversation, showChatbar, defaultModelId, folders, pluginKeys, ramonaModel },
    dispatch: homeDispatch,
    handleCreateFolder,
    handleNewConversation,
    handleUpdateConversation,
    handleUpdateConversations,
    handleSelectConversation,
  } = useContext(HomeContext)
  console.log('past useContext')
  const {
    state: { searchTerm, filteredConversations },
    dispatch: chatDispatch,
  } = chatBarContextValue

  const handleApiKeyChange = useCallback(
    (apiKey: string) => {
      homeDispatch({ field: 'apiKey', value: apiKey })

      localStorage.setItem('apiKey', apiKey)
    },
    [homeDispatch],
  )

  const handlePluginKeyChange = (pluginKey: PluginKey) => {
    if (pluginKeys.some((key) => key.pluginId === pluginKey.pluginId)) {
      const updatedPluginKeys = pluginKeys.map((key) => {
        if (key.pluginId === pluginKey.pluginId) {
          return pluginKey
        }

        return key
      })

      homeDispatch({ field: 'pluginKeys', value: updatedPluginKeys })

      localStorage.setItem('pluginKeys', JSON.stringify(updatedPluginKeys))
    } else {
      homeDispatch({ field: 'pluginKeys', value: [...pluginKeys, pluginKey] })

      localStorage.setItem(
        'pluginKeys',
        JSON.stringify([...pluginKeys, pluginKey]),
      )
    }
  }

  const handleClearPluginKey = (pluginKey: PluginKey) => {
    if (pluginKeys) {
      const updatedPluginKeys = pluginKeys.filter(
        (key) => key.pluginId !== pluginKey.pluginId,
      )
  
      if (updatedPluginKeys.length === 0) {
        homeDispatch({ field: 'pluginKeys', value: [] })
        localStorage.removeItem('pluginKeys')
        return
      }
  
      homeDispatch({ field: 'pluginKeys', value: updatedPluginKeys })
  
      localStorage.setItem('pluginKeys', JSON.stringify(updatedPluginKeys))
    }
  }

  const handleExportData = () => {
    exportData()
  }

  // const handleImportConversations = (data: SupportedExportFormats) => {
  //   const { history, folders, prompts }: LatestExportFormat = importData(data)
  //   homeDispatch({ field: 'conversations', value: history })
  //   homeDispatch({
  //     field: 'selectedConversation',
  //     value: history[history.length - 1],
  //   })
  //   homeDispatch({ field: 'folders', value: folders })
  //   homeDispatch({ field: 'prompts', value: prompts })

  //   window.location.reload()
  // }

  const handleClearConversations = () => {
    if (defaultModelId) {
      const newConversation = {
        id: uuidv4(),
        name: t('New Conversation'),
        messages: [],
        model: OpenAIModels[defaultModelId],
        prompt: DEFAULT_SYSTEM_PROMPT,
        temperature: DEFAULT_TEMPERATURE,
        folderId: null,
      };
      handleSelectConversation(newConversation);
      handleUpdateConversations([]);
    }
    const updatedFolders = folders.filter((f) => (f.type !== 'chat' && f.ramonaModel === ramonaModel))

    homeDispatch({ field: 'folders', value: updatedFolders })
    saveFolders(updatedFolders)
  }

  const handleDeleteConversation = (conversation: Conversation) => {
    if (!modelConversations) return;
    const updatedModelConversations = modelConversations.filter(
      (c) => c.id !== conversation.id,
    )

    handleUpdateConversations(updatedModelConversations);
    chatDispatch({ field: 'searchTerm', value: '' })

    if (updatedModelConversations && updatedModelConversations.length > 0) {
      const lastConversation =
      updatedModelConversations[updatedModelConversations.length - 1]
      if (lastConversation) {
        handleSelectConversation(lastConversation);
      }
    } else {
      handleNewConversation();
    }
  }

  const handleToggleChatbar = () => {
    homeDispatch({ field: 'showChatbar', value: !showChatbar })
    localStorage.setItem('showChatbar', JSON.stringify(!showChatbar))
  }

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'))
      handleSelectConversation(conversation);
      handleUpdateConversation(conversation, { key: 'folderId', value: 0 })
      chatDispatch({ field: 'searchTerm', value: '' })
      e.target.style.background = 'none'
    }
  }
  console.log('before useeffect')
  useEffect(() => {
    if (searchTerm && modelConversations) {
      const selectedFilteredConv = modelConversations.filter((conversation) => {
        const searchable =
          conversation.name.toLocaleLowerCase() +
          ' ' +
          conversation.messages.map((message) => message.content).join(' ')
        return searchable.toLowerCase().includes(searchTerm.toLowerCase())
      });
      const updatedFilteredConv = {...filteredConversations};
      updatedFilteredConv[ramonaModel] = selectedFilteredConv;
      chatDispatch({
        field: 'filteredConversations',
        value: updatedFilteredConv,
      })
    } else {
      chatDispatch({
        field: 'filteredConversations',
        value: conversations,
      })
    }
  }, [conversations, filteredConversations, searchTerm, modelConversations])
  console.log('after useeffect')
  return (
    <ChatbarContext.Provider
      value={{
        ...chatBarContextValue,
        handleDeleteConversation,
        handleClearConversations,
        // handleImportConversations,
        handleExportData,
        handlePluginKeyChange,
        handleClearPluginKey,
        handleApiKeyChange,
      }}
    >
      <Sidebar<Conversation>
        side={'left'}
        isOpen={showChatbar}
        addItemButtonTitle={t('New chat')}
        itemComponent={<Conversations conversations={filteredConversations[ramonaModel]} />}
        folderComponent={<ChatFolders searchTerm={searchTerm} />}
        items={filteredConversations[ramonaModel]}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          chatDispatch({ field: 'searchTerm', value: searchTerm })
        }
        toggleOpen={handleToggleChatbar}
        handleCreateItem={handleNewConversation}
        handleCreateFolder={() => handleCreateFolder(t('New folder'), 'chat')}
        handleDrop={handleDrop}
        footerComponent={<ChatbarSettings />}
      />
    </ChatbarContext.Provider>
  )
}
