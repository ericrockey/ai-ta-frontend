import { TextInput } from '@mantine/core'
import { IconAt } from '@tabler/icons-react'
import React, {
  useState,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
  type ClipboardEvent,
} from 'react'
import { type CourseMetadata } from '~/types/courseMetadata'

const EmailChipsComponent = ({
  course_name,
  course_owner,
  course_admins,
  is_private,
  is_default,
  onEmailAddressesChange,
  banner_image_s3,
  course_intro_message,
  course_prompt,
}: {
  course_name: string
  course_owner: string
  course_admins: string[]
  is_private: boolean
  is_default: boolean
  onEmailAddressesChange?: (
    new_course_metadata: CourseMetadata,
    course_name: string,
  ) => void // Add this prop type
  banner_image_s3: string
  course_intro_message: string
  course_prompt: string
}) => {
  const [emailAddresses, setEmailAddresses] = useState<string[]>([])
  const [courseName, setCourseName] = useState<string>(course_name)
  const [value, setValue] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const isPrivate = is_private
  const isDefault = is_default

  // fetch metadata on mount
  useEffect(() => {
    fetchCourseMetadata(course_name).then((metadata) => {
      if (metadata) {
        metadata.is_private = JSON.parse(
          metadata.is_private as unknown as string,
        )
        setEmailAddresses(metadata.approved_emails_list)
      }
    })
  }, [])

  const handleKeyDown_users = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', 'Tab', ','].includes(evt.key)) {
      evt.preventDefault()

      const trimmedValue = value.trim()

      if (trimmedValue && isValid(trimmedValue)) {
        // setEmailAddresses([...emailAddresses, trimmedValue])
        setEmailAddresses((prevEmailAddresses) => {
          const newEmailAddresses = [...prevEmailAddresses, trimmedValue]
          const curr_course_metadata = {
            is_private: isPrivate,
            is_default: isDefault,
            course_owner: course_owner,
            course_admins: course_admins,
            approved_emails_list: newEmailAddresses,
            course_intro_message: course_intro_message,
            banner_image_s3: banner_image_s3,
            course_prompt: course_prompt,
          }
          onEmailAddressesChange &&
            onEmailAddressesChange(curr_course_metadata, course_name)
          return newEmailAddresses
        })
        setValue('')

        callSetCourseMetadata({
          is_private: isPrivate,
          is_default: isDefault,
          course_owner: course_owner, // Replace with the appropriate course_owner value
          course_admins: course_admins, // Replace with the appropriate course_admins value (array of strings)
          approved_emails_list: [...emailAddresses, trimmedValue],
          banner_image_s3: banner_image_s3,
          course_intro_message: course_intro_message,
          course_prompt: course_prompt,
        })
      }
    }
  }

  const handleChange_users = (evt: ChangeEvent<HTMLInputElement>) => {
    setValue(evt.target.value)
    setError(null)
  }

  const handleDelete = (email_address: string) => {
    // setEmailAddresses(emailAddresses.filter((i) => i !== email_address))
    setEmailAddresses((prevEmailAddresses) => {
      const newEmailAddresses = prevEmailAddresses.filter(
        (i) => i !== email_address,
      )
      const curr_course_metadata = {
        is_private: isPrivate,
        is_default: isDefault,
        course_owner: course_owner,
        course_admins: course_admins,
        approved_emails_list: newEmailAddresses,
        course_intro_message: course_intro_message,
        banner_image_s3: banner_image_s3,
        course_prompt: course_prompt,
      }
      onEmailAddressesChange &&
        onEmailAddressesChange(curr_course_metadata, course_name)
      return newEmailAddresses
    })
    callRemoveUserFromCourse(email_address)
  }

  const handlePaste_users = (evt: ClipboardEvent<HTMLInputElement>) => {
    evt.preventDefault()

    const paste = evt.clipboardData.getData('text')
    const emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g)

    if (emails) {
      const toBeAdded = emails.filter((email) => !isInList(email))

      // setEmailAddresses([...emailAddresses, ...toBeAdded])

      setEmailAddresses((prevEmailAddresses) => {
        const newEmailAddresses = [...prevEmailAddresses, ...toBeAdded]
        const curr_course_metadata = {
          is_private: isPrivate,
          is_default: isDefault,
          course_owner: course_owner,
          course_admins: course_admins,
          approved_emails_list: newEmailAddresses,
          course_intro_message: course_intro_message,
          banner_image_s3: banner_image_s3,
          course_prompt: course_prompt,
        }
        onEmailAddressesChange &&
          onEmailAddressesChange(curr_course_metadata, course_name)
        return newEmailAddresses
      })

      callSetCourseMetadata({
        is_private: isPrivate,
        is_default: isDefault,
        course_owner: course_owner,
        course_admins: course_admins,
        approved_emails_list: [...emailAddresses, ...toBeAdded],
        banner_image_s3: banner_image_s3,
        course_intro_message: course_intro_message,
        course_prompt: course_prompt,
      })
    }
  }

  const isValid = (email: string) => {
    let localError = null

    if (isInList(email)) {
      localError = `${email} has already been added.`
    }

    if (!isEmail(email)) {
      localError = `${email} is not a valid email address.`
    }

    if (localError) {
      setError(localError)
      return false
    }

    return true
  }

  const isInList = (item: string) => {
    return emailAddresses.includes(item)
  }

  const isEmail = (email: string) => {
    return /[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(email)
  }

  const callSetCourseMetadata = async (courseMetadata: CourseMetadata) => {
    try {
      const { is_private, course_owner, course_admins, approved_emails_list } =
        courseMetadata
      const course_name = courseName

      const url = new URL(
        '/api/UIUC-api/setCourseMetadata',
        window.location.origin,
      )

      url.searchParams.append('is_private', String(is_private))
      url.searchParams.append('course_name', course_name)
      url.searchParams.append('course_owner', course_owner)
      url.searchParams.append('course_admins', JSON.stringify(course_admins))
      url.searchParams.append(
        'approved_emails_list',
        JSON.stringify(approved_emails_list),
      )
      url.searchParams.append('banner_image_s3', banner_image_s3)
      url.searchParams.append('course_intro_message', course_intro_message)

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error setting course metadata:', error)
      return false
    }
  }

  // Get and Set course exist in KV store
  const callRemoveUserFromCourse = async (email_to_remove: string) => {
    try {
      const course_name = courseName

      const url = new URL(
        '/api/UIUC-api/removeUserFromCourse',
        window.location.origin,
      )
      url.searchParams.append('course_name', course_name)
      url.searchParams.append('email_to_remove', email_to_remove)

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('Error removing user from course:', error)
      return false
    }
  }

  async function fetchCourseMetadata(course_name: string) {
    try {
      const response = await fetch(
        `/api/UIUC-api/getCourseMetadata?course_name=${course_name}`,
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

  return (
    <>
      <TextInput
        withAsterisk={true}
        icon={<IconAt />}
        size="md"
        style={{ minWidth: '20rem', maxWidth: '35rem' }}
        placeholder="Paste emails, even messy lists from Outlook"
        className={'p-3 ' + (error && 'border-color: tomato')}
        value={value}
        onKeyDown={handleKeyDown_users}
        onChange={handleChange_users}
        onPaste={handlePaste_users}
      />
      {emailAddresses.map((email_address) => (
        <div className="tag-item self-center" key={email_address}>
          {email_address}
          <button
            type="button"
            className="button"
            onClick={() => handleDelete(email_address)}
          >
            &times;
          </button>
        </div>
      ))}
      {error && <p className="error">{error}</p>}
    </>
  )
}

export default EmailChipsComponent
