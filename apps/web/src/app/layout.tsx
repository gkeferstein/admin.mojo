import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { MojoBackground } from '@/components/layout/MojoBackground';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'admin.mojo - Platform Administration',
    template: '%s | admin.mojo',
  },
  description: 'MOJO Platform Administration Dashboard - Provisionen, Verträge & Auszahlungen',
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#66dd99',
};

// Clerk configuration
const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: 'hsl(142 71% 63%)', // MOJO Green
    colorBackground: 'hsl(0 0% 6%)',
    colorInputBackground: 'hsl(0 0% 12%)',
    colorInputText: 'hsl(0 0% 98%)',
    borderRadius: '0.75rem',
  },
  elements: {
    card: 'bg-card border-border',
    formButtonPrimary: 'bg-primary hover:bg-primary/90',
    userButtonAvatarBox: 'w-8 h-8',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if Clerk is configured
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const content = (
    <html lang="de" suppressHydrationWarning>
      <body className="font-sans min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="admin-mojo-theme"
        >
          <MojoBackground noise orbs>
            {children}
          </MojoBackground>
        </ThemeProvider>
      </body>
    </html>
  );

  // If Clerk is configured, wrap with ClerkProvider
  if (hasClerk) {
    return (
      <ClerkProvider
        appearance={clerkAppearance}
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      >
        {content}
      </ClerkProvider>
    );
  }

  // Otherwise, render without Clerk
  return content;
}
