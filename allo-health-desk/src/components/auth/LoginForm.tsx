'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        toast.success("You've been logged in successfully.");
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        startIcon={<Mail className="w-4 h-4" />}
      />

      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        startIcon={<Eye className="w-4 h-4" />}
        endIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        }
      />

      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
      >
        Sign In
      </Button>

      <div className=' bg-purple-50 p-4 rounded'>
        <h3 className="font-semibold mb-1">Demo Credentials:</h3>
        <ul className="list-disc list-inside text-sm text-gray-600">
          <li>Email: allohealth@gmail.com</li>
          <li>Password: Qwerty#123</li>
        </ul>
      </div>

      <div className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          className="text-purple-600 hover:text-purple-700 font-medium"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
}