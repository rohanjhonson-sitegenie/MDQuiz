import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { loadThemeFromEnv } from '@/lib/themes'
import { handleServerError } from '@/utils/handle-server-error'
import { AuthInitializer } from '@/components/auth/auth-initializer'
import { FontProvider } from './context/font-context'
import { LocaleProvider } from './context/locale-context'
import { ThemeProvider } from './context/theme-context'
import './index.css'
// Generated Routes
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Session expired!')
          useAuthStore.getState().auth.reset()
          // Redirect to CTID service for re-authentication
          const returnTo = `${window.location.origin}/auth/ready?next=${encodeURIComponent(router.history.location.href)}`
          const idServiceUrl =
            import.meta.env.VITE_ID_SERVICE_URL || 'https://devid.ctedu.ca'
          const url = `${idServiceUrl}/login?return_to=${encodeURIComponent(returnTo)}`
          window.location.assign(url)
        }
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!')
          router.navigate({ to: '/500' })
        }
        if (error.response?.status === 403) {
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Load theme configuration from environment
const themeConfig = loadThemeFromEnv()

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <LocaleProvider defaultLocale='en'>
          <ThemeProvider
            defaultTheme={themeConfig.defaultMode}
            storageKey='vite-ui-theme'
            themeConfig={themeConfig}
          >
            <FontProvider>
              <AuthInitializer>
                <RouterProvider router={router} />
              </AuthInitializer>
            </FontProvider>
          </ThemeProvider>
        </LocaleProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
