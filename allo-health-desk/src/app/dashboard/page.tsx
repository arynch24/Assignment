'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/Loader';
import { Users, Calendar, Clock, Activity, TrendingUp, BriefcaseMedical } from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from 'sonner';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/auth/dashboard-stats');
      setDashboardData(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      setUser(authUser);
      setIsLoading(false);
    }
    fetchDashboardData();
  }, [authLoading, authUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className=" bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name || 'User'}! 👋
              </h1>
              <p className="text-gray-600">Here's what's happening with your clinic today</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Today's Date</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData?.totalPatients}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Appointments</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData?.totalAppointments}</p>
                  <p className="text-xs text-blue-600 mt-1">Today's schedule</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Queue</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData?.totaltodayQueues}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData?.totalCompletedConsultations}</p>
                  <p className="text-xs text-green-600 mt-1">Today's consultations</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => router.push('/dashboard/queue')}
          >
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Queue Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage patient flow efficiently with real-time queue updates.</p>
              <button className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-2">
                Go to Queue →
              </button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => router.push('/dashboard/appointments')}
          >
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Schedule and manage appointments by selecting available slots.</p>
              <button className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2">
                View Calendar →
              </button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => router.push('/dashboard/doctors')}
          >
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                <BriefcaseMedical className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Get Doctors details and their availability status.</p>
              <button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-2">
                Manage Doctors →
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}