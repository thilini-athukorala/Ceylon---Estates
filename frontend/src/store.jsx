import { createContext, useContext, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { properties } from './data.js'

// DEMO ONLY: accounts and ads live in localStorage. Replace with your Express + JWT API
// (POST /api/auth/login, /api/auth/register, /api/properties). No passwords are stored here.
const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v))
const admin = { name: 'Admin', email: 'admin@ceylon.lk', role: 'admin' }
const publish = ads => ads.filter(a => a.status === 'Published' && !properties.some(p => p.id === a.id)).forEach(a => properties.push(a))
publish(read('ce_ads', []))

export function StoreProvider({ children }) {
  const [user, setUser] = useState(read('ce_user', null))
  const [ads, setAds] = useState(read('ce_ads', []))
  const users = () => [admin, ...read('ce_users', [])]
  const saveAds = next => { setAds(next); write('ce_ads', next); publish(next) }
  const login = email => { const u = users().find(x => x.email === email.trim().toLowerCase()); if (!u) return false; setUser(u); write('ce_user', u); return true }
  const register = u => {
    const email = u.email.trim().toLowerCase()
    if (users().some(x => x.email === email)) return false
    write('ce_users', [...read('ce_users', []), { name: u.name, email, role: u.role }]); return login(email)
  }
  const logout = () => { setUser(null); localStorage.removeItem('ce_user') }
  const addAd = ad => { const a = { ...ad, id: Date.now(), ownerEmail: user.email, hue: Math.floor(Math.random() * 300), furnished: false, parking: false, status: 'Awaiting payment' }; saveAds([...ads, a]); return a.id }
  const setStatus = (id, status) => saveAds(ads.map(a => a.id === id ? { ...a, status } : a))
  return <Ctx.Provider value={{ user, ads, login, register, logout, addAd, setStatus }}>{children}</Ctx.Provider>
}

// Route guard: must be signed in, and (optionally) hold one of the roles.
export function Guard({ roles, children }) {
  const { user } = useStore(); const loc = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (roles && !roles.includes(user.role)) return <div className="wrap"><p className="empty">This page is only for {roles.join(' or ')} accounts.</p></div>
  return children
}
