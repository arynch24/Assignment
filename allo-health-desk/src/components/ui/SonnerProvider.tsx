'use client';

import { Toaster } from 'sonner';

export function SonnerProvider() {
  return (
    <Toaster 
      position="bottom-right"
      richColors
      toastOptions={{
        classNames: {
          error: 'bg-red-500 text-white',
          success: 'bg-green-500 text-white',
          warning: 'bg-yellow-500 text-white',
          info: 'bg-blue-500 text-white',
        },
      }}
    />
  );
}