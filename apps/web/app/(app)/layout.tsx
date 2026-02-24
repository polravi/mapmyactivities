export const dynamic = 'force-dynamic';

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useTasks } from '@/hooks/useTasks';
import { useAuthStore } from '@mma/store';

function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useAuthStore();

  useFirebaseAuth();
  useTasks();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status !== 'authenticated') return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
