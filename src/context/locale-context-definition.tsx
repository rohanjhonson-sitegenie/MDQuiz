import { createContext } from 'react'
import { SupportedLocale } from '@/lib/i18n/types'

type LocaleProviderState = {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  t: (key: string, params?: Record<string, string>) => string
}

const initialState: LocaleProviderState = {
  locale: 'en',
  setLocale: () => null,
  t: (key: string) => key,
}

export const LocaleProviderContext =
  createContext<LocaleProviderState>(initialState)
export type { LocaleProviderState }
