'use client';

import { SignUp } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { MojoLogo } from '@/components/layout/MojoLogo';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-mojo-green/10 rounded-2xl flex items-center justify-center mb-4 border border-mojo-green/20">
            <Shield className="w-8 h-8 text-mojo-green" />
          </div>
          <MojoLogo className="mx-auto mb-2" />
          <h1 className="text-2xl font-bold mt-4">Platform Administration</h1>
          <p className="text-muted-foreground mt-2">
            Erstelle ein Konto für den Admin-Zugang
          </p>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'mojo-glass-card shadow-xl',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'mojo-glass hover:bg-accent',
              formButtonPrimary: 'bg-primary hover:bg-primary/90',
              formFieldInput: 'bg-background border-border',
              footerActionLink: 'text-primary hover:text-primary/80',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </motion.div>
    </div>
  );
}




