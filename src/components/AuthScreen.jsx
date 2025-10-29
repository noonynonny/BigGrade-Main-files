import React, { useState } from 'react';
import authManager from '../authManager';

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'forgot', 'selectType'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authManager.signInWithEmail(email, password);
      if (user) {
        onAuthSuccess(user);
      }
    } catch (error) {
      setError(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authManager.signUp(email, password, displayName);
      if (user.needsAccountType) {
        setPendingUser(user);
        setMode('selectType');
      } else {
        onAuthSuccess(user);
      }
    } catch (error) {
      setError(error.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const user = await authManager.signInWithGoogle();
      if (user.needsAccountType) {
        setPendingUser(user);
        setMode('selectType');
      } else {
        onAuthSuccess(user);
      }
    } catch (error) {
      setError(error.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await authManager.sendPasswordReset(email);
      setMessage('Password reset email sent! Please check your inbox.');
    } catch (error) {
      setError(error.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccountType = async (userType) => {
    setError('');
    setLoading(true);

    try {
      const user = await authManager.completeSignup(userType);
      onAuthSuccess(user);
    } catch (error) {
      setError(error.message || 'Failed to complete signup.');
    } finally {
      setLoading(false);
    }
  };

  // Account Type Selection Screen
  if (mode === 'selectType') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to BigGrade!</h2>
            <p className="text-gray-600">Please select your account type</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleSelectAccountType('student')}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              I'm a Student
            </button>
            <button
              onClick={() => handleSelectAccountType('tutor')}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              I'm a Tutor
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Note: You cannot change this later
          </p>
        </div>
      </div>
    );
  }

  // Forgot Password Screen
  if (mode === 'forgot') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-gray-600">Enter your email to receive a reset link</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>

          <button
            onClick={() => setMode('signin')}
            className="mt-4 w-full text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Sign Up Screen
  if (mode === 'signup') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl">🎓</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mb-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => setMode('signin')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Sign In Screen (default)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl">🎓</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome to BigGrade</h2>
          <p className="text-gray-600 mt-2">Sign in to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => setMode('forgot')}
          className="mt-4 w-full text-indigo-600 hover:text-indigo-800 font-medium text-sm"
        >
          Forgot password?
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Need an account?{' '}
          <button
            onClick={() => setMode('signup')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
