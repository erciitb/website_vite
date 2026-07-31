import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { SSO_USERDATA_URL } from '../config/sso'

const Callback: React.FC = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Authenticating with IITB SSO...')

  useEffect(() => {
    const authenticate = async () => {
      const params = new URLSearchParams(window.location.search)
      const sessionKey = params.get('accessid')

      if (!sessionKey) {
        navigate('/', { replace: true })
        return
      }

      try {
        const res = await fetch(SSO_USERDATA_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: sessionKey }),
        })

        if (!res.ok) {
          throw new Error('SSO fetch failed')
        }

        const userData = await res.json()

        // Store user session
        Cookies.set('sso_user', JSON.stringify(userData), {
          expires: 1 / 24, // 1 hour
        })

        // Redirect to the page the user originally requested
        const redirectPath =
          sessionStorage.getItem('redirectAfterLogin') || '/'

        sessionStorage.removeItem('redirectAfterLogin')

        navigate(redirectPath, { replace: true })
      } catch (err) {
        console.error(err)
        setStatus('Login failed. Please try again.')
      }
    }

    authenticate()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-lg text-gray-300">{status}</p>
    </div>
  )
}

export default Callback