import { ContextWithMetadata } from '~/types/chat'

import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json'
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init'

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

    const prePrompt =
      "Please answer the following question as a senior, very skillful meditation teacher. Use the context below, called your documents, only if it's helpful and don't use parts that are very irrelevant. Please don't mention the documents directly in your answer, but feel free to use any information from the documents in your answer. Feel free to say you don't know. Do not use any information about meditation that is found outside these documents or the rest of the information passed to you. \nHere's a few passages of the high quality documents:\n"

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
