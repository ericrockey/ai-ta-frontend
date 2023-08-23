import React, { useEffect, useState } from 'react'
import {
  Card,
  Text,
  Flex,
  Group,
  Checkbox,
  Title,
  type CheckboxProps,
  Paper,
  Input,
  Button,
  rem,
  createStyles,
} from '@mantine/core'
import { IconLock, IconQuestionMark } from '@tabler/icons-react'
import { type CourseMetadata } from '~/types/courseMetadata'
import LargeDropzone from './LargeDropzone'
import EmailChipsComponent from './EmailChipsComponent'
import { useMediaQuery } from '@mantine/hooks'
import { Montserrat } from 'next/font/google'
import { callUpsertCourseMetadata } from '~/pages/api/UIUC-api/upsertCourseMetadata'
import { GetCurrentPageName } from './CanViewOnlyCourse'
import { useRouter } from 'next/router'
import { LoadingSpinner } from '~/components/UIUC-Components/LoadingSpinner'
import axios from 'axios'
import { WebScrape } from '~/components/UIUC-Components/WebScrape'
import { DEFAULT_SYSTEM_PROMPT } from '~/utils/app/const'

const montserrat = Montserrat({
  weight: '700',
  subsets: ['latin'],
})

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'relative',
    marginBottom: rem(20),
    maxWidth: '320px',
    width: '100%',
  },

  dropzone: {
    width: '100%',
    borderWidth: rem(1),
    paddingBottom: rem(20),
    height: 'auto',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    border: 'none',
    outline: 'solid 1.5px',
    outlineColor: theme.colors.grape[8],
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.xl,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
    '--btn-text-case': 'none',
    height: '48px',
  },

  icon: {
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },

  control: {
    position: 'absolute',
    width: rem(250),
    left: `calc(50% - ${rem(125)})`,
    bottom: rem(-20),
  },
}))

