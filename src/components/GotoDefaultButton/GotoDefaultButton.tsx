import { useRouter } from 'next/router'
import ActionButton from '../Buttons/ActionButton/ActionButton'
import { useContext, useEffect, useState } from 'react'
import HomeContext from '~/pages/api/home/home.context';

interface GotoDefaultButtonProps {
  prompt: string;
}

export const GotoDefaultButton = ({ prompt }: GotoDefaultButtonProps) => {
  const router = useRouter()
  const [courseDefault, setCourseDefault] = useState<string | null>(null)
  const {
    state: { prompts, defaultModelId, showPromptbar },
    dispatch: homeDispatch,
  } = useContext(HomeContext)

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
    homeDispatch({ field: 'initialPrompt', value: prompt})
    if (courseDefault) {
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
