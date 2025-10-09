'use client';

import Image from 'next/image';
import { Hospital } from 'lucide-react';
import { AuthSwitcher } from '@/components/auth';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white relative p-4 flex flex-col">

      {/* Header */}
      <div className="flex items-center space-x-3 p-6 absolute top-0 left-0">
        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
          <Hospital className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Allo Health</h1>
      </div>

      {/* Main content */}
      <div className="flex items-center justify-center flex-1">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">

          {/* Left Side - Stable Image */}
          <div className="hidden lg:flex justify-center items-center min-h-[500px]">
            <Image
              src="/allo-health.png"
              alt="Clinic Illustration"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex flex-col justify-center">
            <AuthSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
