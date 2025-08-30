// Import translation files directly
import enTranslations from './translations/en.json'
import zhTranslations from './translations/zh-CN.json'
import { SupportedLocale, TranslationKeys } from './types'

const translations: Record<SupportedLocale, TranslationKeys> = {
  en: enTranslations,
  'zh-CN': zhTranslations,
}

// Simple loader following existing patterns
export function loadTranslations(locale: SupportedLocale): TranslationKeys {
  return translations[locale]
}

// Basic parameter substitution
export function interpolateString(
  template: string,
  params?: Record<string, string>
): string {
  if (!params) return template

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match
  })
}
