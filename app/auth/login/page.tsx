'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (isSignUp) {
      // Sign up new user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (authData.user) {
        // Insert into users table with 'agent' role (you'll change to admin later)
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            role: 'agent', // Default to agent - you'll manually change to admin
          })

        if (insertError) {
          setError(`Account created but profile error: ${insertError.message}`)
          setLoading(false)
          return
        }

        setSuccess('Account created! Now make yourself admin in Supabase, then sign in.')
        setIsSignUp(false)
        setLoading(false)
      }
    } else {
      // Sign in existing user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full mx-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-display text-white mb-4">
            Staff <span className="text-gold">{isSignUp ? 'Sign Up' : 'Login'}</span>
          </h1>
          <p className="text-gray-400">
            {isSignUp ? 'Create your account' : 'Sign in to access the dashboard'}
          </p>
        </div>

        <div className="card-angled bg-dark-light border-2 border-gold p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500 text-red-500 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border-2 border-green-500 text-green-500 text-sm">
              {success}
              <div className="mt-2 text-xs">
                Run this in Supabase SQL Editor:<br/>
                <code className="bg-black/50 p-1 block mt-1">
                  UPDATE users SET role = 'admin' WHERE email = '{email}';
                </code>
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="input-field-white"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field-white"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-field-white"
                placeholder="••••••••"
              />
              {isSignUp && (
                <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-filled btn-filled-gold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isSignUp ? 'Creating Account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setSuccess('')
              }}
              className="text-sm text-gold hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gold transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}