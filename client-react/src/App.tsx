import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import EntityView from './pages/EntityView'
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
            <Route path="/admin" element={<Admin />} />
            <Route path="/:slug" element={<EntityView />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  )
}

export default App
