'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const errorParam = searchParams?.get('error')
    
    switch (errorParam) {
      case 'CredentialsSignin':
        setError('Invalid email or password. Please try again.')
        break
      case 'EmailCreateAccount':
        setError('Could not create account. Email may already be in use.')
        break
      case 'SessionRequired':
        setError('You must be signed in to access this page.')
        break
      case 'AccessDenied':
        setError('Access denied. You do not have permission to access this resource.')
        break
      case 'Verification':
        setError('Verification failed. Please try again.')
        break
      case 'Default':
      default:
        setError('An authentication error occurred. Please try again.')
        break
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Error
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Try signing in again
            </Link>
            
            <Link
              href="/signup"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Create new account
            </Link>
            
            <Link
              href="/"
              className="block text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Return to home page
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}