import { Routes, Route, Link, useLocation } from 'react-router-dom'
import TaskDashboard from './components/TaskDashboard'
import HabitTracker from './components/HabitTracker'
import HabitCalendar from './components/HabitCalendar'
import './App.css'

function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      <nav className="main-nav">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Dashboard</Link>
        <Link to="/calendar" className={`nav-link ${location.pathname === '/calendar' ? 'active' : ''}`}>Calendar</Link>
      </nav>

      <Routes>
        <Route path="/" element={
          <>
            <HabitTracker />
            <TaskDashboard />
          </>
        } />
        <Route path="/calendar" element={<HabitCalendar />} />
      </Routes>
    </div>
  )
}

export default App
