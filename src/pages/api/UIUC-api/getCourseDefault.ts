import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

const getCourseDefault = async (req: any, res: any) => {
  try {
    const course_default = (await kv.get('default_course'))

    if (!course_default) {
      res.status(500).json({ success: false })
      return
    }
    return NextResponse.json({ success: true, course_default })
  } catch (error) {
    console.log(error)
    console.log('removeUserFromCourse FAILURE')
    return NextResponse.json({ success: false })
  }
}
export default getCourseDefault
