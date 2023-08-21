import { useRouter } from 'next/router'
import { useUser } from '@clerk/nextjs'
import ActionButton from '../Buttons/ActionButton/ActionButton'
import { useEffect, useState } from 'react'

export const GotoDefaultButton = () => {
  const router = useRouter()
  const [courseDefault, setCourseDefault] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDefaultCourse() {
      try {
        const response = await fetch(
          '/api/UIUC-api/getDefaultCourse',
        )

        if (response.ok) {
          const data = await response.json()
          if (data.success === false) {
            console.error('An error occurred while fetching course metadata')
            return null
          }
          return data.course_metadata
        } else {
          console.error(`Error fetching course metadata: ${response.status}`)
          return null
        }
      } catch (error) {
        console.error('Error fetching course metadata:', error)
        return null
      }
    }

    fetchDefaultCourse().then((defaultCourse) => {
      setCourseDefault(defaultCourse)
    })
  }, [])

  const handleClick = () => {
    if (courseDefault) {
      router.push(`/` + courseDefault)
      return
    }
    router.push('/new')
  }

  return (
    <ActionButton onClick={handleClick} label="GO" />
  )
}
