'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export function AuthSwitcher() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <Tabs defaultValue="login" className="w-full">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="login"
              onClick={() => setActiveTab('login')}
              className={`data-[state=active]:bg-purple-600 data-[state=active]:text-white`}
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              onClick={() => setActiveTab('signup')}
              className={`data-[state=active]:bg-purple-600 data-[state=active]:text-white `}
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}