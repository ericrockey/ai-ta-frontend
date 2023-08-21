import { kv } from '@vercel/kv'

// export const runtime = "edge";
// doesn't seem to work...

const setCourseAsDefault = async (req: any, res: any) => {
  console.log('the req body:')
  console.log(req.body)
  const { course_name } = req.body

  try {
    await kv.set('default_course', course_name)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
}

export default setCourseAsDefault
