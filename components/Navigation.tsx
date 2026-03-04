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
  const router = useRouter()
  const pathname = usePathname()

  const isAdminPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setUserRole(data?.role || null))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
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
    { href: '/vehicles', label: 'All Vehicles' },
    { href: '/about',    label: 'About Us' },
    { href: '/contact',  label: 'Contact' },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`transition-colors duration-300 text-sm font-medium ${
                    pathname === href ? 'text-gold' : 'text-white hover:text-gold'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/dashboard"
                  className={`transition-colors duration-300 text-sm font-medium ${
                    pathname?.startsWith('/dashboard') ? 'text-gold' : 'text-white hover:text-gold'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {user && isAdminPage && (
                <button
                  onClick={handleSignOut}
                  className="text-white hover:text-gold transition-colors duration-300 text-sm font-medium"
                >
                  Sign Out
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(o => !o)}
              className="md:hidden text-white hover:text-gold transition-colors duration-300 p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Logo — right */}
            <div className="flex-1 flex justify-end">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="IC Cars Logo"
                  width={120}
                  height={60}
                  className="object-contain w-24 sm:w-28 md:w-32"
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-75"
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-black shadow-xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gold transition-colors duration-300 p-2"
              aria-label="Close menu"
            >
              <X size={28} />
            </button>
          </div>

          <div className="flex flex-col space-y-6 px-8 py-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-lg transition-colors duration-300 py-2 border-b border-gray-800 ${
                  pathname === href ? 'text-gold' : 'text-white hover:text-gold'
                }`}
              >
                {label}
              </Link>
            ))}
            {user && (
              <Link
                href="/dashboard"
                className="text-white text-lg hover:text-gold transition-colors duration-300 py-2 border-b border-gray-800"
              >
                Dashboard
              </Link>
            )}
            {user && isAdminPage && (
              <button
                onClick={handleSignOut}
                className="text-white text-lg hover:text-gold transition-colors duration-300 py-2 border-b border-gray-800 text-left mt-8"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}