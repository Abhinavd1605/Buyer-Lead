"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";
import { Building2, Loader } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/buyers");
      } else {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="loading-container">
        {/* Background Elements */}
        <div className="grid-bg"></div>
        <div className="floating-bg bg-1"></div>
        <div className="floating-bg bg-2"></div>

        <div className="loading-content">
          {/* Logo */}
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
            <div className="logo-icon">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div className="logo-text">
              <h1 style={{ fontSize: '1.875rem' }}>LeadFlow Pro</h1>
              <p>Real Estate CRM</p>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="loading-spinner">
            <Loader className="spinner-icon w-8 h-8" />
          </div>

          {/* Loading Text */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing Dashboard</h2>
            <p className="text-gray-600">Setting up your workspace...</p>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8" style={{ maxWidth: '18rem', margin: '2rem auto 0' }}>
            <div className="bg-gray-200 rounded h-2 overflow-hidden">
              <div 
                className="bg-primary h-2 rounded animate-pulse" 
                style={{ width: '70%', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}