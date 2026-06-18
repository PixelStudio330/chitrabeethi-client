'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'artist' | 'admin')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only evaluate authentication routing rules after parsing completes
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User logged in but lacks structural role permission
        router.replace('/'); 
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  // Global loading spinner centered perfectly with clean design branding
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F3E6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#754A70]/20 border-t-[#3F303D] rounded-full animate-spin" />
          <p className="text-xs font-mono tracking-wider text-[#3F303D]/60 uppercase font-bold">
            Verifying Gallery Credentials...
          </p>
        </div>
      </div>
    );
  }

  // If user meets role validation criteria, reveal children safely
  if (user && (!allowedRoles || allowedRoles.includes(user.role))) {
    return <>{children}</>;
  }

  return null;
}