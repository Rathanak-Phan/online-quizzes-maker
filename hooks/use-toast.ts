// app/hooks/use-toast.ts
import { useCallback } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    // For now, just log to console
    console.log('Toast:', options);
    // Later, integrate with your UI library, e.g., shadcn/ui toast
  }, []);

  return { toast };
}
