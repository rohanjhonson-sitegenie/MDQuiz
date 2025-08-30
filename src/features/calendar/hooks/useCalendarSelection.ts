import { useState, useCallback } from 'react'
import { isSameDay, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
import type { SelectionState, DateRange } from '../types/calendar.types'

interface UseCalendarSelectionOptions {
  mode?: 'single' | 'range' | 'multiple'
  onDateSelect?: (date: Date) => void
  onRangeSelect?: (range: DateRange) => void
  onMultipleSelect?: (dates: Date[]) => void
}

export function useCalendarSelection(
  options: UseCalendarSelectionOptions = {}
) {
  const {
    mode = 'single',
    onDateSelect,
    onRangeSelect,
    onMultipleSelect,
  } = options

  const [state, setState] = useState<SelectionState>({
    selectedDate: null,
    selectedRange: null,
    selectionMode: mode,
    selectedDates: [],
  })

  const [rangeStart, setRangeStart] = useState<Date | null>(null)

  const isDateSelected = useCallback(
    (date: Date): boolean => {
      const { selectedDate, selectedRange, selectedDates, selectionMode } =
        state

      switch (selectionMode) {
        case 'single':
          return selectedDate ? isSameDay(date, selectedDate) : false

        case 'range': {
          if (!selectedRange) return false
          const dayStart = startOfDay(date)
          const dayEnd = endOfDay(date)
          return (
            (isAfter(dayStart, startOfDay(selectedRange.start)) ||
              isSameDay(dayStart, selectedRange.start)) &&
            (isBefore(dayEnd, endOfDay(selectedRange.end)) ||
              isSameDay(dayEnd, selectedRange.end))
          )
        }

        case 'multiple':
          return selectedDates.some((selected) => isSameDay(selected, date))

        default:
          return false
      }
    },
    [state]
  )

  const selectDate = useCallback(
    (date: Date) => {
      switch (mode) {
        case 'single':
          setState((prev) => ({
            ...prev,
            selectedDate: date,
            selectedRange: null,
            selectedDates: [],
          }))
          onDateSelect?.(date)
          break

        case 'range':
          if (!rangeStart) {
            // First click - set range start
            setRangeStart(date)
            setState((prev) => ({
              ...prev,
              selectedDate: date,
              selectedRange: null,
            }))
          } else {
            // Second click - complete range
            const start = isBefore(date, rangeStart) ? date : rangeStart
            const end = isAfter(date, rangeStart) ? date : rangeStart
            const range = { start, end }

            setState((prev) => ({
              ...prev,
              selectedDate: null,
              selectedRange: range,
            }))
            setRangeStart(null)
            onRangeSelect?.(range)
          }
          break

        case 'multiple':
          setState((prev) => {
            const isSelected = prev.selectedDates.some((d) =>
              isSameDay(d, date)
            )
            const newDates = isSelected
              ? prev.selectedDates.filter((d) => !isSameDay(d, date))
              : [...prev.selectedDates, date]

            onMultipleSelect?.(newDates)

            return {
              ...prev,
              selectedDates: newDates,
            }
          })
          break
      }
    },
    [mode, rangeStart, onDateSelect, onRangeSelect, onMultipleSelect]
  )

  const clearSelection = useCallback(() => {
    setState({
      selectedDate: null,
      selectedRange: null,
      selectionMode: mode,
      selectedDates: [],
    })
    setRangeStart(null)
  }, [mode])

  const setSelectionMode = useCallback(
    (newMode: 'single' | 'range' | 'multiple') => {
      setState({
        selectedDate: null,
        selectedRange: null,
        selectionMode: newMode,
        selectedDates: [],
      })
      setRangeStart(null)
    },
    []
  )

  return {
    ...state,
    rangeStart,
    isDateSelected,
    selectDate,
    clearSelection,
    setSelectionMode,
  }
}
