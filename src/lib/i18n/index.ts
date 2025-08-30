import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from './translations/en.json'
import zhCNTranslations from './translations/zh-CN.json'

export const initI18n = () => {
  i18n.use(initReactI18next).init({
    resources: {
      en: {
        translation: enTranslations,
      },
      'zh-CN': {
        translation: zhCNTranslations,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

  return i18n
}

export default i18n
