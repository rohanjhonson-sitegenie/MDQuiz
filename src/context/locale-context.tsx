import { useState } from 'react'
import {
  loadTranslations,
  interpolateString,
} from '@/lib/i18n/translation-loader'
import { SupportedLocale } from '@/lib/i18n/types'
import { LocaleProviderContext } from './locale-context-definition'

type LocaleProviderProps = {
  children: React.ReactNode
  defaultLocale?: SupportedLocale
  storageKey?: string
}

export function LocaleProvider({
  children,
  defaultLocale = 'en',
  storageKey = 'vite-ui-locale',
  ...props
}: LocaleProviderProps) {
  const [locale, _setLocale] = useState<SupportedLocale>(
    () => (localStorage.getItem(storageKey) as SupportedLocale) || defaultLocale
  )

  const setLocale = (locale: SupportedLocale) => {
    localStorage.setItem(storageKey, locale)
    _setLocale(locale)
  }

  const t = (key: string, params?: Record<string, string>): string => {
    const translations = loadTranslations(locale)
    const template = translations[key]
    return interpolateString(template, params)
  }

  const value = {
    locale,
    setLocale,
    t,
  }

  return (
    <LocaleProviderContext.Provider {...props} value={value}>
      {children}
    </LocaleProviderContext.Provider>
  )
}
