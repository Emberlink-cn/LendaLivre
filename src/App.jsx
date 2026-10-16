import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './app/routes'
import { AuthProvider } from './context/AuthContext'
import { InventoryProvider } from './context/InventoryContext'
import { LibraryProvider } from './context/LibraryContext'
import { ReadingProvider } from './context/ReadingContext'
import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ReadingProvider>
            <LibraryProvider>
              <InventoryProvider>
                <AppRoutes />
              </InventoryProvider>
            </LibraryProvider>
          </ReadingProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
