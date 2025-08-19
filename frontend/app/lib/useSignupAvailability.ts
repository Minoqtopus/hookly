import { useEffect, useState } from 'react';

export interface SignupAvailability {
  canSignup: boolean;
  canBetaSignup: boolean;
  remainingSignups: number;
  remainingBetaSignups: number;
  isSignupEnabled: boolean;
  isBetaSignupEnabled: boolean;
  signupMessage?: string;
  betaSignupMessage?: string;
  lastUpdated: Date;
}

export function useSignupAvailability() {
  const [availability, setAvailability] = useState<SignupAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSignupAvailability();
  }, []);

  const fetchSignupAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signup-availability');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch signup availability: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse the date string back to Date object
      const parsedData = {
        ...data,
        lastUpdated: new Date(data.lastUpdated)
      };

      setAvailability(parsedData);
    } catch (err) {
      console.error('Error fetching signup availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch signup availability');
      
      // Set default availability in case of error
      setAvailability({
        canSignup: false,
        canBetaSignup: false,
        remainingSignups: 0,
        remainingBetaSignups: 0,
        isSignupEnabled: false,
        isBetaSignupEnabled: false,
        lastUpdated: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchSignupAvailability();
  };

  return {
    availability,
    loading,
    error,
    refetch,
  };
}
