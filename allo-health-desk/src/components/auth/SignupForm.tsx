'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

export function SignupForm() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const validatePassword = (pwd: string) => {
        const hasUpperCase = /[A-Z]/.test(pwd);
        const hasNumbers = /\d/.test(pwd);
        const isLongEnough = pwd.length >= 8;
        return hasUpperCase && hasNumbers && isLongEnough;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!validatePassword(password)) {
            toast.error("Invalid Password", {
                description: "Password must be 8+ characters with uppercase and number.",
            });
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Password Mismatch", {
                description: "Passwords do not match.",
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`, {
                name: fullName,
                email,
                password,
            });

            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                toast.success("Your account has been created successfully.");
                router.push('/dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "An error occurred during signup.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                startIcon={<User className="w-4 h-4" />}
            />

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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                startIcon={<Lock className="w-4 h-4" />}
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
            <p className="text-xs text-gray-500 mt-1">
                Must be 8+ characters with uppercase and number
            </p>

            <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                startIcon={<Lock className="w-4 h-4" />}
                endIcon={
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                }
            />

            <Button
                type="submit"
                className="w-full "
                loading={isLoading}
            >
                Create Account
            </Button>

            <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                    type="button"
                    className="text-purple-600 hover:text-purple-700 font-medium"
                >
                    Sign In
                </button>
            </div>
        </form>
    );
}