import { useRef, useState, useEffect } from 'react'
import { IconExternalLink, IconChevronDown } from '@tabler/icons-react'
import { useContext } from 'react'
import { useTranslation } from 'next-i18next'
import HomeContext from '~/pages/api/home/home.context'
import { useRouter } from 'next/router'
import { useUser } from '@clerk/nextjs'
import classnames from 'classnames';

import styles from './PlaygroundSelect.module.scss'

const NewTrainingDataSet = 'New Training Data Set'

export const PlaygroundSelect = ({ isNew }: { isNew: boolean }) => {
  const { t } = useTranslation('chat')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const clerk_user = useUser()

  const handlePlaygroundClick = (playground: string) => {
    setIsOpen(false)
    if (playground === NewTrainingDataSet) {
      router.push(`/new`)
      return
    }
    router.push(`/${playground}/materials`)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }

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

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [wrapperRef])


  const newTrainingDataItem = clerk_user.isSignedIn ? [NewTrainingDataSet] : []
  console.log('newTrainingDataItem = ', newTrainingDataItem);
  const dropdownContents = allCourses.map((playGround) => playGround).concat(newTrainingDataItem);

  console.info('clerk_user.isSignedIn = ', JSON.stringify(clerk_user.isSignedIn))
  console.info('dropdownContents  = ', JSON.stringify(dropdownContents))
  return (
    <div className={classnames('flex flex-row playgroundContainer')}>
      <div
        ref={wrapperRef}
        tabIndex={0}
        className="relative w-full rounded-lg border-neutral-200 bg-neutral-50 pr-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        <div className="flex w-full items-center justify-between bg-transparent p-2">
          Switch Model
          <IconChevronDown size={18} />
        </div>
        {isOpen && (
          <ul className="menu rounded-box absolute z-[1] w-full bg-base-100 p-2 shadow ">
            {dropdownContents.map((Playground, index, array) => (
              <li
                key={index}
                className={`dark:text-white ${
                  index < array.length - 1
                    ? 'border-b border-neutral-200 pb-2 dark:border-neutral-600'
                    : ''
                }`}
              >
                <a onClick={() => handlePlaygroundClick(Playground)}>
                  {Playground}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}
