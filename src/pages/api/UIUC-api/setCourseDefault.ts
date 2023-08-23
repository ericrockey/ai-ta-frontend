import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

const setCourseDefault = async (req: any, res: any) => {
  const course_name = req.nextUrl.searchParams.get('course_name')
  console.log('setCourseDefault, course_name = ', course_name)
  try {
    await kv.set('default_course', course_name)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.log(error)
    console.log('removeUserFromCourse FAILURE')
    return NextResponse.json({ success: false })
  }
}
export default setCourseDefault

