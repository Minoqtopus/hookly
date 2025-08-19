'use client';

import { validateCopyConsistency } from '@/app/lib/copy';
import { useEffect, useState } from 'react';

interface CopyValidatorProps {
  showWarnings?: boolean;
  className?: string;
}

export default function CopyValidator({ showWarnings = false, className = '' }: CopyValidatorProps) {
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateCopyConsistency> | null>(null);

  useEffect(() => {
    const result = validateCopyConsistency();
    setValidationResult(result);
    
    if (!result.isValid && showWarnings) {
      console.warn('Copy consistency issues detected:', result.issues);
    }
  }, [showWarnings]);

  if (!validationResult || validationResult.isValid) {
    return null;
  }

  if (!showWarnings) {
    return null;
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Copy Consistency Issues Detected
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="list-disc list-inside space-y-1">
              {validationResult.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for copy validation
export function useCopyValidation() {
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateCopyConsistency> | null>(null);

  useEffect(() => {
    const result = validateCopyConsistency();
    setValidationResult(result);
  }, []);

  return validationResult;
}
