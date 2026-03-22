import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './app/routes'
import ThemeSync from './components/theme/ThemeSync'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeSync />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
