import { ThemeProvider } from 'styled-components'
import { AppContent } from './components/AppContent'
import { TB303Provider } from './contexts/TB303Context'
import { GlobalStyles } from './styles/GlobalStyles'
import { theme } from './styles/theme'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <TB303Provider>
        <AppContent />
      </TB303Provider>
    </ThemeProvider>
  )
}

export default App
