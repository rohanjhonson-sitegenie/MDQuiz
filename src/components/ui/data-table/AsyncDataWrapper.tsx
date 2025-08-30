import React from 'react'
import { DataTableEmpty } from './DataTableEmpty'
import { DataTableError } from './DataTableError'

interface AsyncDataWrapperProps<T> {
  data?: T[]
  isLoading: boolean
  error: Error | null
  onRetry?: () => void
  renderSkeleton: React.ReactNode
  renderError?: (error: Error, retry?: () => void) => React.ReactNode
  renderEmpty?: () => React.ReactNode
  children: (data: T[]) => React.ReactNode
}

export function AsyncDataWrapper<T>({
  data,
  isLoading,
  error,
  onRetry,
  renderSkeleton,
  renderError,
  renderEmpty,
  children,
}: AsyncDataWrapperProps<T>) {
  if (isLoading) return <>{renderSkeleton}</>

  if (error) {
    return renderError ? (
      <>{renderError(error, onRetry)}</>
    ) : (
      <DataTableError error={error} onRetry={onRetry} />
    )
  }

  if (!data || data.length === 0) {
    return renderEmpty ? <>{renderEmpty()}</> : <DataTableEmpty />
  }

  return <>{children(data)}</>
}
