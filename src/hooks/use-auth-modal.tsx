import { useState } from 'react'

/**
 * Custom hook for auth modal state management
 * Simple boolean state following existing useDialogState pattern
 * @returns Modal state and handlers for sign-in modal
 */
export function useAuthModal() {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return {
    isOpen,
    openModal,
    closeModal,
  }
}