import { useRouter } from 'next/router'
import ActionButton from '../Buttons/ActionButton/ActionButton'
import { useEffect, useState } from 'react'

interface GotoDefaultButtonProps {
  prompt?: string;
}

export const GotoDefaultButton = ({ prompt }: GotoDefaultButtonProps) => {
  const router = useRouter()
  const [courseDefault, setCourseDefault] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourseDefault() {
      try {
        const url = new URL(
          '/api/UIUC-api/getCourseDefault',
          window.location.origin,
        )

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success === false) {
            console.error('An error occurred while fetching course metadata')
            return null
          }
          return data.course_default
        } else {
          console.error(`Error fetching course metadata: ${response.status}`)
          return null
        }
      } catch (error) {
        console.error('Error fetching course metadata:', error)
        return null
      }
    }

    fetchCourseDefault().then((course_default) => {
      setCourseDefault(course_default)
    })
  }, [])

  const [allCourses, setAllCourses] = useState<string[]>([]);

  useEffect(() => {
    async function fetchGetAllCourseNames() {
      const response = await fetch(`/api/UIUC-api/getAllCourseNames`)

      if (response.ok) {
        const data = await response.json()
        return data.all_course_names
      } else {
        console.error(`Error fetching course metadata: ${response.status}`)
        return null
      }
    }

    fetchGetAllCourseNames()
      .then((result) => {
        setAllCourses(result)
      })
      .catch((error) => {
        console.error(error)
      })
  }, []);

  const handleClick = () => {
    if (courseDefault && courseDefault != '') {
      router.push('/' + courseDefault)
      return
    }
    if (allCourses.length > 0) {
      router.push('/' + allCourses[0])
      return
    }
    router.push('/new')
  }

  return (
    <div style={{ width: '50px' }}>
      <ActionButton onClick={handleClick} label="GO" />
    </div>
  )
}
