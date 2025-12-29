/**
 * Sign-In Page
 * Simple sign-in page using Clerk
 */

import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">MOJO Admin</h1>
          <p className="text-muted-foreground">
            Melde dich an, um auf das Admin-Dashboard zuzugreifen
          </p>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-card border border-border shadow-xl',
            },
          }}
        />
      </div>
    </div>
  );
}
