import { useEffect } from 'react'
import { useSettingsStore } from '@/store/useSettingsStore'

export const useTheme = () => {
  const { theme } = useSettingsStore()

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement

      // Remove existing theme classes
      root.classList.remove('light', 'dark')

      // Apply theme based on setting
      if (theme === 'auto') {
        // Use system preference
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
        root.classList.add(prefersDark ? 'dark' : 'light')
      } else {
        root.classList.add(theme)
      }
    }

    applyTheme()

    // Listen for system theme changes when auto mode is selected
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', applyTheme)

      return () => {
        mediaQuery.removeEventListener('change', applyTheme)
      }
    }
  }, [theme])

  return { theme }
}

// Theme-aware class helper
export const getThemeClasses = (
  lightClasses: string,
  _darkClasses: string
): string => {
  // This would typically be used with a className utility
  // For now, we'll return the light classes as default
  return lightClasses
}
