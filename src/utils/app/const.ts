export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "Please answer the following question as a senior, very skillful meditation teacher. Use the context below, called your documents, only if it's helpful and don't use parts that are very irrelevant. Please don't mention the documents directly in your answer, but feel free to use any information from the documents in your answer. Feel free to say you don't know. Do not use any information about meditation that is found outside these documents or the rest of the information passed to you. \nHere's a few passages of the high quality documents:\n"

export const OPENAI_API_HOST =
  process.env.OPENAI_API_HOST || 'https://api.openai.com'

export const DEFAULT_TEMPERATURE = parseFloat(
  process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE || '0.4',
)

export const OPENAI_API_TYPE = process.env.OPENAI_API_TYPE || 'openai'

export const OPENAI_API_VERSION =
  process.env.OPENAI_API_VERSION || '2023-03-15-preview'

export const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION || ''

export const AZURE_DEPLOYMENT_ID = process.env.AZURE_DEPLOYMENT_ID || ''
