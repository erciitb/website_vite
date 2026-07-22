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

export interface SSOUser {
  name: string
  roll: string
  department: string
  degree: string
  passing_year: number
}

export function useAuth(): { user: SSOUser | null; isLoggedIn: boolean } {
  return {
    user: {
      name: 'Test Student',
      roll: '22b1234',
      department: 'Robotics',
      degree: 'B.Tech',
      passing_year: 2026,
    },
    isLoggedIn: true,
  }
}

export function logout() {
  console.log('Mock logout triggered')
  // Optional: window.location.href = '/'
}