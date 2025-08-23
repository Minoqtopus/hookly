// Form component copy
export const forms = {
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordsNoMatch: 'Passwords do not match',
    invalidCredentials: 'Invalid email or password',
  },
  
  placeholders: {
    email: 'Enter your email',
    password: 'Enter your password',
    confirmPassword: 'Confirm your password',
    productName: 'Enter your product name',
    niche: 'Enter your niche',
    targetAudience: 'Describe your target audience',
  },
  
  labels: {
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    rememberMe: 'Remember me',
  },
} as const;