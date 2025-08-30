/**
 * Design System Tokens
 * 
 * Centralized design tokens for consistent spacing, typography,
 * and component styling across the application.
 */

// Spacing Scale (based on 4px grid)
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
} as const;

// Typography Scale
export const typography = {
  // Display text (hero sections)
  'display-2xl': {
    fontSize: '4.5rem',  // 72px
    lineHeight: '1.1',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },
  'display-xl': {
    fontSize: '3.75rem', // 60px
    lineHeight: '1.1',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },
  'display-lg': {
    fontSize: '3rem',    // 48px
    lineHeight: '1.2',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  'display-md': {
    fontSize: '2.25rem', // 36px
    lineHeight: '1.2',
    fontWeight: '700',
    letterSpacing: '-0.01em',
  },
  'display-sm': {
    fontSize: '1.875rem', // 30px
    lineHeight: '1.3',
    fontWeight: '600',
    letterSpacing: '-0.01em',
  },

  // Text hierarchy
  'text-xl': {
    fontSize: '1.25rem', // 20px
    lineHeight: '1.5',
    fontWeight: '600',
  },
  'text-lg': {
    fontSize: '1.125rem', // 18px
    lineHeight: '1.5',
    fontWeight: '500',
  },
  'text-base': {
    fontSize: '1rem',    // 16px
    lineHeight: '1.5',
    fontWeight: '400',
  },
  'text-sm': {
    fontSize: '0.875rem', // 14px
    lineHeight: '1.4',
    fontWeight: '400',
  },
  'text-xs': {
    fontSize: '0.75rem',  // 12px
    lineHeight: '1.3',
    fontWeight: '400',
  },

  // Specialized text
  'lead': {
    fontSize: '1.25rem', // 20px
    lineHeight: '1.6',
    fontWeight: '400',
  },
  'large': {
    fontSize: '1.125rem', // 18px
    lineHeight: '1.5',
    fontWeight: '600',
  },
  'small': {
    fontSize: '0.875rem', // 14px
    lineHeight: '1.25',
    fontWeight: '500',
  },
  'muted': {
    fontSize: '0.875rem', // 14px
    lineHeight: '1.25',
    fontWeight: '400',
    color: 'hsl(var(--muted-foreground))',
  },
} as const;

// Component sizing
export const sizes = {
  // Button heights
  'btn-sm': '2rem',     // 32px
  'btn-default': '2.5rem', // 40px
  'btn-lg': '3rem',     // 48px
  'btn-xl': '3.5rem',   // 56px

  // Input heights
  'input-sm': '2rem',    // 32px
  'input-default': '2.5rem', // 40px
  'input-lg': '3rem',    // 48px

  // Icon sizes
  'icon-xs': '0.75rem',  // 12px
  'icon-sm': '1rem',     // 16px
  'icon-default': '1.25rem', // 20px
  'icon-lg': '1.5rem',   // 24px
  'icon-xl': '2rem',     // 32px
  'icon-2xl': '2.5rem',  // 40px

  // Avatar sizes
  'avatar-xs': '1.5rem',   // 24px
  'avatar-sm': '2rem',     // 32px
  'avatar-default': '2.5rem', // 40px
  'avatar-lg': '3rem',     // 48px
  'avatar-xl': '4rem',     // 64px
  'avatar-2xl': '5rem',    // 80px
} as const;

// Border radius scale
export const borderRadius = {
  'none': '0',
  'sm': 'calc(var(--radius) - 4px)',
  'default': 'calc(var(--radius) - 2px)',
  'md': 'var(--radius)',
  'lg': 'calc(var(--radius) + 2px)',
  'xl': 'calc(var(--radius) + 4px)',
  '2xl': 'calc(var(--radius) + 8px)',
  '3xl': 'calc(var(--radius) + 12px)',
  'full': '9999px',
} as const;

// Shadow scale
export const shadows = {
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'default': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  'none': '0 0 #0000',
} as const;

// Breakpoints
export const breakpoints = {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
} as const;

// Animation durations
export const duration = {
  'fast': '150ms',
  'normal': '300ms',
  'slow': '500ms',
} as const;

// Z-index scale
export const zIndex = {
  'hide': -1,
  'auto': 'auto',
  'base': 0,
  'docked': 10,
  'dropdown': 1000,
  'sticky': 1100,
  'banner': 1200,
  'overlay': 1300,
  'modal': 1400,
  'popover': 1500,
  'skipLink': 1600,
  'toast': 1700,
  'tooltip': 1800,
} as const;

// Component-specific tokens
export const components = {
  button: {
    // Padding values for different sizes
    padding: {
      sm: 'px-3 py-1.5',
      default: 'px-4 py-2',
      lg: 'px-6 py-3',
      xl: 'px-8 py-4',
    },
    // Font sizes for different sizes
    fontSize: {
      sm: 'text-sm',
      default: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    },
  },
  card: {
    padding: {
      sm: 'p-4',
      default: 'p-6',
      lg: 'p-8',
    },
    borderRadius: 'rounded-lg',
  },
  input: {
    padding: {
      sm: 'px-2.5 py-1.5',
      default: 'px-3 py-2',
      lg: 'px-4 py-3',
    },
    borderRadius: 'rounded-md',
  },
} as const;

// Semantic color mappings (for consistent usage)
export const semanticColors = {
  // Status colors
  success: 'success',
  error: 'destructive',
  warning: 'warning',
  info: 'info',

  // UI element colors
  primary: 'primary',
  secondary: 'secondary',
  accent: 'accent',
  muted: 'muted',

  // Surface colors
  background: 'background',
  surface: 'card',
  overlay: 'popover',
} as const;

// Helper function to get design token values
export function getToken<T extends Record<string, any>>(
  tokens: T,
  path: keyof T
): T[keyof T] {
  return tokens[path];
}

// CSS class generators for common patterns
export const classNames = {
  // Typography utilities
  heading: (size: keyof typeof typography) => {
    const style = typography[size];
    const letterSpacing = 'letterSpacing' in style ? style.letterSpacing : '0';
    return `text-[${style.fontSize}] leading-[${style.lineHeight}] font-[${style.fontWeight}] tracking-[${letterSpacing}]`;
  },

  // Spacing utilities
  padding: (size: keyof typeof spacing) => `p-[${spacing[size]}]`,
  margin: (size: keyof typeof spacing) => `m-[${spacing[size]}]`,

  // Button variants (using design tokens)
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variants: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    sizes: {
      sm: `${components.button.padding.sm} ${components.button.fontSize.sm} h-[${sizes['btn-sm']}] rounded-sm`,
      default: `${components.button.padding.default} ${components.button.fontSize.default} h-[${sizes['btn-default']}] rounded-md`,
      lg: `${components.button.padding.lg} ${components.button.fontSize.lg} h-[${sizes['btn-lg']}] rounded-md`,
      xl: `${components.button.padding.xl} ${components.button.fontSize.xl} h-[${sizes['btn-xl']}] rounded-lg`,
      icon: `h-[${sizes['btn-default']}] w-[${sizes['btn-default']}] rounded-md`,
    },
  },
} as const;