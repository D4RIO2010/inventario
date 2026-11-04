'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthScreen from '@/components/AuthScreen';
import { Wrench } from 'lucide-react';

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xl p-2 animate-pulse">
          <img
            src="/logo.png"
            alt="Taller Aragua 2003 C.A"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  return <AuthScreen />;
}
