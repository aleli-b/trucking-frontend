import { useMemo, type ReactNode } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'

type Props = {
  children: ReactNode
}

export function ThemeRoot({ children }: Props) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: { main: '#3949ab' },
          secondary: { main: '#00897b' },
        },
        shape: { borderRadius: 10 },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
          MuiButton: {
            defaultProps: { disableElevation: true },
          },
        },
      }),
    [prefersDarkMode],
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
