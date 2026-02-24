'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firestore';
import { useAuthStore } from '@mma/store';

export default function SettingsPage() {
  const router = useRouter();
  const { user, clearUser } = useAuthStore();

  async function handleSignOut() {
    await signOut(firebaseAuth);
    clearUser();
    router.push('/login');
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Profile */}
      <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <p className="text-base">{user?.displayName ?? 'User'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="text-base">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Plan</label>
            <p className="text-base capitalize">{user?.subscription?.tier ?? 'free'}</p>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Theme</span>
            <select className="border rounded-lg px-3 py-1.5" defaultValue="system">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="flex justify-between items-center">
            <span>Default View</span>
            <select className="border rounded-lg px-3 py-1.5" defaultValue="today">
              <option value="today">Today</option>
              <option value="matrix">Matrix</option>
              <option value="goals">Goals</option>
            </select>
          </div>
        </div>
      </section>

      {/* Subscription */}
      <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium capitalize">{user?.subscription?.tier ?? 'Free'} Plan</p>
            <p className="text-sm text-gray-500">50 tasks, 10 AI suggestions/day</p>
          </div>
          {user?.subscription?.tier !== 'pro' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
              Upgrade to Pro
            </button>
          )}
        </div>
      </section>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full text-red-600 font-medium py-3 hover:bg-red-50 rounded-lg transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