const EditCourseCard = ({
  course_name,
  current_user_email,
  is_new_course = false,
  courseMetadata,
}: {
  course_name: string
  current_user_email: string
  is_new_course?: boolean
  courseMetadata?: CourseMetadata
}) => {
  const [introMessage, setIntroMessage] = useState('')
  const [coursePrompt, setCoursePrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [courseName, setCourseName] = useState(course_name || '')
  const [isCourseAvailable, setIsCourseAvailable] = useState<
    boolean | undefined
  >(undefined)
  const [allExistingCourseNames, setAllExistingCourseNames] = useState<
    string[]
  >([])
  const isSmallScreen = useMediaQuery('(max-width: 960px)')
  const [courseBannerUrl, setCourseBannerUrl] = useState('')
  const [isIntroMessageUpdated, setIsIntroMessageUpdated] = useState(false)
  const [isPromptUpdated, setIsPromptUpdated] = useState(false)
  const [loadinSpinner, setLoadinSpinner] = useState(false)

  const { classes, theme } = useStyles()
  const checkCourseAvailability = () => {
    const courseExists =
      courseName != '' &&
      allExistingCourseNames &&
      allExistingCourseNames.includes(courseName)
    setIsCourseAvailable(!courseExists)
  }

  const router = useRouter()
  const checkIfNewCoursePage = () => {
    // `/new` --> `new`
    // `/new?course_name=mycourse` --> `new`
    return router.asPath.split('/')[1]?.split('?')[0] as string
  }

  useEffect(() => {
    console.log('courseMetadata = ', JSON.stringify(courseMetadata))
  }, [courseMetadata?.course_prompt])

  useEffect(() => {
    // only run when creating new courses.. otherwise VERY wasteful on DB.
    if (checkIfNewCoursePage() == 'new') {
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
          setAllExistingCourseNames(result)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }, [])

  useEffect(() => {
    checkCourseAvailability()
  }, [courseName])

  useEffect(() => {
    setIntroMessage(courseMetadata?.course_intro_message || '')
  }, [courseMetadata])

  useEffect(() => {
    setCoursePrompt(courseMetadata?.course_prompt || '')
  }, [courseMetadata])

  const uploadToS3 = async (file: File | null) => {
    if (!file) return

    const requestObject = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        courseName: course_name,
      }),
    }

    try {
      interface PresignedPostResponse {
        post: {
          url: string
          fields: { [key: string]: string }
        }
      }

      // Then, update the lines where you fetch the response and parse the JSON
      const response = await fetch('/api/UIUC-api/uploadToS3', requestObject)
      const data = (await response.json()) as PresignedPostResponse

      const { url, fields } = data.post as {
        url: string
        fields: { [key: string]: string }
      }
      const formData = new FormData()

      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value)
      })

      formData.append('file', file)

      await fetch(url, {
        method: 'POST',
        body: formData,
      })

      console.log(file.name + 'uploaded to S3 successfully!!')
      return data.post.fields.key
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  const handleDeleteModel = () => {

  }

  return (
    <Card
      shadow="xs"
      padding="none"
      radius="xl"
      style={{ maxWidth: '85%', width: '100%', marginTop: '4%' }}
    >
      <Flex direction={isSmallScreen ? 'column' : 'row'}>
        <div
          style={{
            flex: isSmallScreen ? '1 1 100%' : '1 1 60%',
            border: 'None',
            color: 'white',
          }}
          className="min-h-full bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-800"
        >
          <Group
            // spacing="lg"
            m="3rem"
            align="center"
            style={{ justifyContent: 'center' }}
          >
            <Title
              order={2}
              variant="gradient"
              gradient={{ from: 'gold', to: 'white', deg: 50 }}
              className={montserrat.className}
            >
              {!is_new_course ? `${courseName}` : 'Name Your Modal'}
            </Title>
            {is_new_course && (
              <>
                <input
                  type="text"
                  placeholder="Project name"
                  value={courseName}
                  onChange={(e) =>
                    setCourseName(e.target.value.replaceAll(' ', '-'))
                  }
                  disabled={!is_new_course}
                  className={`input-bordered input w-[70%] rounded-lg border-2 border-solid bg-gray-800 lg:w-[50%] 
                                ${
                                  isCourseAvailable && courseName != ''
                                    ? 'border-2 border-green-500 text-green-500 focus:border-green-500'
                                    : 'border-red-800 text-red-600 focus:border-red-800'
                                } ${montserrat.className}`}
                />
                <Title
                  order={4}
                  className={`w-full text-center ${montserrat.className} mt-4`}
                >
                  Just one step: upload any and all materials. More is better,
                  it&apos;s fine if they&apos;re messy.
                </Title>
              </>
            )}
            <Flex direction={'column'} align={'center'} w={'100%'}>
              <div className={'flex flex-row items-center'}>
                {loadinSpinner && (
                  <>
                    <LoadingSpinner size={'sm'} />
                    <Title order={4}>
                      Please wait while the course is ingested...
                    </Title>
                  </>
                )}
              </div>
              <LargeDropzone
                course_name={courseName}
                current_user_email={current_user_email}
                redirect_to_gpt_4={false}
                isDisabled={
                  is_new_course && (!isCourseAvailable || courseName === '')
                }
                courseMetadata={courseMetadata as CourseMetadata}
                is_new_course={is_new_course}
              />
            </Flex>
          </Group>
        </div>
        {!is_new_course && (
          <div
            style={{
              flex: isSmallScreen ? '1 1 100%' : '1 1 40%',
              padding: '1rem',
              backgroundColor: '#15162c',
              color: 'white',
            }}
          >
            <div className="card flex h-full flex-col justify-center">
              <div className="card-body">
                <div className="form-control relative">
                  <label className={`label ${montserrat.className}`}>
                    <span className="label-text text-lg text-neutral-200">
                      Introductory Message
                    </span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Enter the introductory message of the chatbot"
                    className={`textarea-bordered textarea w-full border-2 border-violet-800 bg-white text-black hover:border-violet-800 ${montserrat.className}`}
                    value={introMessage}
                    onChange={(e) => {
                      setIntroMessage(e.target.value)
                      setIsIntroMessageUpdated(true)
                    }}
                  />
                  {isIntroMessageUpdated && (
                    <>
                      <button
                        className="btn-outline btn absolute bottom-0 right-0 m-1 h-[2%] rounded-3xl border-violet-800 py-1 text-violet-800  hover:bg-violet-800 hover:text-white"
                        onClick={async () => {
                          setIsIntroMessageUpdated(false)
                          if (courseMetadata) {
                            courseMetadata.course_intro_message = introMessage
                            await callUpsertCourseMetadata(
                              course_name,
                              courseMetadata,
                            ) // Update the courseMetadata object
                          }
                        }}
                      >
                        Submit
                      </button>
                    </>
                  )}
                </div>
                <div className="form-control relative">
                  <label className={`label ${montserrat.className}`}>
                    <span className="label-text text-lg text-neutral-200">
                      Prompt to send to ChatGPT
                    </span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Enter instructions to ChatGPT to help it generate the proper response. The user will not see this"
                    className={`textarea-bordered textarea w-full border-2 border-violet-800 bg-white text-black hover:border-violet-800 ${montserrat.className}`}
                    value={coursePrompt}
                    onChange={(e) => {
                      setCoursePrompt(e.target.value)
                      setIsPromptUpdated(true)
                    }}
                  />
                  {isPromptUpdated && (
                    <>
                      <button
                        className="btn-outline btn absolute bottom-0 right-0 m-1 h-[2%] rounded-3xl border-violet-800 py-1 text-violet-800  hover:bg-violet-800 hover:text-white"
                        onClick={async () => {
                          setIsPromptUpdated(false)
                          if (courseMetadata) {
                            courseMetadata.course_prompt = coursePrompt
                            await callUpsertCourseMetadata(
                              course_name,
                              courseMetadata,
                            ) // Update the courseMetadata object
                          }
                        }}
                      >
                        Submit
                      </button>
                    </>
                  )}
                </div>
                {/* <div className="form-control mt-4">
                  <label className={`label ${montserrat.className}`}>
                    <span className="label-text text-lg text-neutral-200">
                      Upload Banner
                    </span>
                  </label>
                  <input
                    type="file"
                    className={`file-input-bordered file-input w-full border-violet-800 bg-violet-800 text-white  shadow-inner hover:border-violet-600 hover:bg-violet-800 ${montserrat.className}`}
                    onChange={async (e) => {
                      // Assuming the file is converted to a URL somewhere else
                      setCourseBannerUrl(e.target.value)
                      if (e.target.files?.length) {
                        console.log('Uploading to s3')
                        const banner_s3_image = await uploadToS3(
                          e.target.files?.[0] ?? null,
                        )
                        if (banner_s3_image && courseMetadata) {
                          courseMetadata.banner_image_s3 = banner_s3_image
                          await callUpsertCourseMetadata(
                            course_name,
                            courseMetadata,
                          ).then(() => setCourseBannerUrl(banner_s3_image)) // Update the courseMetadata object
                        }
                      }
                    }}
                  />
                </div> */}
                <PrivateOrPublicCourse
                  course_name={course_name}
                  current_user_email={current_user_email}
                  courseMetadata={courseMetadata as CourseMetadata}
                  // course_intro_message={
                  //   courseMetadata?.course_intro_message || ''
                  // }
                  // is_private={courseMetadata?.is_private || false}
                  // banner_image_s3={courseBannerUrl}
                />
                {/* <Group position="center" align="center" onClick={handleDeleteModel}>
                  <Text
                    ta="center"
                    style={{ color: theme.white, fontWeight: 600 }}
                    size={theme.fontSizes.sm}
                  >
                    Delete Model
                  </Text>
                </Group> */}
              </div>
            </div>
          </div>
        )}
      </Flex>
    </Card>
  )
}

