import { useRef, useState, useEffect } from 'react'
import {IconChevronDown } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import classnames from 'classnames';

import styles from './PlaygroundSelect.module.scss'

const NewTrainingDataSet = 'New Model'

export const PlaygroundSelect = ({ isNew }: { isNew: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  const handlePlaygroundClick = async (playground: string) => {
    setIsOpen(false)
    if (playground === NewTrainingDataSet) {
      router.push(`/new`)
      return
    }
    console.log('setting route to ', `/${playground}`)
    router.push(`/${playground}`)
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

  // const newTrainingDataItem = clerk_user.isSignedIn ? [NewTrainingDataSet] : []

  const dropdownContents = [NewTrainingDataSet].concat(allCourses.map((playground) => playground));

  return (
    <div className={classnames(styles.playgroundContainer, 'flex flex-row')}>
      <div
        ref={wrapperRef}
        tabIndex={0}
        className="relative w-full rounded-lg border-neutral-200 bg-neutral-50 pr-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        <div className={classnames(styles.dropdownLabel, 'flex w-full items-center justify-between bg-transparent p-2')}>
          Choose Model
          <IconChevronDown size={18} />
        </div>
        {isOpen && (
          <ul className={classnames(styles.dropdown, 'menu rounded-box absolute z-[1] w-full bg-base-100 p-2 shadow')}>
            {dropdownContents.map((playground, index, array) => (
              <li
                key={index}
                className={`dark:text-white ${
                  index < array.length - 1
                    ? 'border-b border-neutral-200 pb-2 dark:border-neutral-600'
                    : ''
                }`}
              >
                <a onClick={() => handlePlaygroundClick(playground)}>
                  {playground}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}
