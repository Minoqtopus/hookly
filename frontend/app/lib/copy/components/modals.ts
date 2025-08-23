// Modal component copy
export const modals = {
  auth: {
    titles: {
      signup: 'Get Started',
      login: 'Welcome Back'
    },
    
    subtitles: {
      signup: 'Create an account to start building',
      login: 'Sign in to continue creating'
    },
    
    tabs: {
      signin: 'Sign In',
      signup: 'Sign Up'
    },
    
    demo: {
      title: 'Your Generated Ad:',
      productPrefix: 'For:'
    },
    
    google: {
      text: 'Continue with Google',
      loading: 'Connecting...'
    },
    
    divider: 'or',
    
    form: {
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      signupButton: 'Create Account',
      signinButton: 'Sign In',
      loading: {
        signup: 'Creating Account...',
        signin: 'Signing In...'
      }
    },
    
    links: {
      switchToSignin: 'Already have an account? Sign in',
      switchToSignup: 'Need an account? Sign up',
      forgotPassword: 'Forgot your password?'
    },
    
    errors: {
      title: 'Error!',
      fallback: 'Authentication failed. Please try again.'
    }
  },
  
  upgrade: {
    title: 'Upgrade Your Plan',
    subtitle: 'Unlock more features and generations',
    currentPlan: 'Current Plan',
    recommendedPlan: 'Recommended',
  },
} as const;