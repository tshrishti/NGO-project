import { Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav'
import ProtectedRoute from './components/ProtectedRoute'
import ChatBot from './components/ChatBot'
import ToastStack from './components/ToastStack'
import VolunteerAlerts from './components/VolunteerAlerts'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import NgoDashboard from './pages/NgoDashboard'
import VolunteerDashboard from './pages/VolunteerDashboard'
import MapView from './pages/MapView'
import SmartMatch from './pages/SmartMatch'
import Impact from './pages/Impact'
import RequestHelp from './pages/RequestHelp'
import MyTasks from './pages/MyTasks'

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/request-help" element={<RequestHelp />} />
        <Route
          path="/ngo"
          element={
            <ProtectedRoute role="ngo">
              <NgoDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer"
          element={
            <ProtectedRoute role="volunteer">
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute role="volunteer">
              <SmartMatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tasks"
          element={
            <ProtectedRoute role="volunteer">
              <MyTasks />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <VolunteerAlerts />
      <ToastStack />
      <ChatBot />
    </>
  )
}
