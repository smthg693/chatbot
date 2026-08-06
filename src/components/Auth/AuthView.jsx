import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { dbService } from '../../services/dbService';

export default function AuthView({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      try {
        let user;
        if (isSignUp) {
          user = dbService.registerUser({ name, email, password });
        } else {
          user = dbService.loginUser({ email, password });
        }
        onLoginSuccess(user);
      } catch (err) {
        setError(err.message || 'An error occurred during authentication.');
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const handleGuestLogin = () => {
    const guestUser = dbService.loginAsGuest();
    onLoginSuccess(guestUser);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-card animate-scale-up">
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-logo-icon animate-pulse-glow">
            <BrainCircuit size={28} className="text-white" />
          </div>
          <h2 className="auth-title">Memori<span className="logo-gradient">Flow</span></h2>
          <p className="auth-subtitle">AI Assistant with Negotiated Memory Architecture</p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(false);
              setError('');
            }}
          >
            Sign In
          </button>
          <button 
            className={`auth-tab ${isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(true);
              setError('');
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-banner animate-slide-down">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form space-y-4">
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon text-slate-400" />
                <input 
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Soham Shirse"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon text-slate-400" />
              <input 
                type="email"
                className="auth-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon text-slate-400" />
              <input 
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn btn-primary-action w-full justify-center"
            disabled={isLoading}
          >
            <span>{isLoading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or continue instantly</span>
        </div>

        {/* Guest Action */}
        <button 
          type="button"
          className="auth-guest-btn"
          onClick={handleGuestLogin}
        >
          <Sparkles size={16} className="text-amber-400" />
          <span>Continue as Guest</span>
        </button>

        {/* Footer Security Notice */}
        <div className="auth-footer-notice flex items-center justify-center gap-1 mt-6 text-xs text-slate-400">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>End-to-End Encrypted Memory Database</span>
        </div>
      </div>
    </div>
  );
}
