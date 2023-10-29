// src/components/UIUC-Components/ContextCards.tsx

import {
  Card,
  Image,
  Text,
  Group,
  // Title,
  // Badge,
  // MantineProvider,
  // Button,
  // Stack,
  // createStyles,
  // FileInput,
  // rem,
  // Divider,
} from '@mantine/core'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { ContextWithMetadata } from '~/types/chat'
// import SciteBadge from './SciteBadge'

// import { IconExternalLink } from '@tabler/icons-react'

export async function fetchPresignedUrl(filePath: string) {
  try {
    const response = await axios.post('/api/download', {
      filePath,
    })
    return response.data.url
  } catch (error) {
    console.error('Error fetching presigned URL:', error)
    return null
  }
}

export const ContextCards = ({
  contexts,
}: {
  contexts: ContextWithMetadata[]
}) => {
  if (!Array.isArray(contexts)) {
    console.error('contexts is not an array:', contexts)
    return null // or return a loading state or error state
  }

  return (
    <>
      {contexts ? (
        <>
          <Group variant="row" spacing="xs">
            {contexts
              .slice(0, 4) // only show first 4 cards
              .map((context: ContextWithMetadata, index: number) => (
                <DynamicMaterialsCard key={index} {...context} />
              ))}
          </Group>
        </>
      ) : (
        // Loading state...

        // TODO: Re-enable loading state, after I get "localStorage" working for each context.
        // For now, it's just distracting to see loading with no results.

        // <div role="status" className="max-w-sm p-4 border border-gray-200 rounded shadow animate-pulse md:p-6 dark:border-gray-700">

        //   {/* <script async type="application/javascript" src="https://cdn.scite.ai/badge/scite-badge-latest.min.js"></script><div className="scite-badge" data-doi="10.1016/j.biopsych.2005.08.012" data-tally-show='true' data-show-labels='true' data-section-tally-show='false' /> */}
        //     <div className="flex items-center justify-center h-48 mb-4 bg-gray-300 rounded dark:bg-gray-700">
        //         <svg className="w-12 h-12 text-gray-200 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 640 512"><path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z"/></svg>
        //     </div>
        //     <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
        //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
        //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
        //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
        //     <div className="flex items-center mt-4 space-x-3">
        //         <svg className="text-gray-200 w-14 h-14 dark:text-gray-700" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path></svg>
        //         <div>
        //             <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
        //             <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
        //         </div>
        //     </div>
        //     <span className="sr-only">Loading...</span>
        // </div>
        <></>
      )}
    </>
  )
}

function DynamicMaterialsCard(context: ContextWithMetadata) {
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null)
  const [presignedUrlPng, setPresignedUrlPng] = useState<string | null>(null)

  useEffect(() => {
    // HTML pages have original URLs
    console.log(
      'readable_filename',
      context.readable_filename,
      'Context.url',
      context.url,
    )
    if (context.url != '' && context.url != null) {
      console.log('SETTING CONTEXT URL', context.url)
      setPresignedUrl(context.url)
    } else {
      fetchPresignedUrl(context.s3_path).then((url) => {
        console.log('Using S3', url)
        setPresignedUrl(url + '#page=' + context.pagenumber)
      })
    }

    // ONLY PDFs have thumbnail images
    if (context.s3_path.endsWith('.pdf')) {
      const s3_thumbnail_path = context.s3_path.replace(
        '.pdf',
        '-pg1-thumb.png',
      )
      fetchPresignedUrl(s3_thumbnail_path).then((url) => {
        setPresignedUrlPng(url)
      })
    } else {
      // No thumbnail for non-PDFs
      setPresignedUrlPng(null)
    }
  }, [])

  return (
    <div className="box-sizing: border-box; border: 100px solid #ccc;">
      <Link
        href={presignedUrl || '#'}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Card
          bg="#0E1116"
          style={{ maxWidth: '20rem' }} // maxHeight: '15rem'
          shadow="sm"
          padding="sm"
          radius="md"
          withBorder
        >
          {presignedUrlPng && (
            <Card.Section>
              <Image
                // &auto=format&fit=crop&w=720&q=80
                pb={'3px'}
                src={
                  presignedUrlPng ||
                  'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80'
                }
                height={'4rem'}
                alt="Thumbnail image of the PDF cover page. Only available for PDFs, not Word or other filetypes."
              />
            </Card.Section>
          )}

          <Text
            className="fade-2-lines"
            style={{ fontFamily: 'Montserrat' }}
            size="sm"
            weight={500}
          >
            {context.readable_filename}
          </Text>
          {/* TODO: Add full link text? */}
          {/* {context.url != "" && context.url != null && (
            <Text
              // className="fade-2-lines"
              // className="kas-gradient-text"
              className="ul"
              style={{ fontFamily: 'Montserrat' }}
              size="xs"
              color='white'
              weight={300}
            >
              <u>{context.url}</u>
            </Text>
          )} */}

          <Group position="apart">
            <Text
              size="xs"
              variant="gradient"
              weight={600}
              gradient={{ from: 'gold', to: 'white', deg: 0 }}
            >
              AI summary
            </Text>
            <Text size="sm" variant="dimmed" weight={4300}>
              {context.pagenumber !== '' ? (
                <Text
                  pb="0"
                  className="justify-end"
                  size="xs"
                  variant="dimmed"
                  weight={400}
                >
                  Page {context.pagenumber}
                </Text>
              ) : (
                <>{/* NO PAGE NUMBER sorry :( */}</>
              )}
            </Text>
          </Group>

          <Text p="0px" className="fade-3-lines" size="xs" color="dimmed">
            {/* AI summary // pdf full text */}
            {context.text}
          </Text>
          {/* <IconExternalLink className='center-align' size={20} strokeWidth={2} color={'white'} /> */}

          {/* <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="xs" variant="dimmed" pb="0">
              Show full paragraph
            </Button>
          </div> */}

          {/* <SciteBadge /> */}
        </Card>
      </Link>
    </div>
  )
}
