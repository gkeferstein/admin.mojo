'use client';

import { cn } from '@/lib/utils';

interface MojoBackgroundProps {
  children: React.ReactNode;
  noise?: boolean;
  orbs?: boolean;
  className?: string;
}

export function MojoBackground({
  children,
  noise = true,
  orbs = true,
  className,
}: MojoBackgroundProps) {
  return (
    <div className={cn('relative min-h-screen', className)}>
      {/* Gradient Orbs */}
      {orbs && (
        <div className="mojo-orbs-container">
          <div className="mojo-orb mojo-orb-green" />
          <div className="mojo-orb mojo-orb-purple" />
          <div className="mojo-orb mojo-orb-cyan" />
        </div>
      )}

      {/* Noise Overlay */}
      {noise && <div className="mojo-noise" />}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}




