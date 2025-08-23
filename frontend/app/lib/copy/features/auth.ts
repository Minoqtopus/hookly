// Authentication feature copy
export const auth = {
  messages: {
    loginSuccess: 'Welcome back!',
    signupSuccess: 'Account created successfully!',
    logoutSuccess: 'You have been logged out',
    sessionExpired: 'Your session has expired. Please log in again.',
    accountNotFound: 'Account not found',
    emailAlreadyExists: 'An account with this email already exists',
    invalidCredentials: 'Invalid email or password',
    passwordResetSent: 'Password reset link sent to your email',
  },
  
  trials: {
    expired: 'Your trial has expired',
    daysRemaining: (days: number) => `${days} days left in your trial`,
    generationsRemaining: (count: number) => `${count} generations remaining`,
    upgradePrompt: 'Upgrade to continue creating viral content',
  },
} as const;