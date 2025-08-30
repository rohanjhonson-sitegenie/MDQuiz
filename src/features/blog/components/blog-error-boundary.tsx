import React from 'react'
import { AlertCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class BlogErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Blog error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex min-h-[400px] flex-col items-center justify-center p-8 text-center'>
          <AlertCircleIcon className='text-destructive mb-4 h-12 w-12' />
          <h2 className='mb-2 text-2xl font-semibold'>Something went wrong</h2>
          <p className='text-muted-foreground mb-4'>
            We encountered an error while loading this blog content.
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false })
              window.location.reload()
            }}
          >
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
