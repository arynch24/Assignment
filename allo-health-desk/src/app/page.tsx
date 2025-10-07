'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, Bell, Hospital } from 'lucide-react';
import { AuthSwitcher } from '@/components/auth';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">
        {/* Left Side - Branding */}
        <div className="flex flex-col justify-center space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Hospital className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Allo Health</h1>
          </div>

          <div className="mt-4">
            <Image
              src="/allo-health.png"
              alt="Clinic Illustration"
              width={350}
              height={350}
              className="mx-auto"
            />
          </div>

          <div className="space-y-3 mt-4">
            <Card className="border-l-4 border-purple-600 py-4">
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Queue Management</h3>
                    <p className="text-sm text-gray-600">Efficient patient flow control</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-purple-600 py-4">
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Appointments</h3>
                    <p className="text-sm text-gray-600">Smart scheduling system</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-purple-600 py-4">
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Real-time Updates</h3>
                    <p className="text-sm text-gray-600">Live notifications and alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex flex-col justify-center">
          <AuthSwitcher />
        </div>
      </div>
    </div>
  );
}