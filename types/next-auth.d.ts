// types/next-auth.d.ts

import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'admin' | 'teacher' | 'user';
      isValidated: boolean;
      adSkipping: boolean;
    };
  }

  interface User {
    id: string;
    role: 'admin' | 'teacher' | 'user';
    isValidated: boolean;
    adSkipping: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'admin' | 'teacher' | 'user';
    isValidated: boolean;
    adSkipping: boolean;
  }
}