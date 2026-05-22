'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export function useAuth(requiredRole) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    const role = Cookies.get('role');
    const userStr = Cookies.get('user');

    if (!token || !role) {
      router.push('/');
      return;
    }

    if (requiredRole && role !== requiredRole) {
      router.push(role === 'admin' ? '/admin' : '/judge/dashboard');
      return;
    }

    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch {}
    }
    setLoading(false);
  }, []);

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    Cookies.remove('user');
    router.push('/');
  };

  return { user, loading, logout };
}
