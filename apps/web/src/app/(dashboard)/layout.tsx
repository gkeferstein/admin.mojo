'use client';

// TODO: Replace with MojoAppLayout from @gkeferstein/design when available
// Temporarily using Topbar until @gkeferstein/design package is available
import { Topbar } from '@/components/layout/Topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}




