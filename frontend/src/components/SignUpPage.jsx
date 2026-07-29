'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { register } from '../../lib/api'
import { useAuth } from './AuthProvider'
import signupCatImage from '../assets/signup_cat.png'

export default function SignUpPage() {
  const router = useRouter()
  const { refreshSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function getBackendErrorMessage(requestError, fallbackMessage) {
    return (
      requestError.response?.data?.error?.message ||
      requestError.response?.data?.detail ||
      fallbackMessage
    )
  }

  async function handleRegister(event) {
    event.preventDefault()
    const username = email.trim()
    if (!username || !password) {
      setError('Email and password are required.')
      return
    }

    setError('')
    setLoading(true)
    try {
      await register(username, password)
      await refreshSession()
      router.replace('/dashboard')
    } catch (requestError) {
      const detail = getBackendErrorMessage(requestError, 'Could not sign up.')
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-visual-page">
      <section className="login-visual-canvas">
        <Image
          src={signupCatImage}
          alt="Cat illustration"
          className="signup-cat-image"
          width={188.14141845703125}
          height={134}
          priority
        />
        <h1 className="signup-headline">Yay, New Friend!</h1>

        <form className="login-fields" aria-label="Login fields" onSubmit={handleRegister}>
          <input
            type="email"
            className="login-field"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />

          <div className="password-field-row">
            <input
              type={showPassword ? 'text' : 'password'}
              className="login-field"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {!showPassword ? (
                <svg
                  className="password-toggle-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M2 12C3.75 7.8 7.45 5 12 5C16.55 5 20.25 7.8 22 12C20.25 16.2 16.55 19 12 19C7.45 19 3.75 16.2 2 12Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M4 4L20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  className="password-toggle-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M2 12C3.75 7.8 7.45 5 12 5C16.55 5 20.25 7.8 22 12C20.25 16.2 16.55 19 12 19C7.45 19 3.75 16.2 2 12Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              )}
            </button>
          </div>

          <p className={`form-error ${error ? "visible" : ""}`}>{error}</p>

          <button type="submit" className="login-signup-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <Link href="/login" className="redirect-existing-button">
          We’re already friends!
        </Link>
      </section>
    </main>
  )
}
