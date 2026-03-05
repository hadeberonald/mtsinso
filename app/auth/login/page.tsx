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
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      if (authData.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: authData.user.id, email, full_name: fullName, role: 'agent',
        })
        if (insertError) { setError(`Account created but profile error: ${insertError.message}`); setLoading(false); return }
        setSuccess('Account created. Run the admin SQL in Supabase, then sign in.')
        setIsSignUp(false)
        setLoading(false)
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false) }
      else router.push('/dashboard')
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Brand mark */}
        <div className="text-center mb-8">
          
          <h1 className="font-display text-3xl text-support mb-2">
            Staff {isSignUp ? 'Sign Up' : 'Login'}
          </h1>
          <p className="text-muted text-sm">
            {isSignUp ? 'Create your account' : 'Sign in to access the dashboard'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
          )}
          {success && (
            <div className="mb-5 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
              {success}
              <div className="mt-2 text-xs font-mono bg-green-100 p-2 rounded-lg">
                UPDATE users SET role = 'admin' WHERE email = '{email}';
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="input-field" placeholder="John Doe" />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="you@mtsinso.co.za" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="input-field" placeholder="••••••••" />
              {isSignUp && <p className="text-xs text-muted mt-1">Minimum 6 characters</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (isSignUp ? 'Creating Account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }}
              className="text-sm text-primary hover:text-primary-dark transition-colors">
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-muted hover:text-support transition-colors">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
