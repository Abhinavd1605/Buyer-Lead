"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Buyer Lead Management
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email (Optional for Demo)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or leave blank for demo"
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Or use demo accounts
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('user')}
              disabled={isLoading}
              className="w-full"
            >
              Demo User
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              className="w-full"
            >
              Demo Admin
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Demo Features:</p>
          <ul className="mt-2 space-y-1">
            <li>• Complete CRUD operations for buyer leads</li>
            <li>• Advanced filtering and search</li>
            <li>• CSV import/export functionality</li>
            <li>• Real-time validation and error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
