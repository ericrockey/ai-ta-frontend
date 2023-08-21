import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { type CourseMetadata } from '~/types/courseMetadata'

export const runtime = 'edge'

const setCourseMetadata = async (req: any, res: any) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' })
    return NextResponse.json({
      success: false,
      message: 'Method not allowed, only POST requests.',
    })
  }

  const course_name = req.nextUrl.searchParams.get('course_name')
  const course_owner = req.nextUrl.searchParams.get('course_owner')
  const course_intro_message = req.nextUrl.searchParams.get(
    'course_intro_message',
  )
  const banner_image_s3 = req.nextUrl.searchParams.get('banner_image_s3')
  const is_private = req.nextUrl.searchParams.get('is_private')
  const is_default = req.nextUrl.searchParams.get('is_default')
  const course_admins = JSON.parse(
    req.nextUrl.searchParams.get('course_admins') || '[]',
  )
  const approved_emails_list = JSON.parse(
    req.nextUrl.searchParams.get('approved_emails_list') || '[]',
  )

  try {
    const course_metadata: CourseMetadata = {
      is_private: is_private,
      is_default: is_default,
      course_owner: course_owner,
      course_admins: course_admins,
      approved_emails_list: approved_emails_list,
      course_intro_message: course_intro_message,
      banner_image_s3: banner_image_s3,
    }
    console.log('Right before setting course_metadata with: ', course_metadata)
    await kv.set(course_name + '_metadata', course_metadata)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success: false })
  }
}

export default setCourseMetadata
