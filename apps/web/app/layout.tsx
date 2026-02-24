import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MapMyActivities',
  description: 'Organize your tasks with Eisenhower Matrix, goal tracking, and AI-powered prioritization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
