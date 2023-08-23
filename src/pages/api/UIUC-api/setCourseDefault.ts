import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

const setCourseDefault = async (req: any, res: any) => {
  console.log('the req body:')
  console.log(req.body)
  const { course_name } = req.body

  try {
    console.log('setCourseAsDefault, calling kv.set')
    await kv.set('default_course', course_name)
    console.log('setCourseAsDefault, res = ', JSON.stringify(res))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false })
  }
}

export default setCourseDefault
