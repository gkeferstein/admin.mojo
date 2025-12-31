'use client';

import { cn } from '@/lib/utils';

interface MojoLogoProps {
  className?: string;
  showText?: boolean;
}

export function MojoLogo({ className, showText = true }: MojoLogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* MOJO Logo Icon */}
      <div className="relative h-8 w-8">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <circle cx="16" cy="16" r="14" className="fill-mojo-green" />
          <path
            d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16C22 19.3137 19.3137 22 16 22"
            className="stroke-black"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="16" r="2" className="fill-black" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-tight text-foreground">admin</span>
          <span className="text-xs text-mojo-green leading-tight">.mojo</span>
        </div>
      )}
    </div>
  );
}




