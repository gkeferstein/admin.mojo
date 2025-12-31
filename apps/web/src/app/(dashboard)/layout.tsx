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




