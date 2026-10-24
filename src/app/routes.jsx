import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Shell from '../components/layout/Shell'
import { useAuth } from '../context/AuthContext'
import { bootResume, clearResume } from '../lib/readingPlace'
import CatalogPage from '../pages/CatalogPage/CatalogPage'
import CreatorPage from '../pages/CreatorPage/CreatorPage'
import HomePage from '../pages/HomePage/HomePage'
import InventoryPage from '../pages/InventoryPage/InventoryPage'
import DeckPage from '../pages/EvolvePage/DeckPage'
import MatchPage from '../pages/EvolvePage/MatchPage'
import LoginPage from '../pages/LoginPage/LoginPage'
import ProfilePage from '../pages/ProfilePage/ProfilePage'
import ReadPage from '../pages/ReadPage/ReadPage'
import RegisterPage from '../pages/RegisterPage/RegisterPage'
import WorkPage from '../pages/WorkPage/WorkPage'

const openedAtHome = window.location.pathname === '/'
let entrySettled = !openedAtHome

function HomeEntry() {
  const { isAuthenticated, ready, user } = useAuth()
  const navigate = useNavigate()
  const [settled, setSettled] = useState(entrySettled)

  useEffect(() => {
    if (!ready || entrySettled) return
    entrySettled = true
    if (isAuthenticated) {
      navigate(bootResume(user?.id) || '/catalogo', { replace: true })
      return
    }
    setSettled(true)
  }, [ready, isAuthenticated, user?.id, navigate])

  if (!settled && (!ready || isAuthenticated)) return null
  return <HomePage />
}

function ResumeRoute() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const reader = pathname.startsWith('/ler/')

  useEffect(() => {
    if (!entrySettled || reader || !user?.id || document.visibilityState === 'hidden') return
    clearResume(user.id)
  }, [reader, user?.id])

  return null
}

function RequireAuth() {
  const { isAuthenticated, ready } = useAuth()
  const location = useLocation()
  if (!ready) return null
  if (!isAuthenticated) return <Navigate to="/entrar" replace state={{ from: location }} />
  return <Outlet />
}

export function AppRoutes() {
  return (
    <Shell>
      <ResumeRoute />
      <Routes>
        <Route path="/" element={<HomeEntry />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/criar-conta" element={<RegisterPage />} />
        <Route path="/login" element={<Navigate to="/entrar" replace />} />
        <Route path="/register" element={<Navigate to="/criar-conta" replace />} />
        <Route element={<RequireAuth />}>
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/obra/:workId/:chapterId" element={<WorkPage />} />
          <Route path="/obra/:workId" element={<WorkPage />} />
          <Route path="/ler/:workId/:chapterId" element={<ReadPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/evoluir" element={<DeckPage />} />
          <Route path="/evoluir/partida" element={<MatchPage />} />
          <Route path="/criador" element={<Navigate to="/criador/gerir" replace />} />
          <Route path="/criador/*" element={<CreatorPage />} />
          <Route path="/catalog" element={<Navigate to="/catalogo" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}