const PrivateOrPublicCourse = ({
  course_name,
  current_user_email,
  courseMetadata,
}: {
  course_name: string
  current_user_email: string
  courseMetadata: CourseMetadata
}) => {
  const [isPrivate, setIsPrivate] = useState(courseMetadata.is_private)
  const [isDefault, setIsDefault] = useState(false)
  // const { user, isSignedIn, isLoaded } = useUser()
  // const user_emails = extractEmailsFromClerk(user)
  // console.log("in MakeNewCoursePage.tsx user email list: ", user_emails )

  useEffect(() => {
    console.log('about to call fetchCourseDefault')
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

        console.log('fetchCourseDefault, fetch res = ', JSON.stringify(response))
        if (response.ok) {
          const data = await response.json()
          if (data.success === false) {
            console.error('An error occurred while fetching course metadata')
            return null
          }
          console.log('success returning getCourseDefault, data = ' , JSON.stringify(data))
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
      console.log('defaultCourse = ', course_default)
      if (course_default === course_name) setIsDefault(true);
    })
  }, [])

  const CheckboxIcon: CheckboxProps['icon'] = ({ indeterminate, className }) =>
    indeterminate ? (
      <IconLock className={className} />
    ) : (
      <IconLock className={className} />
    )

  const handleIsPrivateChange = () => {
    const callSetCoursePublicOrPrivate = async (
      course_name: string,
      is_private: boolean,
    ) => {
      try {
        const url = new URL(
          '/api/UIUC-api/setCoursePublicOrPrivate',
          window.location.origin,
        )
        url.searchParams.append('course_name', course_name)
        url.searchParams.append('is_private', String(is_private))

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const data = await response.json()
        return data.success
      } catch (error) {
        console.error(
          'Error changing course from public to private (or vice versa):',
          error,
        )
        return false
      }
    }

    setIsPrivate(!isPrivate) // react gui
    callSetCoursePublicOrPrivate(course_name, !isPrivate) // db
  }

  const handleIsDefaultChange = () => {
    const callSetCourseDefault = async (
      course_name: string,
    ) => {
      try {
        const url = new URL(
          '/api/UIUC-api/setCourseDefault',
          window.location.origin,
        )
        url.searchParams.append('course_name', course_name)
        console.log('url = ', url)
        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const data = await response.json()
        return data.success
      } catch (error) {
        console.error(
          'Error changing course from public to private (or vice versa):',
          error,
        )
        return false
      }
    }

    setIsDefault(true) // react gui
    callSetCourseDefault(course_name) // db
  }

  const callSetCourseMetadata = async (
    courseMetadata: CourseMetadata,
    course_name: string,
  ) => {
    try {
      const {
        is_private,
        course_owner,
        course_admins,
        approved_emails_list,
        course_intro_message,
        course_prompt,
        banner_image_s3,
      } = courseMetadata

      console.log(
        'IN callSetCourseMetadata in MakeNewCoursePage: ',
        courseMetadata,
      )

      const url = new URL(
        '/api/UIUC-api/setCourseMetadata',
        window.location.origin,
      )

      url.searchParams.append('is_private', String(is_private))
      url.searchParams.append('course_name', course_name)
      url.searchParams.append('course_owner', course_owner)
      url.searchParams.append(
        'course_intro_message',
        course_intro_message || '',
      )
      url.searchParams.append(
        'course_prompt',
        course_prompt || DEFAULT_SYSTEM_PROMPT,
      )
      url.searchParams.append('banner_image_s3', banner_image_s3 || '')
      url.searchParams.append('course_admins', JSON.stringify(course_admins))
      url.searchParams.append(
        'approved_emails_list',
        JSON.stringify(approved_emails_list),
      )

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

  const handleEmailAddressesChange = (
    new_course_metadata: CourseMetadata,
    course_name: string,
  ) => {
    console.log('Fresh course metadata:', new_course_metadata)
    callSetCourseMetadata(
      {
        ...new_course_metadata,
      },
      course_name,
    )
  }

  return (
    <>
      <Title
        className={montserrat.className}
        variant="gradient"
        gradient={{ from: 'gold', to: 'white', deg: 50 }}
        order={2}
        p="xl"
        style={{ marginTop: '4rem', alignSelf: 'center' }}
      >
        {' '}
        Course Visibility{' '}
      </Title>
      <Group className="p-3">
        <Checkbox
          label={`Model is ${
            isPrivate ? 'private' : 'public'
          }. Click to change.`}
          // description="Modal is private by default."
          aria-label="Checkbox to toggle Modal being public or private. Private requires a list of allowed email addresses."
          className={montserrat.className}
          // style={{ marginTop: '4rem' }}
          size="xl"
          // bg='#020307'
          color="grape"
          icon={CheckboxIcon}
          defaultChecked={isPrivate}
          onChange={handleIsPrivateChange}
        />
        {!isDefault ? (
          <Checkbox
            label={`Model is ${
              isDefault ? 'default' : 'not default'
            }. Click to change.`}
            // description="Course is not default to start."
            aria-label="Checkbox to toggle this modal to be the default."
            className={montserrat.className}
            // style={{ marginTop: '4rem' }}
            size="xl"
            // bg='#020307'
            color="grape"
            icon={CheckboxIcon}
            defaultChecked={isPrivate}
            onChange={handleIsDefaultChange}
          />
        ) : (
          <div className={montserrat.className}>This model is set to be the default</div>
        )
      
      }

      </Group>
      {/* </Group>
      <Group className="p-3"> */}

      <Text>
        Only the below email address are able to access the content. Read our
        strict security policy (in progress).
      </Text>
      {isPrivate && (
        <EmailChipsComponent
          course_owner={current_user_email}
          course_admins={[]} // TODO: add admin functionality
          course_name={course_name}
          is_private={isPrivate}
          onEmailAddressesChange={handleEmailAddressesChange}
          course_intro_message={courseMetadata.course_intro_message || ''}
          banner_image_s3={courseMetadata.banner_image_s3 || ''}
          course_prompt={courseMetadata.course_prompt || DEFAULT_SYSTEM_PROMPT}
        />
      )}
    </>
  )
}

export default EditCourseCard
