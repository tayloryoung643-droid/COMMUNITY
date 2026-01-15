import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, requireRole }) {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    // Return null and let App.jsx handle showing Login
    return null
  }

  if (requireRole && userProfile?.role !== requireRole) {
    // User doesn't have required role
    return null
  }

  return children
}
