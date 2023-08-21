import { useRouter } from 'next/router'
import { useUser } from '@clerk/nextjs'
import ActionButton from '../Buttons/ActionButton/ActionButton'

export const GotoDefaultButton = () => {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/new`)
  }

  return (
    <ActionButton onClick={handleClick} label="GO" />
  )
}
