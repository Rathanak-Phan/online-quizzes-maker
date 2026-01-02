// app/hooks/useAuthApi.ts
import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from './use-toast';

interface UseAuthApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

export function useAuthApi<T = any>(
  endpoint: string,
  options: UseAuthApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const isAuthenticated = status === 'authenticated';

  const fetchData = useCallback(async (
    body?: any,
    customOptions?: Partial<UseAuthApiOptions>
  ) => {
    if (options.requireAuth !== false && !isAuthenticated) {
      setError('Authentication required');
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access this feature',
        variant: 'destructive',
      });
      throw new Error('Authentication required');
    }

    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...customOptions?.headers,
      };

      const config = {
        method: options.method || 'GET',
        headers,
        ...(body && { body: JSON.stringify(body) }),
      };

      const response = await fetch(`/api/${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, options, isAuthenticated, toast]);

  return {
    data,
    loading,
    error,
    fetchData,
    setData,
    setError,
    session,
    isAuthenticated,
  };
}

// Hook for teacher-specific operations
export function useTeacherApi<T = any>(
  endpoint: string,
  options: UseAuthApiOptions = {}
) {
  const api = useAuthApi<T>(endpoint, { ...options, requireAuth: true });
  const { session } = api;

  const teacherFetchData = useCallback(async (
    body?: any,
    customOptions?: Partial<UseAuthApiOptions>
  ) => {
    if (session?.user.role !== 'teacher') {
      throw new Error('Teacher access required');
    }

    if (session.user.role === 'teacher' && !session.user.isValidated) {
      throw new Error('Teacher account pending approval');
    }

    return api.fetchData(body, customOptions);
  }, [api, session]);

  return {
    ...api,
    fetchData: teacherFetchData,
    isTeacher: session?.user.role === 'teacher',
    isValidated: session?.user.isValidated,
  };
}