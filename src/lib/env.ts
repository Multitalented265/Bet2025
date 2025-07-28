// Environment variable validation
export function validateEnv() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'PAYCHANGU_PUBLIC_KEY',
    'PAYCHANGU_SECRET_KEY',
    'PAYCHANGU_CALLBACK_URL',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env or .env.local file.'
    );
  }

  console.log('✅ All required environment variables are loaded');
}

// Export environment variables with validation
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  PAYCHANGU_PUBLIC_KEY: process.env.PAYCHANGU_PUBLIC_KEY!,
  PAYCHANGU_SECRET_KEY: process.env.PAYCHANGU_SECRET_KEY!,
  // PayChangu URLs - must be set in environment
  PAYCHANGU_WEBHOOK_URL: process.env.PAYCHANGU_WEBHOOK_URL!,
  PAYCHANGU_CALLBACK_URL: process.env.PAYCHANGU_CALLBACK_URL!,
  PAYCHANGU_RETURN_URL: process.env.PAYCHANGU_RETURN_URL!,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL!,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
}; 