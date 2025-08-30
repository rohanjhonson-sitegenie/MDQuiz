/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_THEME_PRESET?:
    | 'default'
    | 'emerald'
    | 'crimson'
    | 'ocean'
    | 'sunset'
  readonly VITE_DEFAULT_MODE?: 'light' | 'dark' | 'system'
  readonly VITE_ENABLE_CUSTOM_THEME?: string
  readonly VITE_PRIMARY_COLOR?: string
  readonly VITE_SECONDARY_COLOR?: string
  readonly VITE_ACCENT_COLOR?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
