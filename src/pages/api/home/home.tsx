// src/pages/home/home.tsx
import { useEffect, useRef, useState } from 'react'
import { useQuery } from 'react-query'

import { type GetServerSideProps, type GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'

import { useCreateReducer } from '@/hooks/useCreateReducer'

import useErrorService from '@/services/errorService'
import useApiService from '@/services/useApiService'

import {
  cleanConversationHistory,
  cleanSelectedConversation,
} from '@/utils/app/clean'
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const'
import {
  saveConversation,
  saveConversations,
  saveModelConversations,
  updateConversation,
} from '@/utils/app/conversation'
import { saveFolders } from '@/utils/app/folders'
import { savePrompts } from '@/utils/app/prompts'
import { getSettings } from '@/utils/app/settings'

import { type Conversation } from '@/types/chat'
import { type KeyValuePair } from '@/types/data'
import { type FolderInterface, type FolderType } from '@/types/folder'
import { OpenAIModelID, OpenAIModels, fallbackModelID } from '@/types/openai'
import { type Prompt } from '@/types/prompt'

import { Chat } from '@/components/Chat/Chat'
import { Chatbar } from '@/components/Chatbar/Chatbar'
import { Navbar as SideBar } from '@/components/Mobile/Navbar'
import Promptbar from '@/components/Promptbar'

import HomeContext from './home.context'
import { type HomeInitialState, initialState } from './home.state'

import { v4 as uuidv4 } from 'uuid'
import { type CourseMetadata } from '~/types/courseMetadata'
import { kv } from '@vercel/kv'
import { useUser } from '@clerk/nextjs'
import { get_user_permission } from '~/components/UIUC-Components/runAuthCheck'
import { router } from '@trpc/server'
import { useRouter } from 'next/router'
import Navbar from '~/components/UIUC-Components/Navbar'

interface Props {
  serverSideApiKeyIsSet: boolean
  serverSidePluginKeysSet: boolean
  defaultModelId: OpenAIModelID
  course_metadata: CourseMetadata
  ramonaModel: string
}

const Home = ({
  serverSideApiKeyIsSet,
  serverSidePluginKeysSet,
  defaultModelId,
  course_metadata,
  ramonaModel,
}: Props) => {
  console.log('home.tsx')
  const { t } = useTranslation('chat')
  const { getModels } = useApiService()
  const { getModelsError } = useErrorService()
  const [initialRender, setInitialRender] = useState<boolean>(true)

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  })

  const {
    state: {
      apiKey,
      lightMode,
      folders,
      conversations,
      modelConversations,
      selectedConversation,
      prompts,
      temperature,
      ramonaModel: ramonaModelState,
    },
    dispatch,
  } = contextValue
  const stopConversationRef = useRef<boolean>(false)

  const router = useRouter()

  const ramonaModel_from_router = router.query.ramonaModel
  // Check auth & redirect
  const clerk_user_outer = useUser()
  // const course_exists = course_metadata != null

  // ------------------- 👇 MOST BASIC AUTH CHECK 👇 -------------------
  console.log('home.tsx')
  // DO AUTH-based redirect!
  useEffect(() => {
    if (clerk_user_outer.isLoaded) {
      if (course_metadata != null) {
        const permission_str = get_user_permission(
          course_metadata,
          clerk_user_outer,
          router,
        )

        if (permission_str == 'edit' || permission_str == 'view') {
          // ✅ AUTHED
        } else {
          // 🚫 NOT AUTHED
          router.push(`/${ramonaModel}/not_authorized`)
        }
      } else {
        // 🆕 MAKE A NEW COURSE
        console.log('Course does not exist, redirecting to materials page')
        router.push(`/${ramonaModel}/materials`)
      }
    }
  }, [clerk_user_outer.isLoaded])
  // ------------------- 👆 MOST BASIC AUTH CHECK 👆 -------------------
  console.log('past auth check')
  const [data, setData] = useState(null) // using the original version.
  const [error, setError] = useState<unknown>(null) // Update the type of the error state variable

  // Add a new state variable to track whether models have been fetched
  const [modelsFetched, setModelsFetched] = useState(false)

  // Update ramonaModel in state if different
  useEffect(() => {  
    if (ramonaModel !== ramonaModelState) {
      setRamonaModel(ramonaModel);
    }
  }, [ramonaModel, ramonaModelState]);

  // Update the useEffect hook to fetch models only if they haven't been fetched before
  useEffect(() => {
    if (!apiKey && !serverSideApiKeyIsSet) {
      return
    }
    if (modelsFetched) {
      return // Add this line to prevent fetching models multiple times
    }
    const fetchData = async () => {
      try {
        const data = await getModels({ key: apiKey })
        dispatch({ field: 'models', value: data })
        setModelsFetched(true) // Set modelsFetched to true after fetching models
      } catch (error) {
        dispatch({ field: 'modelError', value: getModelsError(error) })
      }
    }

    fetchData()
  }, [
    apiKey,
    serverSideApiKeyIsSet,
    getModels,
    getModelsError,
    dispatch,
    modelsFetched,
  ]) // Add modelsFetched to the dependency array
  console.log('past fetch models')
  useEffect(() => {
    if (data) dispatch({ field: 'models', value: data })
  }, [data, dispatch])

  useEffect(() => {
    dispatch({ field: 'modelError', value: getModelsError(error) })
  }, [dispatch, error, getModelsError])

  // FETCH MODELS ----------------------------------------------

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch({
      field: 'selectedConversation',
      value: conversation,
    });

    saveConversation(dispatch, conversation);
  }

  // FOLDER OPERATIONS  --------------------------------------------

  const handleCreateFolder = (name: string, type: FolderType) => {
    const newFolder: FolderInterface = {
      id: uuidv4(),
      ramonaModel,
      name,
      type,
    }

    const updatedFolders = [...folders, newFolder]

    dispatch({ field: 'folders', value: updatedFolders })
    saveFolders(updatedFolders)
  }

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId)
    dispatch({ field: 'folders', value: updatedFolders })
    saveFolders(updatedFolders)

    const updatedModelConversations: Conversation[] = conversations[ramonaModel].map((c) => {
      if (c.folderId === folderId) {
        return {
          ...c,
          folderId: null,
        }
      }

      return c
    });

    const updatedConversations = {...conversations};
    updatedConversations[ramonaModel] = updatedModelConversations;
    saveConversations(dispatch, updatedConversations)

    const updatedPrompts: Prompt[] = prompts.map((p) => {
      if (p.folderId === folderId) {
        return {
          ...p,
          folderId: null,
        }
      }

      return p
    })

    savePrompts(dispatch, updatedPrompts);
  }

  const handleUpdateFolder = (folderId: string, name: string) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
        }
      }

      return f
    })

    dispatch({ field: 'folders', value: updatedFolders })

    saveFolders(updatedFolders)
  }

  // CONVERSATION OPERATIONS  --------------------------------------------

  const handleNewConversation = () => {
    const lastConversation = modelConversations && modelConversations.length > 0 ? modelConversations[modelConversations.length - 1] : null;
    const newConversation: Conversation = {
      id: uuidv4(),
      name: t('New Conversation'),
      messages: [],
      model: lastConversation?.model || {
        id: OpenAIModels[defaultModelId].id,
        name: OpenAIModels[defaultModelId].name,
        maxLength: OpenAIModels[defaultModelId].maxLength,
        tokenLimit: OpenAIModels[defaultModelId].tokenLimit,
      },
      prompt: DEFAULT_SYSTEM_PROMPT,
      temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
      folderId: null,
    }
    const savedConversations = localStorage.getItem('conversationHistory');
    const savedConversationsParsed = savedConversations ? JSON.parse(savedConversations) : null;
    const savedModelConversations = savedConversationsParsed && savedConversationsParsed[ramonaModel] ? savedConversationsParsed[ramonaModel] : [];
    const updatedModelConversations = [...savedModelConversations, newConversation];
    const updatedConversations = savedConversations ? JSON.parse(savedConversations) : { [ramonaModel]: updatedModelConversations};
    updatedConversations[ramonaModel] = updatedModelConversations;

    saveConversation(dispatch, newConversation);
    saveConversations(dispatch, updatedConversations);
    saveModelConversations(dispatch, updatedModelConversations)

    dispatch({ field: 'loading', value: false })
  }

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair,
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    updateConversation(
      dispatch,
      ramonaModel,
      updatedConversation,
      conversations,
    )
  }

  const handleUpdateConversations = (
    modelConversations: Conversation[],
  ) => {
    const updatedConversations = {...conversations};
    updatedConversations[ramonaModel] = modelConversations;
    saveConversations(dispatch, updatedConversations);
    saveModelConversations(dispatch, modelConversations);
  }

  const handleLoadConversations = (ramonaModel: string) => {
    const savedConversations = localStorage.getItem('conversationHistory');
    let updatedConversations;
    if (savedConversations) {
      const parsedConversationHistory: Record<string, Conversation[]> =
        JSON.parse(savedConversations)
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory,
      )
      updatedConversations = savedConversations ? JSON.parse(savedConversations) : {};
      dispatch({ field: 'conversations', value: updatedConversations });
    }
    const modelConversations = updatedConversations && updatedConversations[ramonaModel] ? updatedConversations[ramonaModel] : null;
    if (modelConversations && modelConversations.length > 0) {
      saveConversation(dispatch, modelConversations[modelConversations.length - 1]);
      saveModelConversations(dispatch, modelConversations)
    } else {
      handleNewConversation();
    }
  }

  const handleUpdateSelected = (
    updatedSelectedConv: Conversation,
  ) => {
    let foundConv = false;
    const updatedModelConvs: Conversation[] = modelConversations ? modelConversations.map(
      (conversation) => {
        if (conversation.id === updatedSelectedConv?.id) {
          foundConv = true;
          return updatedSelectedConv
        }
        return conversation
      },
    ) : [updatedSelectedConv];

    if (updatedModelConvs.length === 0 || !foundConv) {
      updatedModelConvs.push(updatedSelectedConv)
    }
    saveConversation(dispatch, updatedSelectedConv);
    handleUpdateConversations(updatedModelConvs);
  };

  const setRamonaModel = (model: string) => {
    dispatch({ field: 'ramonaModel', value: model });
    handleLoadConversations(model);

  }

  // EFFECTS  --------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false })
    }
  }, [selectedConversation])

  useEffect(() => {
    defaultModelId &&
      dispatch({ field: 'defaultModelId', value: defaultModelId })
    serverSideApiKeyIsSet &&
      dispatch({
        field: 'serverSideApiKeyIsSet',
        value: serverSideApiKeyIsSet,
      })
    serverSidePluginKeysSet &&
      dispatch({
        field: 'serverSidePluginKeysSet',
        value: serverSidePluginKeysSet,
      })
  }, [defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet])

  // ON LOAD --------------------------------------------
  console.log('before onload')
  useEffect(() => {
    const settings = getSettings()
    if (settings.theme) {
      dispatch({
        field: 'lightMode',
        value: settings.theme,
      })
    }

    const apiKey = localStorage.getItem('apiKey')

    if (serverSideApiKeyIsSet) {
      dispatch({ field: 'apiKey', value: '' })

      localStorage.removeItem('apiKey')
    } else if (apiKey) {
      dispatch({ field: 'apiKey', value: apiKey })
    }

    const pluginKeys = localStorage.getItem('pluginKeys')
    if (serverSidePluginKeysSet) {
      dispatch({ field: 'pluginKeys', value: [] })
      localStorage.removeItem('pluginKeys')
    } else if (pluginKeys) {
      dispatch({ field: 'pluginKeys', value: pluginKeys })
    }

    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false })
      dispatch({ field: 'showPromptbar', value: false })
    }

    const showChatbar = localStorage.getItem('showChatbar')
    if (showChatbar) {
      dispatch({ field: 'showChatbar', value: showChatbar === 'true' })
    }

    const showPromptbar = localStorage.getItem('showPromptbar')
    if (showPromptbar) {
      dispatch({ field: 'showPromptbar', value: showPromptbar === 'true' })
    }

    const folders = localStorage.getItem('folders')
    if (folders) {
      dispatch({ field: 'folders', value: JSON.parse(folders) })
    }

    const prompts = localStorage.getItem('prompts')
    if (prompts) {
      dispatch({ field: 'prompts', value: JSON.parse(prompts) })
    }
  }, [defaultModelId, dispatch, serverSideApiKeyIsSet, serverSidePluginKeysSet])
  console.log('after onload')
  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolder,
        handleSelectConversation,
        handleUpdateSelected,
        handleUpdateConversation,
        handleUpdateConversations,
        handleLoadConversations,
        setRamonaModel,
      }}
    >
      <Head>
        <title>AI-TA</title>
        <meta name="description" content="Learn Meditation." />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {(
        <main
          className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
        >
          <Navbar isEditing={false} isNew={false} ramonaModel={ramonaModel}/>
          <div className="fixed top-0 w-full sm:hidden">
            <SideBar
              selectedConversation={selectedConversation}
              onNewConversation={handleNewConversation}
            />
          </div>

          <div className="flex h-full w-full pt-[48px] sm:pt-0">
            <Chatbar />

            <div className="flex flex-1">
              <Chat
                stopConversationRef={stopConversationRef}
                courseMetadata={course_metadata}
                defaultModelId={defaultModelId}
              />
            </div>

            <Promptbar />
          </div>
        </main>
      )}
    </HomeContext.Provider>
  )
}
export default Home

