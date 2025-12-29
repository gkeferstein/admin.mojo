import { MojoLogo } from '@/components/layout/MojoLogo';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex h-14 items-center px-4 lg:px-6">
          <Link href="/dashboard">
            <MojoLogo />
          </Link>
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
}

