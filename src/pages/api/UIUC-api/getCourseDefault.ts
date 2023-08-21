import { kv } from '@vercel/kv'

export const runtime = 'edge'

const getCourseDefault = async (req: any, res: any) => {

  try {
    const courseExists = await kv.get('default_course')
    res.status(200).json(courseExists as boolean)
    console.log('res = ', JSON.stringify(res))
    return res
  } catch (error) {
    console.log(error)
    res.status(500).json(false)
  }
}

export default getCourseDefault
