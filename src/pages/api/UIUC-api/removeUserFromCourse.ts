import { kv } from '@vercel/kv'
import { CourseMetadata } from '~/types/courseMetadata'

export const runtime = 'edge'

const removeUserFromCourse = async (req: any, res: any) => {
  const { course_name, email_to_remove } = req.query

  try {
    const course_metadata = (await kv.get(
      course_name + '_metadata',
    )) as CourseMetadata

    if (!course_metadata) {
      res.status(500).json({ success: false })
      return
    }

    // Remove just one email
    const remaining_email_addresses = course_metadata[
      'approved_emails_list'
    ].filter((i) => i !== email_to_remove)

    const updated_course_metadata: CourseMetadata = {
      course_owner: course_metadata['course_owner'],
      course_admins: course_metadata['course_admins'],
      approved_emails_list: remaining_email_addresses,
    }

    await kv.set(course_name + '_metadata', updated_course_metadata)
    res.status(200).json({ success: true })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false })
  }
}
export default removeUserFromCourse
