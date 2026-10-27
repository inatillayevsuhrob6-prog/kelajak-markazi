import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { api } from './lib/api'
import { AuthProvider } from './lib/auth'
import { I18nProvider } from './lib/i18n'
import { ToastProvider } from './lib/toast'
import Chatbot from './components/Chatbot'
import Footer from './components/Footer'
import Intro from './components/Intro'
import Navbar from './components/Navbar'
import About from './pages/About'
import Auth from './pages/Auth'
import Contact from './pages/Contact'
import { CourseDetail, Courses } from './pages/Courses'
import Events from './pages/Events'
import Gallery from './pages/Gallery'
import Home from './pages/Home'
import { News, NewsDetail } from './pages/News'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Projects from './pages/Projects'
import { useAuth } from './lib/auth'
import { Loading } from './components/UI'

// Boshqaruv paneli (grafiklar bilan) alohida bo‘lakda yuklanadi
const Admin = lazy(() => import('./pages/Admin'))

/** Sahifa o‘zgarganda scroll tepaga qaytadi va ko‘rish statistikaga yoziladi. */
function RouteEffects() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
    api('/track', { method: 'POST', body: { path: pathname } }).catch(() => {})
  }, [pathname])
  return null
}

function Private({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()
  if (loading) return null
  return user ? children : <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>
            <Intro />
            <RouteEffects />
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-brand">Asosiy kontentga oʻtish</a>
            <Navbar />
            <main id="main" className="min-h-[70vh]">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:slug" element={<CourseDetail />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:slug" element={<NewsDetail />} />
                <Route path="/events" element={<Events />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Auth mode="login" />} />
                <Route path="/register" element={<Auth mode="register" />} />
                <Route path="/profile" element={<Private><Profile /></Private>} />
                <Route path="/admin/:tab?" element={<Suspense fallback={<Loading />}><Admin /></Suspense>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <Chatbot />
          </AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}
