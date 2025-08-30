import React from 'react';
import { cn } from '@/lib/cn';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

// Typography variants using design system tokens
const typographyVariants = cva('', {
  variants: {
    variant: {
      // Display text (hero sections)
      'display-2xl': 'text-7xl font-extrabold tracking-tight lg:text-8xl',
      'display-xl': 'text-6xl font-extrabold tracking-tight lg:text-7xl',
      'display-lg': 'text-5xl font-bold tracking-tight lg:text-6xl',
      'display-md': 'text-4xl font-bold tracking-tight lg:text-5xl',
      'display-sm': 'text-3xl font-semibold tracking-tight lg:text-4xl',
      
      // Headings
      'h1': 'text-3xl font-bold tracking-tight lg:text-4xl',
      'h2': 'text-2xl font-semibold tracking-tight lg:text-3xl',
      'h3': 'text-xl font-semibold lg:text-2xl',
      'h4': 'text-lg font-semibold lg:text-xl',
      'h5': 'text-base font-semibold lg:text-lg',
      'h6': 'text-sm font-semibold lg:text-base',
      
      // Body text
      'body-xl': 'text-xl leading-relaxed',
      'body-lg': 'text-lg leading-relaxed',
      'body': 'text-base leading-normal',
      'body-sm': 'text-sm leading-normal',
      'body-xs': 'text-xs leading-normal',
      
      // Specialized text
      'lead': 'text-xl text-muted-foreground leading-relaxed',
      'large': 'text-lg font-semibold',
      'small': 'text-sm font-medium leading-none',
      'muted': 'text-sm text-muted-foreground',
      'subtle': 'text-xs text-muted-foreground uppercase tracking-wide',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      secondary: 'text-secondary-foreground',
      success: 'text-success',
      warning: 'text-warning',
      destructive: 'text-destructive',
      info: 'text-info',
    },
  },
  defaultVariants: {
    variant: 'body',
    align: 'left',
    color: 'default',
  },
});

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof typographyVariants> {
  asChild?: boolean;
  as?: React.ElementType;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, align, color, asChild = false, as, ...props }, ref) => {
    const Comp = asChild ? Slot : (as || getDefaultElement(variant));
    
    return React.createElement(
      Comp as any,
      {
        className: cn(typographyVariants({ variant, align, color, className })),
        ref,
        ...props
      }
    );
  }
);

Typography.displayName = 'Typography';

// Helper function to get default HTML element based on variant
function getDefaultElement(variant: string | null | undefined): React.ElementType {
  if (!variant) return 'p';
  
  if (variant.startsWith('display-') || variant.startsWith('h')) {
    if (variant === 'display-2xl' || variant === 'display-xl' || variant === 'h1') return 'h1';
    if (variant === 'display-lg' || variant === 'h2') return 'h2';
    if (variant === 'display-md' || variant === 'h3') return 'h3';
    if (variant === 'display-sm' || variant === 'h4') return 'h4';
    if (variant === 'h5') return 'h5';
    if (variant === 'h6') return 'h6';
  }
  
  if (variant === 'small' || variant === 'muted' || variant === 'subtle') {
    return 'small';
  }
  
  return 'p';
}

export { Typography, typographyVariants };

// Convenience components for common use cases
export const DisplayText = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'> & { size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' }>(
  ({ size = 'lg', ...props }, ref) => (
    <Typography
      variant={`display-${size}` as any}
      ref={ref as any}
      {...props}
    />
  )
);
DisplayText.displayName = 'DisplayText';

export const Heading = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }>(
  ({ level = 1, ...props }, ref) => (
    <Typography
      variant={`h${level}` as any}
      ref={ref as any}
      {...props}
    />
  )
);
Heading.displayName = 'Heading';

export const BodyText = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'> & { size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' }>(
  ({ size = 'base', ...props }, ref) => {
    const variant = size === 'base' ? 'body' : `body-${size}`;
    return (
      <Typography
        variant={variant as any}
        ref={ref as any}
        {...props}
      />
    );
  }
);
BodyText.displayName = 'BodyText';

export const LeadText = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography
      variant="lead"
      ref={ref as any}
      {...props}
    />
  )
);
LeadText.displayName = 'LeadText';

export const MutedText = React.forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography
      variant="muted"
      ref={ref}
      {...props}
    />
  )
);
MutedText.displayName = 'MutedText';