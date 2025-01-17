import { Conversation, Message } from '@/types/chat'
import { ErrorMessage } from '@/types/error'
import { FolderInterface } from '@/types/folder'
import { OpenAIModel, OpenAIModelID } from '@/types/openai'
import { PluginKey } from '@/types/plugin'
import { Prompt } from '@/types/prompt'

export interface HomeInitialState {
  apiKey: string
  pluginKeys: PluginKey[]
  loading: boolean
  lightMode: 'light' | 'dark'
  messageIsStreaming: boolean
  modelError: ErrorMessage | null
  models: OpenAIModel[]
  folders: FolderInterface[]
  conversations: Record<string, Conversation[]>
  modelConversations: Conversation[]
  selectedConversation: Conversation | undefined
  currentMessage: Message | undefined
  prompts: Prompt[]
  temperature: number
  showChatbar: boolean
  showPromptbar: boolean
  currentFolder: FolderInterface | undefined
  messageError: boolean
  searchTerm: string
  defaultModelId: OpenAIModelID | undefined
  serverSideApiKeyIsSet: boolean
  serverSidePluginKeysSet: boolean
  cooldown: number
  ramonaModel: string
}

export const initialState: HomeInitialState = {
  apiKey: '',
  loading: false,
  pluginKeys: [],
  lightMode: 'dark',
  messageIsStreaming: false,
  modelError: null,
  models: [],
  folders: [],
  conversations: {},
  modelConversations: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  prompts: [], // TODO: Add default prompts here :)
  temperature: 0.4,
  showPromptbar: false,
  showChatbar: true,
  currentFolder: undefined,
  messageError: false,
  searchTerm: '',
  defaultModelId: undefined,
  serverSideApiKeyIsSet: false,
  serverSidePluginKeysSet: false,
  cooldown: 0,
  ramonaModel: '',
}
