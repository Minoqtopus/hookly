'use client';

import { COPY } from '@/app/lib/copy';
import { ReactNode } from 'react';

interface CopyTextProps {
  type: 'plan' | 'platform' | 'feature' | 'action' | 'status' | 'error' | 'success' | 'form' | 'placeholder' | 'tooltip';
  key: string;
  fallback?: string;
  className?: string;
  children?: ReactNode;
}

export default function CopyText({ type, key, fallback, className = '', children }: CopyTextProps) {
  let text: string | undefined;

  switch (type) {
    case 'plan':
      const plan = COPY.PLANS[key as keyof typeof COPY.PLANS];
      text = plan?.DISPLAY_NAME || plan?.NAME || fallback;
      break;
    case 'platform':
      const platform = COPY.PLATFORMS[key as keyof typeof COPY.PLATFORMS];
      text = typeof platform === 'string' ? platform : fallback;
      break;
    case 'feature':
      text = COPY.FEATURES[key as keyof typeof COPY.FEATURES] || fallback;
      break;
    case 'action':
      text = COPY.ACTIONS[key as keyof typeof COPY.ACTIONS] || fallback;
      break;
    case 'status':
      text = COPY.STATUS[key as keyof typeof COPY.STATUS] || fallback;
      break;
    case 'error':
      text = COPY.ERRORS[key as keyof typeof COPY.ERRORS] || fallback;
      break;
    case 'success':
      text = COPY.SUCCESS[key as keyof typeof COPY.SUCCESS] || fallback;
      break;
    case 'form':
      text = COPY.FORMS[key as keyof typeof COPY.FORMS] || fallback;
      break;
    case 'placeholder':
      text = COPY.PLACEHOLDERS[key as keyof typeof COPY.PLACEHOLDERS] || fallback;
      break;
    case 'tooltip':
      text = COPY.TOOLTIPS[key as keyof typeof COPY.TOOLTIPS] || fallback;
      break;
    default:
      text = fallback;
  }

  if (!text) {
    console.warn(`Copy text not found for type: ${type}, key: ${key}`);
    text = fallback || 'Text not found';
  }

  return (
    <span className={className}>
      {children || text}
    </span>
  );
}

// Convenience components for common use cases
export function PlanName({ plan, className = '' }: { plan: string; className?: string }) {
  return <CopyText type="plan" key={plan} className={className} />;
}

export function PlatformName({ platform, className = '' }: { platform: string; className?: string }) {
  return <CopyText type="platform" key={platform} className={className} />;
}

export function FeatureName({ feature, className = '' }: { feature: string; className?: string }) {
  return <CopyText type="feature" key={feature} className={className} />;
}

export function ActionButton({ action, className = '' }: { action: string; className?: string }) {
  return <CopyText type="action" key={action} className={className} />;
}

export function StatusMessage({ status, className = '' }: { status: string; className?: string }) {
  return <CopyText type="status" key={status} className={className} />;
}

export function ErrorMessage({ error, className = '' }: { error: string; className?: string }) {
  return <CopyText type="error" key={error} className={className} />;
}

export function SuccessMessage({ success, className = '' }: { success: string; className?: string }) {
  return <CopyText type="success" key={success} className={className} />;
}

export function FormLabel({ label, className = '' }: { label: string; className?: string }) {
  return <CopyText type="form" key={label} className={className} />;
}

export function PlaceholderText({ placeholder, className = '' }: { placeholder: string; className?: string }) {
  return <CopyText type="placeholder" key={placeholder} className={className} />;
}

export function TooltipText({ tooltip, className = '' }: { tooltip: string; className?: string }) {
  return <CopyText type="tooltip" key={tooltip} className={className} />;
}
