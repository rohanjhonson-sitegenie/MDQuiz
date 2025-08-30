// Minimal type system following theme types pattern
export type SupportedLocale = 'en' | 'zh-CN'

export type TranslationKeys = Record<string, string>

export interface LocaleConfig {
  locale: SupportedLocale
  translations: TranslationKeys
}
