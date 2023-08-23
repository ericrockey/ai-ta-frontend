import { useRouter } from 'next/router'
import { createStyles, Text } from '@mantine/core'
import React, { useState } from 'react'
import { Montserrat } from 'next/font/google'


const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'relative',
    marginBottom: theme.spacing.md,
    maxWidth: '340px',
    width: '100%',
  },

  button: {
    width: '100%',
    border: 'none',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
    '--btn-text-case': 'none',
    height: '48px',
  },
}))

export function ToggleEdit({ course_name, isEditing }: { course_name?: string, isEditing?: boolean }) {
  const router = useRouter()
  const { classes, theme } = useStyles()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true)
    if (course_name === '') return
    if (isEditing) {
      router.push(`/${course_name}/gpt4`)
      return
    }
    router.push(`/${course_name}/materials`)
  }
  console.info('isEditing = ', isEditing);
  const label = isEditing ? 'Return to Chat' : 'Edit Model';

  return (
    <div className={classes.wrapper}>
      <button
        onClick={handleClick}
        className={`btn rounded-full ${classes.button}`}
        style={{
          backgroundColor: 'transparent',
          outline: `solid 1.5px ${theme.colors.grape[8]}`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = theme.colors.grape[8])
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = 'transparent')
        }
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-xs"></span>
          </>
        ) : (
          <>
            <Text
              size={theme.fontSizes.sm}
              color={
                theme.colorScheme === 'dark'
                  ? theme.colors.gray[0]
                  : theme.black
              }
            >
              {label}
            </Text>
            {isEditing ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 11h.01M8 11h.01M16 11h.01m-3.72 6.998C18.096 17.934 21 15.918 21 11c0-5-3-7-9-7s-9 2-9 7c0 3.077 1.136 5.018 3.409 6.056L5 21l7.29-3.002Z"
                  stroke="#FFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path stroke="white" fill-color="white" fill-rule="evenodd" clip-rule="evenodd" d="M21.019,1.734l1.365,1.365c0.555,0.555,0.555,1.461,0,2.016l-0.683,0.683  l-3.381-3.38l0.683-0.683C19.558,1.18,20.465,1.18,21.019,1.734L21.019,1.734z M5.107,1.719C2.958,1.719,1.2,3.477,1.2,5.626v13.148  c0,2.149,1.758,3.907,3.908,3.907h13.148c2.148,0,3.907-1.758,3.907-3.907V8.285l-2.294,2.293v8.196  c0,0.888-0.726,1.613-1.613,1.613H5.107c-0.888,0-1.614-0.726-1.614-1.613V5.626c0-0.888,0.726-1.614,1.614-1.614h8.669l2.293-2.293  H5.107L5.107,1.719z M9.024,15.094l0.553-1.982l0.552-1.983l1.43,1.431l1.43,1.43l-1.982,0.553L9.024,15.094L9.024,15.094z   M20.986,6.512l-3.381-3.38l-7.021,7.021v0l3.38,3.38l0,0L20.986,6.512z"/>
              </svg>
            )}            
          </>
        )}
      </button>
    </div>
  )
}
