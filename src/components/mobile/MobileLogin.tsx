'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface MobileLoginProps {
  onLogin: (user: { name: string; email: string; isGuest: boolean }) => void;
}

export function MobileLogin({ onLogin }: MobileLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    // Simple mock authentication success
    onLogin({ name: email.split('@')[0], email, isGuest: false });
  };

  const handleGoogleSignIn = () => {
    onLogin({ name: 'Google User', email: 'user@gmail.com', isGuest: false });
  };

  const handleGuestSignIn = () => {
    onLogin({ name: 'Guest User', email: '', isGuest: true });
  };

  return (
    <div className="w-full h-full bg-[#ffffff] flex flex-col justify-between p-6 relative select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center py-2 z-10 border-b border-[#b0a8a4]/10">
        <div className="w-8 h-8 rounded-full bg-[#f9f8f7] border border-[#b0a8a4]/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#248179] text-lg">spa</span>
        </div>
        <h2 className="font-display text-lg tracking-tight text-[#248179]">THE CLEAN SHEET</h2>
        <div className="w-8" />
      </div>

      {/* Main Login Form Container */}
      <div className="flex-grow flex flex-col justify-center py-4 max-w-sm mx-auto w-full">
        <div className="text-center mb-6">
          <h3 className="font-display text-2xl text-[#248179] mb-2">Welcome Back</h3>
          <p className="font-sans text-[13px] text-[#b0a8a4]">
            Access your personalized routines and saved product analysis.
          </p>
        </div>

        {/* Features callout */}
        <div className="bg-[#f9f8f7] rounded p-4 mb-6 border border-[#b0a8a4]/10 flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#248179] text-[16px]">bookmark</span>
            <span className="font-sans text-[12px] text-[#282828]">Save and compare product reports.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#248179] text-[16px]">calendar_today</span>
            <span className="font-sans text-[12px] text-[#282828]">Build evidence-based routines.</span>
          </div>
        </div>

        {errorMsg && (
          <div className="text-[12px] text-[#fd6158] bg-[#fd6158]/5 border border-[#fd6158]/20 rounded p-2.5 mb-4 text-center">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="flex flex-col">
            <label className="font-sans text-[11px] tracking-widest text-[#b0a8a4] uppercase mb-1" htmlFor="mobile-email">
              Email Address
            </label>
            <input
              id="mobile-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg('');
              }}
              className="border-0 border-b border-[#b0a8a4]/60 bg-transparent py-2 px-0 text-[14px] text-[#282828] focus:ring-0 focus:outline-none focus:border-[#248179] transition-colors placeholder:text-[#b0a8a4]/60 font-sans"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-baseline mb-1">
              <label className="font-sans text-[11px] tracking-widest text-[#b0a8a4] uppercase" htmlFor="mobile-password">
                Password
              </label>
              <button 
                type="button" 
                className="font-sans text-[11px] tracking-wider text-[#248179] hover:underline"
              >
                Forgot?
              </button>
            </div>
            <input
              id="mobile-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg('');
              }}
              className="border-0 border-b border-[#b0a8a4]/60 bg-transparent py-2 px-0 text-[14px] text-[#282828] focus:ring-0 focus:outline-none focus:border-[#248179] transition-colors placeholder:text-[#b0a8a4]/60 font-sans"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#248179] text-white font-sans text-[12px] tracking-[0.08em] uppercase py-3.5 rounded-full hover:bg-[#248179]/90 transition-colors flex items-center justify-center gap-2 mt-2 shadow-[0_8px_16px_rgba(0,103,96,0.08)]"
          >
            Sign In
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-grow border-t border-[#b0a8a4]/20"></div>
          <span className="font-sans text-[10px] tracking-widest text-[#b0a8a4] uppercase">Or</span>
          <div className="flex-grow border-t border-[#b0a8a4]/20"></div>
        </div>

        {/* Social login */}
        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="w-full bg-[#f9f8f7] text-[#282828] border border-[#b0a8a4]/30 font-sans text-[12px] tracking-[0.05em] py-3 rounded-full hover:bg-[#b0a8a4]/10 transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          Continue with Google
        </button>

        {/* Guest Mode */}
        <div className="mt-6 text-center">
          <button
            onClick={handleGuestSignIn}
            type="button"
            className="font-sans text-[11px] tracking-[0.08em] text-[#b0a8a4] hover:text-[#248179] uppercase border-b border-[#b0a8a4]/30 pb-0.5"
          >
            Continue as Guest
          </button>
        </div>
      </div>

      {/* Footer link */}
      <div className="text-center font-sans text-[12px] text-[#b0a8a4] border-t border-[#b0a8a4]/10 pt-4">
        Don't have an account? 
        <button 
          type="button"
          className="text-[#248179] hover:underline font-sans ml-1"
        >
          Create one now
        </button>
      </div>
    </div>
  );
}
