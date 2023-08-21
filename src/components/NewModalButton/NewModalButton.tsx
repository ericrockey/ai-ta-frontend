import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useUser } from '@clerk/nextjs'
import ActionButton from '../Buttons/ActionButton/ActionButton'

export const NewModalButton = () => {
  const { t } = useTranslation('chat')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()
  const clerk_user = useUser()

  const handleClick = () => {
    if ( !clerk_user.isSignedIn) {
        setShowLoginModal(true);
        return;
    }
    router.push(`/new`)
  }

  return (
    <>
      <ActionButton onClick={handleClick} label="New Modal" />
      {showLoginModal && (
        <div>You Must login first in the upper right corner</div>
      )}
    </>

  )
}
