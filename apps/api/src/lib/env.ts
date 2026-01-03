import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().transform(Number).default('3011'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://localhost:5432/admin_mojo'),
  
  // Clerk (optional for now)
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  
  // Stripe (optional for now)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Service URLs
  PAYMENTS_API_URL: z.string().default('http://localhost:3001'),
  ACCOUNTS_API_URL: z.string().default('http://localhost:3002'),
  
  // Feature flags
  ENABLE_STRIPE_PAYOUTS: z.string().transform(v => v === 'true').default('false'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  // Don't exit in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const env = parsed.data || {
  PORT: 3011,
  NODE_ENV: 'development' as const,
  DATABASE_URL: 'postgresql://localhost:5432/admin_mojo',
  PAYMENTS_API_URL: 'http://localhost:3001',
  ACCOUNTS_API_URL: 'http://localhost:3002',
  ENABLE_STRIPE_PAYOUTS: false,
};

export default env;




