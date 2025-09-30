import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Group from './pages/Group'
import Login from './pages/Login'
import Admin from './pages/Admin'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/g/:slug" element={<Group />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  )
}

export default App
