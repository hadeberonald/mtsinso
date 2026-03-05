'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isAdminPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('users').select('role').eq('id', user.id).single()
          .then(({ data }) => setUserRole(data?.role || null))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        supabase.from('users').select('role').eq('id', session.user.id).single()
          .then(({ data }) => setUserRole(data?.role || null))
      } else {
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { setIsOpen(false) }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
    router.push('/')
  }

  const navLinks = [
    { href: '/',         label: 'Home' },
    { href: '/vehicles', label: 'Vehicles' },
   
    { href: '/contact',  label: 'Contact' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo.jpg"
                alt="Mtsinso Car Sales"
                width={140}
                height={48}
                className="object-contain h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    pathname === href
                      ? 'bg-primary/10 text-primary'
                      : 'text-support/70 hover:text-support hover:bg-gray-100'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    pathname?.startsWith('/dashboard') ? 'bg-primary/10 text-primary' : 'text-support/70 hover:text-support hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Right CTAs */}
            <div className="hidden md:flex items-center gap-3">
              {user && isAdminPage ? (
                <button onClick={handleSignOut} className="btn-outline text-sm px-5 py-2">
                  Sign Out
                </button>
              ) : (
                <Link href="/finance/apply" className="btn-primary text-sm px-5 py-2.5">
                  Get Pre-Approved
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(o => !o)}
              className="md:hidden p-2 rounded-xl text-support hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

        <div className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <Image
              src="/logo.jpg"
              alt="Mtsinso Car Sales"
              width={120}
              height={40}
              className="object-contain h-8 w-auto"
            />
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X size={20} className="text-muted" />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  pathname === href ? 'bg-primary/10 text-primary' : 'text-support hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
            {user && (
              <Link href="/dashboard" className="px-4 py-3 rounded-xl text-sm font-medium text-support hover:bg-gray-50 transition-colors">
                Dashboard
              </Link>
            )}
            {user && isAdminPage && (
              <button onClick={handleSignOut} className="mt-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors">
                Sign Out
              </button>
            )}
          </div>

          <div className="p-5 border-t border-gray-100">
            <Link href="/finance/apply" className="btn-primary w-full justify-center">
              Get Pre-Approved
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}