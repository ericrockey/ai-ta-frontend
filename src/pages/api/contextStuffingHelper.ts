import { ContextWithMetadata } from '~/types/chat'

import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json'
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init'
import { DEFAULT_SYSTEM_PROMPT } from '~/utils/app/const'

export async function getStuffedPrompt(
  course_name: string,
  searchQuery: string,
  contexts: ContextWithMetadata[],
  tokenLimit = 8000,
) {
  try {
    if (contexts.length === 0) {
      return searchQuery
    }

    tokenLimit = tokenLimit - 2001 // for the completion. We always reserve 1k + some for the system prompt I think...

    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    )

    const prePrompt = ""
    let tokenCounter = encoding.encode(
      prePrompt + '\n\nNow please respond to my query: ' + searchQuery,
    ).length
    const validDocs = []
    for (const d of contexts) {
      const docString = `---\nDocument: ${d.readable_filename}${
        d.pagenumber ? ', page: ' + d.pagenumber : ''
      }\n${d.text}\n`
      const numTokens = encoding.encode(docString).length
      console.log(
        `token_counter: ${tokenCounter}, num_tokens: ${numTokens}, token_limit: ${tokenLimit}`,
      )
      if (tokenCounter + numTokens <= tokenLimit) {
        tokenCounter += numTokens
        validDocs.push(d)
      } else {
        continue
      }
    }

    const separator = '---\n' // between each context
    const contextText = validDocs
      .map(
        (d) =>
          `Document: ${d.readable_filename}${
            d.pagenumber ? ', page: ' + d.pagenumber : ''
          }\n${d.text}\n`,
      )
      .join(separator)

    const stuffedPrompt =
      prePrompt +
      contextText +
      '\n\nNow please respond to my query: ' +
      searchQuery
    const totalNumTokens = encoding.encode(stuffedPrompt).length
    console.log('Stuffed prompt', stuffedPrompt.substring(0, 3700))
    console.log(
      `Total number of tokens: ${totalNumTokens}. Number of docs: ${contexts.length}, number of valid docs: ${validDocs.length}`,
    )
    console.log('stuffed prompt = ', stuffedPrompt);
    return stuffedPrompt
  } catch (e) {
    console.error(`Error in getStuffedPrompt: ${e}`)
    throw e
  }
}
