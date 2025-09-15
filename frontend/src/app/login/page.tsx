"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";
// Using custom styled components instead of UI components
import { 
  Mail, 
  Building2, 
  ArrowRight, 
  Crown, 
  User,
  Shield,
  Zap,
  Globe
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email || undefined);
      router.push("/buyers");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (userType: 'user' | 'admin') => {
    setIsLoading(true);
    try {
      const demoEmail = userType === 'admin' ? 'admin@example.com' : 'demo@example.com';
      await login(demoEmail);
      router.push("/buyers");
    } catch (error) {
      console.error("Demo login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="premium-login">
      {/* Left Panel - Branding */}
      <div className="login-brand-panel">
        <div className="brand-content">
          {/* Logo */}
          <div className="brand-logo">
            <div className="logo-container">
              <Building2 className="logo-icon" />
            </div>
            <div className="logo-text">
              <h1>LeadFlow</h1>
              <span>Real Estate CRM</span>
            </div>
          </div>

          {/* Hero Text */}
          <div className="hero-content">
            <h2 className="hero-title">
              Manage leads like
              <span className="hero-highlight"> a pro</span>
            </h2>
            <p className="hero-description">
              Transform your real estate business with intelligent lead management, 
              powerful analytics, and seamless workflow automation.
            </p>
          </div>

          {/* Features */}
          <div className="feature-list">
            <div className="feature-item">
              <Zap className="feature-icon" />
              <span>Lightning-fast processing</span>
            </div>
            <div className="feature-item">
              <Shield className="feature-icon" />
              <span>Enterprise security</span>
            </div>
            <div className="feature-item">
              <Globe className="feature-icon" />
              <span>Multi-location support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-form-panel">
        <div className="form-container">
          {/* Mobile Logo */}
          <div className="mobile-logo">
            <Building2 className="mobile-logo-icon" />
            <span>LeadFlow</span>
          </div>

          {/* Form */}
          <div className="login-form">
            <div className="form-header">
              <h2>Welcome back</h2>
              <p>Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="form-fields">
              <div className="field-group">
                <label>Email address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="form-input"
                  />
                </div>
                <span className="field-hint">Leave blank for demo access</span>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="primary-button"
              >
                {isLoading ? (
                  <div className="button-loading">
                    <div className="spinner"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="button-content">
                    <span>Sign in</span>
                    <ArrowRight className="button-arrow" />
                  </div>
                )}
              </button>
            </form>

            {/* Demo Options */}
            <div className="demo-section">
              <div className="divider text-center">
                <span>or try demo</span>
              </div>

              <div className="demo-buttons">
                <button 
                  onClick={() => handleDemoLogin('user')}
                  disabled={isLoading}
                  className="demo-button user"
                >
                  <User className="demo-icon" />
                  <span>Demo User</span>
                </button>

                <button 
                  onClick={() => handleDemoLogin('admin')}
                  disabled={isLoading}
                  className="demo-button admin"
                >
                  <Crown className="demo-icon" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .premium-login {
          min-height: 100vh;
          display: flex;
          background: #fafafa;
        }

        .login-brand-panel {
          display: none;
          width: 55%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }

        .login-brand-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .brand-content {
          position: relative;
          z-index: 1;
          padding: 4rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 500px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .logo-container {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logo-icon {
          width: 28px;
          height: 28px;
          color: white;
        }

        .logo-text h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin: 0;
          line-height: 1;
        }

        .logo-text span {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        .hero-content {
          margin-bottom: 3rem;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .hero-highlight {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          margin: 0;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        .feature-icon {
          width: 20px;
          height: 20px;
          color: #fbbf24;
        }

        .stats-container {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .login-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: white;
        }

        .form-container {
          width: 100%;
          max-width: 420px;
        }

        .mobile-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 3rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .mobile-logo-icon {
          width: 32px;
          height: 32px;
          color: #667eea;
        }

        .login-form {
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #f1f5f9;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-header h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          color: #6b7280;
          font-size: 1rem;
        }

        .form-fields {
          margin-bottom: 2rem;
        }

        .field-group {
          margin-bottom: 1.5rem;
        }

        .field-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #9ca3af;
        }

        .form-input {
          width: 100%;
          height: 3rem;
          padding: 0 1rem 0 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #fafafa;
        }

        .form-input:hover {
          border-color: #d1d5db;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .field-hint {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
          display: block;
        }

        .primary-button {
          width: 100%;
          height: 3.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .primary-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .primary-button:active {
          transform: translateY(0);
        }

        .primary-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .button-arrow {
          width: 20px;
          height: 20px;
          transition: transform 0.2s ease;
        }

        .primary-button:hover .button-arrow {
          transform: translateX(2px);
        }

        .button-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .demo-section {
          margin-top: 2rem;
        }

        .divider {
          position: relative;
          text-align: center !important;
          margin-bottom: 1.5rem;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e7eb;
        }

        .divider span {
          background: white;
          padding: 0 1rem;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .demo-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .demo-button {
          height: 3rem;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .demo-button:hover {
          border-color: #667eea;
          background: #f8faff;
          transform: translateY(-1px);
        }

        .demo-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .demo-button.admin {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          color: white;
          border-color: #374151;
        }

        .demo-button.admin:hover {
          background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
          border-color: #4b5563;
        }

        .demo-icon {
          width: 18px;
          height: 18px;
        }

        .demo-button.admin .demo-icon {
          color: #fbbf24;
        }

        .form-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #f3f4f6;
        }

        .form-footer p {
          font-size: 0.875rem;
          color: #6b7280;
        }

        /* Responsive Design */
        @media (min-width: 1024px) {
          .login-brand-panel {
            display: flex;
          }
          
          .mobile-logo {
            display: none;
          }

          .login-form {
            box-shadow: none;
            border: none;
            padding: 0;
          }
        }

        @media (max-width: 1023px) {
          .premium-login {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .login-form-panel {
            background: transparent;
          }

          .form-container {
            max-width: 400px;
          }

          .login-form {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}