// import { useAuth, useUser } from '@clerk/nextjs'

// import { useAuth } from '@clerk/nextjs'
// import { withAuth } from '@clerk/nextjs/api'

// import { getAuth, buildClerkProps } from '@clerk/nextjs/server'
// import { get_user_permission } from '~/components/UIUC-Components/runAuthCheck'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  console.log('getServerSideprops')
  const { locale } = context
  const ramonaModel = context.params?.course_name as string
  // Check course authed users -- the JSON.parse is CRUCIAL to avoid bugs with the stringified JSON 😭

  const course_metadata: CourseMetadata =  (await kv.get(
    ramonaModel + '_metadata',
  )) as CourseMetadata
  // TODO: FIX THIS PARSE DOESN'T SEEM RIGHT
  //   if (course_metadata && course_metadata.is_private) {
  //   course_metadata.is_private = typeof course_metadata.is_private === 'string'
  //     ? JSON.parse(course_metadata.is_private)
  //     : course_metadata.is_private;
  // }
  course_metadata.is_private = JSON.parse(
    course_metadata.is_private as unknown as string,
  )

  console.log('home.tsx -- Course metadata in serverside: ', course_metadata)

  const defaultModelId =
    (process.env.DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(
        process.env.DEFAULT_MODEL as OpenAIModelID,
      ) &&
      process.env.DEFAULT_MODEL) ||
    fallbackModelID

  let serverSidePluginKeysSet = false
  const googleApiKey = process.env.GOOGLE_API_KEY
  const googleCSEId = process.env.GOOGLE_CSE_ID

  if (googleApiKey && googleCSEId) {
    serverSidePluginKeysSet = true
    console.log('Google plugin keys set... should work.')
  } else {
    console.log('Google plugin keys not set... will NOT work.')
  }

  console.log('serverSideApiKeyIsSet = ', !!process.env.OPENAI_API_KEY);
  return {
    props: {
      // ...buildClerkProps(context.req), // https://clerk.com/docs/nextjs/getserversideprops
      ramonaModel,
      course_metadata: course_metadata,
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId,
      serverSidePluginKeysSet,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
        'settings',
      ])),
    },
  }
}
