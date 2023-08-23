import { kv } from '@vercel/kv'

export const runtime = 'edge'

const getCourseDefault = async (req: any, res: any) => {

  try {
    const courseDefault = await kv.get('default_course')
    console.log('getCourseDefault, res = ', JSON.stringify(res))
    return courseDefault
  } catch (error) {
    console.log(error)
    res.status(500).json(false)
  }
}

export default getCourseDefault
