import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconRobot,
  IconTrash,
  IconUser,
} from '@tabler/icons-react'
import { FC, memo, useContext, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { updateConversation } from '@/utils/app/conversation'

import { Message } from '@/types/chat'

import HomeContext from '~/pages/api/home/home.context'

import { CodeBlock } from '../Markdown/CodeBlock'
import { MemoizedReactMarkdown } from '../Markdown/MemoizedReactMarkdown'

import rehypeMathjax from 'rehype-mathjax'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import {
  Card,
  Image,
  Text,
  MantineProvider,
  Button,
  Group,
  Stack,
  createStyles,
  FileInput,
  rem,
  Divider,
} from '@mantine/core'

// export interface Props {
//   message: Message;
//   messageIndex: number;
//   onEdit?: (editedMessage: Message) => void
// }

export interface Props {
  message: Message
  messageIndex: number
  onEdit?: (editedMessage: Message) => void
  sources?: string[] // Add this line
}

// export const ChatMessage: FC<Props> = memo(({ message, messageIndex, onEdit }) => {
export const ChatMessage: FC<Props> = memo(
  ({ message, messageIndex, onEdit, sources }) => {
    const { t } = useTranslation('chat')

    function MaterialsCardSmall() {
      const [isShowFullParagraph, setIsFade] = useState(true)

      const toggleFade = () => {
        setIsFade(!isShowFullParagraph)
      }

      // either query Pinecone directly, or use a flask endpoint. But why bother with flask?

      return (
        <div className="box-sizing: border-box; border: 100px solid #ccc;">
          {/* <h4 className="font-bold">Sources from the course</h4>  */}
          <Card
            bg="#0E1116"
            style={{ maxWidth: '20rem' }}
            shadow="sm"
            padding="md"
            radius="md"
            withBorder
          >
            <Card.Section style={{ padding: 'xs' }}>
              <Image
                src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80"
                // height={'20rem'}
                alt="Norway"
                className='class="div-with-image'
                // style={{ objectFit: 'cover', position: 'relative', overflow: 'hidden'}}
                // position="relative"
                // overflow="hidden"
              />
            </Card.Section>

            <Group position="apart" mt="md" mb="xs">
              <Text style={{ fontFamily: 'Montserrat' }} size="xl" weight={800}>
                Finite State Machine Readings
              </Text>
              {/* <Badge size="xl" color="pink" variant="light">
            ECE
          </Badge> */}
            </Group>

            <Text
              size="sm"
              variant="gradient"
              weight={600}
              gradient={{ from: 'yellow', to: 'green', deg: 0 }}
            >
              AI summary
            </Text>
            {/* style={{'font-family': 'Lora'}} */}
            <Text
              className={isShowFullParagraph ? 'fade' : ''}
              size="md"
              color="dimmed"
            >
              In a FSM, each state represents a specific condition or mode that
              the system can be in, and each transition represents a change of
              state triggered by a specific input or event. The FSM can be
              defined by a set of states, a set of input symbols or events, a
              set of output symbols or actions, and a transition function that
              maps each state and input to a next state and output.
            </Text>
            {/* <Button size="xs" variant="dimmed">Show full paragraph</Button> */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="xs" variant="dimmed" pb="0" onClick={toggleFade}>
                Show full paragraph
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    const {
      state: {
        selectedConversation,
        conversations,
        currentMessage,
        messageIsStreaming,
      },
      dispatch: homeDispatch,
    } = useContext(HomeContext)

    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [isTyping, setIsTyping] = useState<boolean>(false)
    const [messageContent, setMessageContent] = useState(message.content)
    const [messagedCopied, setMessageCopied] = useState(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const toggleEditing = () => {
      setIsEditing(!isEditing)
    }

    const handleInputChange = (
      event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
      setMessageContent(event.target.value)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }

    const handleEditMessage = () => {
      if (message.content != messageContent) {
        if (selectedConversation && onEdit) {
          onEdit({ ...message, content: messageContent })
        }
      }
      setIsEditing(false)
    }

    const handleDeleteMessage = () => {
      if (!selectedConversation) return

      const { messages } = selectedConversation
      const findIndex = messages.findIndex((elm) => elm === message)

      if (findIndex < 0) return

      if (
        findIndex < messages.length - 1 &&
        messages[findIndex + 1]?.role === 'assistant'
      ) {
        messages.splice(findIndex, 2)
      } else {
        messages.splice(findIndex, 1)
      }
      const updatedConversation = {
        ...selectedConversation,
        messages,
      }

      const { single, all } = updateConversation(
        updatedConversation,
        conversations,
      )
      homeDispatch({ field: 'selectedConversation', value: single })
      homeDispatch({ field: 'conversations', value: all })
    }

    const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !isTyping && !e.shiftKey) {
        e.preventDefault()
        handleEditMessage()
      }
    }

    const copyOnClick = () => {
      if (!navigator.clipboard) return

      navigator.clipboard.writeText(message.content).then(() => {
        setMessageCopied(true)
        setTimeout(() => {
          setMessageCopied(false)
        }, 2000)
      })
    }

    useEffect(() => {
      setMessageContent(message.content)
    }, [message.content])

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, [isEditing])

    return (
      <div
        className={`group md:px-4 ${
          message.role === 'assistant'
            ? 'border-b border-black/10 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100'
            : 'border-b border-black/10 bg-white text-gray-800 dark:border-gray-900/50 dark:bg-[#343541] dark:text-gray-100'
        }`}
        style={{ overflowWrap: 'anywhere' }}
      >
        <div className="relative m-auto flex p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-5xl lg:px-0 xl:max-w-3xl">
          <div className="min-w-[40px] text-right font-bold">
            {message.role === 'assistant' ? (
              <IconRobot size={30} />
            ) : (
              <IconUser size={30} />
            )}
          </div>

          <div className="dark:prose-invert prose mt-[-2px] w-full">
            {message.role === 'user' ? (
              <div className="flex w-full">
                {isEditing ? (
                  <div className="flex w-full flex-col">
                    <textarea
                      ref={textareaRef}
                      className="w-full resize-none whitespace-pre-wrap border-none dark:bg-[#343541]"
                      value={messageContent}
                      onChange={handleInputChange}
                      onKeyDown={handlePressEnter}
                      onCompositionStart={() => setIsTyping(true)}
                      onCompositionEnd={() => setIsTyping(false)}
                      style={{
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                        padding: '0',
                        margin: '0',
                        overflow: 'hidden',
                      }}
                    />

                    <div className="mt-10 flex justify-center space-x-4">
                      <button
                        className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
                        onClick={handleEditMessage}
                        disabled={messageContent.trim().length <= 0}
                      >
                        {t('Save & Submit')}
                      </button>
                      <button
                        className="h-[40px] rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        onClick={() => {
                          setMessageContent(message.content)
                          setIsEditing(false)
                        }}
                      >
                        {t('Cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="dark:prose-invert prose flex-1 whitespace-pre-wrap">
                    {message.content}
                  </div>
                )}

                {!isEditing && (
                  <div className="ml-1 flex flex-col items-center justify-end gap-4 md:-mr-8 md:ml-0 md:flex-row md:items-start md:justify-start md:gap-1">
                    <button
                      className="invisible text-gray-500 hover:text-gray-700 focus:visible group-hover:visible dark:text-gray-400 dark:hover:text-gray-300"
                      onClick={toggleEditing}
                    >
                      <IconEdit size={20} />
                    </button>
                    <button
                      className="invisible text-gray-500 hover:text-gray-700 focus:visible group-hover:visible dark:text-gray-400 dark:hover:text-gray-300"
                      onClick={handleDeleteMessage}
                    >
                      <IconTrash size={20} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-row">
                <div className="flex-1">
                  <MemoizedReactMarkdown
                    className="dark:prose-invert prose flex-1"
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeMathjax]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        if (children.length) {
                          if (children[0] == '▍') {
                            return (
                              <span className="mt-1 animate-pulse cursor-default">
                                ▍
                              </span>
                            )
                          }

                          children[0] = (children[0] as string).replace(
                            '`▍`',
                            '▍',
                          )
                        }

                        const match = /language-(\w+)/.exec(className || '')

                        return !inline ? (
                          <CodeBlock
                            key={Math.random()}
                            language={(match && match[1]) || ''}
                            value={String(children).replace(/\n$/, '')}
                            {...props}
                          />
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      },
                      table({ children }) {
                        return (
                          <table className="border-collapse border border-black px-3 py-1 dark:border-white">
                            {children}
                          </table>
                        )
                      },
                      th({ children }) {
                        return (
                          <th className="break-words border border-black bg-gray-500 px-3 py-1 text-white dark:border-white">
                            {children}
                          </th>
                        )
                      },
                      td({ children }) {
                        return (
                          <td className="break-words border border-black px-3 py-1 dark:border-white">
                            {children}
                          </td>
                        )
                      },
                    }}
                  >
                    {`${message.content}${
                      messageIsStreaming &&
                      messageIndex ==
                        (selectedConversation?.messages.length ?? 0) - 1
                        ? '`▍`'
                        : ''
                    }`}
                  </MemoizedReactMarkdown>
                  <Divider my="sm" variant="solid" />
                  <h4 className="font-bold">Sources from the course</h4>
                  <Group variant="row" spacing="xs">
                    <MaterialsCardSmall />
                    <MaterialsCardSmall />
                    {/* <MaterialsCardSmall />  */}
                    {/* Add more instances with different useFade values as needed */}
                  </Group>
                </div>

                <div className="ml-1 flex flex-col items-center justify-end gap-4 md:-mr-8 md:ml-0 md:flex-row md:items-start md:justify-start md:gap-1">
                  {messagedCopied ? (
                    <IconCheck
                      size={20}
                      className="text-green-500 dark:text-green-400"
                    />
                  ) : (
                    <button
                      className="invisible text-gray-500 hover:text-gray-700 focus:visible group-hover:visible dark:text-gray-400 dark:hover:text-gray-300"
                      onClick={copyOnClick}
                    >
                      <IconCopy size={20} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
)
ChatMessage.displayName = 'ChatMessage'