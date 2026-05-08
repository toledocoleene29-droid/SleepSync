import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Mail, Lock, User, ChevronRight, AlertCircle } from 'lucide-react';
import { AuthState } from '../types';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthProps {
  view: AuthState;
  onViewChange: (view: AuthState) => void;
}

export function Auth({ view, onViewChange }: AuthProps) {
  const isLogin = view === 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (isLogin) {
        setError('Email or password is incorrect.');
      } else {
        if (err.code === 'auth/email-already-in-use') {
          setError('User already exists. Please sign in.');
        } else {
          setError(err.message || 'An authentication error occurred.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex flex-col h-full">
      <div className="flex justify-center mb-10 mt-4">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
          <Moon className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-text-dim/70">
              {isLogin ? 'Sign in to continue your sleep journey' : 'Start your journey to better sleep'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full h-14 bg-white rounded-2xl pl-12 pr-4 border border-accent focus:outline-none focus:border-primary/30 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-14 bg-white rounded-2xl pl-12 pr-4 border border-accent focus:outline-none focus:border-primary/30 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 bg-white rounded-2xl pl-12 pr-4 border border-accent focus:outline-none focus:border-primary/30 transition-colors"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim/40" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 bg-white rounded-2xl pl-12 pr-4 border border-accent focus:outline-none focus:border-primary/30 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors mt-8 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && <ChevronRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="text-center mt-8">
            <button
              onClick={() => {
                setError(null);
                onViewChange(isLogin ? 'signup' : 'login');
              }}
              className="text-sm font-medium text-text-dim/70"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-primary font-bold">{isLogin ? 'Sign Up' : 'Sign In'}</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-auto pt-8 border-t border-accent/60 text-center">
        <p className="text-[10px] uppercase tracking-widest text-text-dim/40 font-bold">
          Sleep Sync • Track. Rest. Thrive.
        </p>
      </div>
    </div>
  );
}
