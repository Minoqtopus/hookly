// Shared copy used across multiple components and pages
export const common = {
  buttons: {
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    login: 'Login',
    signup: 'Sign Up',
    tryDemo: 'Try Demo',
    startTrial: 'Start Free Trial',
    upgrade: 'Upgrade',
    viewPricing: 'View Pricing',
  },
  
  forms: {
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email',
  },
  
  status: {
    loading: 'Loading...',
    success: 'Success!',
    error: 'Something went wrong',
    saving: 'Saving...',
    generating: 'Generating...',
  },
} as const;