import { FC, useContext, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { DEFAULT_TEMPERATURE } from '@/utils/app/const'

import HomeContext from '~/pages/api/home/home.context'

interface Props {
  label: string
  onChangeTemperature: (temperature: number) => void
}

export const TemperatureSlider: FC<Props> = ({
  label,
  onChangeTemperature,
}) => {
  const {
    state: { conversations, ramonaModel },
  } = useContext(HomeContext)
  const lastConversation = conversations[ramonaModel] && conversations[ramonaModel].length > 0 ? conversations[ramonaModel][conversations[ramonaModel].length - 1] : null;
  const [temperature, setTemperature] = useState(
    lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
  )
  const { t } = useTranslation('chat')
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value)
    setTemperature(newValue)
    onChangeTemperature(newValue)
  }

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {label}
      </label>
      <span className="text-[12px] text-sm text-black/50 dark:text-white/50">
        {t(
          'Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.',
        )}
      </span>
      <span className="mb-1 mt-2 text-center text-neutral-900 dark:text-neutral-100">
        {temperature.toFixed(1)}
      </span>
      <input
        className="cursor-pointer"
        type="range"
        min={0}
        max={1}
        step={0.1}
        value={temperature}
        onChange={handleChange}
      />
      <ul className="w mt-2 flex justify-between px-[24px] pb-8 text-neutral-900 dark:text-neutral-100">
        <li className="flex justify-center">
          <span className="absolute">{t('Precise')}</span>
        </li>
        <li className="flex justify-center">
          <span className="absolute">{t('Neutral')}</span>
        </li>
        <li className="flex justify-center">
          <span className="absolute">{t('Creative')}</span>
        </li>
      </ul>
    </div>
  )
}
