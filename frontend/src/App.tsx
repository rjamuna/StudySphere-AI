import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';

const Landing      = lazy(() => import('./pages/Landing'));
const Login        = lazy(() => import('./pages/Login'));
const Register     = lazy(() => import('./pages/Register'));
const Dashboard    = lazy(() => import('./pages/Dashboard'));
const AITutor      = lazy(() => import('./pages/AITutor'));
const PDFLearning  = lazy(() => import('./pages/PDFLearning'));
const Roadmap      = lazy(() => import('./pages/Roadmap'));
const StudyPlanner = lazy(() => import('./pages/StudyPlanner'));
const QuizPage     = lazy(() => import('./pages/Quiz'));
const Notes        = lazy(() => import('./pages/Notes'));
const Profile      = lazy(() => import('./pages/Profile'));
const ChatHistory  = lazy(() => import('./pages/ChatHistory'));
const Activity     = lazy(() => import('./pages/Activity'));
const Notifications= lazy(() => import('./pages/Notifications'));
const Bookmarks    = lazy(() => import('./pages/Bookmarks'));
const GlobalSearch = lazy(() => import('./pages/GlobalSearch'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Settings     = lazy(() => import('./pages/Settings'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #5B5FEF, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"/><path d="M12 3V21M4 7.5L20 16.5M20 7.5L4 16.5"/>
        </svg>
      </div>
      <div className="dot-loader"><span/><span/><span/></div>
    </div>
  </div>
);

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ height: '100%' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/"         element={<Landing />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<Layout />}>
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/tutor"         element={<AITutor />} />
              <Route path="/pdf"           element={<PDFLearning />} />
              <Route path="/roadmap"       element={<Roadmap />} />
              <Route path="/planner"       element={<StudyPlanner />} />
              <Route path="/quiz"          element={<QuizPage />} />
              <Route path="/notes"         element={<Notes />} />
              <Route path="/profile"       element={<Profile />} />
              <Route path="/history"       element={<ChatHistory />} />
              <Route path="/history/:id"   element={<ChatHistory />} />
              <Route path="/activity"      element={<Activity />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/bookmarks"     element={<Bookmarks />} />
              <Route path="/search"        element={<GlobalSearch />} />
              <Route path="/achievements"  element={<Achievements />} />
              <Route path="/settings"      element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'var(--surface)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: '12px',
                fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
                boxShadow: 'var(--shadow-md)', padding: '0.75rem 1rem',
              },
              success: { iconTheme: { primary: '#10B981', secondary: 'white' } },
              error:   { iconTheme: { primary: '#EF4444', secondary: 'white' } },
            }}
          />
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
