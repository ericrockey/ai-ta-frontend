import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

const getCourseDefault = async (req: any, res: any) => {

  try {
    const courseDefault = await kv.get('default_course')
    console.log('getCourseDefault, res = ', JSON.stringify(res))
    return NextResponse.json({ success: true, courseDefault })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success: false })
  }
}

export default getCourseDefault
