// import Cookies from 'js-cookie'

// export interface SSOUser {
//   name: string
//   roll: string
//   department: string
//   degree: string
//   passing_year: number
// }

// export function useAuth(): { user: SSOUser | null; isLoggedIn: boolean } {
//   const raw = Cookies.get('sso_user')
//   if (!raw) return { user: null, isLoggedIn: false }
//   try {
//     return { user: JSON.parse(raw), isLoggedIn: true }
//   } catch {
//     return { user: null, isLoggedIn: false }
//   }
// }

// export function logout() {
//   Cookies.remove('sso_user')
//   window.location.href = '/'
// }

import Cookies from 'js-cookie'

export interface SSOUser {
  name: string
  roll: string
  department: string
  degree: string
  passing_year: number
}

// Hardcoded mock user for development bypass
const MOCK_USER: SSOUser = {
  name: "Dev User",
  roll: "25B2134", 
  department: "Electrical Engineering",
  degree: "B.Tech",
  passing_year: 2026
}

export function useAuth(): { user: SSOUser | null; isLoggedIn: boolean } {
  // SSO BYPASS: Instantly returns true and the mock user data every time
  return { user: MOCK_USER, isLoggedIn: true }
}

export function logout() {
  // Clears the cookie just in case a real one was ever set, then redirects
  Cookies.remove('sso_user')
  window.location.href = '/'
}