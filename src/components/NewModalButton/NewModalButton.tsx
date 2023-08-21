import { useRef, useState, useEffect } from 'react'
import { IconExternalLink, IconChevronDown } from '@tabler/icons-react'
import { useContext } from 'react'
import { useTranslation } from 'next-i18next'
import HomeContext from '~/pages/api/home/home.context'
import { useRouter } from 'next/router'
import { useUser } from '@clerk/nextjs'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({
  weight: '700',
  subsets: ['latin'],
})

export const NewModalButton = () => {
  const { t } = useTranslation('chat')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()
  const clerk_user = useUser()

  return (
    <>
      <input
        type="button"
        value="New Modal"
        className={`file-input-bordered file-input w-full border-violet-800 bg-violet-800 text-white  shadow-inner hover:border-violet-600 hover:bg-violet-800 ${montserrat.className}`}
        onClick={(e) => {
        if ( !clerk_user.isSignedIn) {
            setShowLoginModal(true);
            return;
        }
        router.push(`/new`)
        }}
      />
      {showLoginModal && (
        <div>You Must login first in the upper right corner</div>
      )}
    </>

  )
}
