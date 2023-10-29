import { Settings } from '@/types/settings'

const STORAGE_KEY = 'settings'

export const getSettings = (): Settings => {
  let settings: Settings = {
    theme: 'dark',
    cooldown: 0,
  }
  if (typeof window === 'undefined') return { theme: 'dark', cooldown: 1 };
  const settingsJson = localStorage.getItem(STORAGE_KEY)
  if (settingsJson) {
    try {
      const savedSettings = JSON.parse(settingsJson) as Settings
      settings = Object.assign(settings, savedSettings)
    } catch (e) {
      console.error(e)
    }
  }
  return settings
}

export const saveSettings = (settings: Settings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
