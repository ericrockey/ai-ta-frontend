import { Montserrat } from 'next/font/google'
import { MouseEventHandler } from 'react'

export interface ActiomButtonProps {
  onClick: MouseEventHandler<HTMLInputElement>
  label: string
  className?: string
}

const montserrat = Montserrat({
  weight: '700',
  subsets: ['latin'],
})
const ActionButton = ({ onClick, label, className }: ActiomButtonProps) => (
  <input
    type="button"
    value={label}
    className={`file-input-bordered file-input w-full border-violet-800 bg-violet-800 text-white  shadow-inner hover:border-violet-600 hover:bg-violet-800 ${montserrat.className} ${className}`}
    onClick={onClick}
    style={{ padding: 0 }}
  />
)

export default ActionButton
