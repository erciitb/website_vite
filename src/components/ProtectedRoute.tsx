import React, { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  loginUrl: string
  redirectPath: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  loginUrl,
  redirectPath,
}) => {
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    if (!isLoggedIn) {
      sessionStorage.setItem('redirectAfterLogin', redirectPath)
      window.location.href = loginUrl
    }
  }, [isLoggedIn, loginUrl, redirectPath])

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-lg text-gray-300">
          Redirecting to IITB SSO...
        </p>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute