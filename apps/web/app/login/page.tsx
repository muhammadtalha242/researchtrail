'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { apiFetch } from '@/lib/api';

type Session = { accessToken: string; user: { id: string; email: string; name: string | null } };

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useMutation({
    mutationFn: () => apiFetch<Session>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    onSuccess: (session) => { auth.login(session.accessToken, session.user); router.push('/library'); },
  });

  function submit(event: FormEvent) { event.preventDefault(); login.mutate(); }

  return <main id="main-content" className="mx-auto w-full max-w-md px-4 py-14"><form onSubmit={submit} className="panel p-7"><h1 className="text-3xl font-bold">Sign in</h1><p className="mt-2 text-sm text-slate-600">Access your saved publications and collections.</p><div className="mt-7 space-y-4"><label><span className="label">Email</span><input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label><span className="label">Password</span><input className="input" type="password" autoComplete="current-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></label></div>{login.error && <p className="mt-4 text-sm text-red-700" role="alert">{login.error.message}</p>}<button className="btn-primary mt-6 w-full" disabled={login.isPending}>{login.isPending ? 'Signing in…' : 'Sign in'}</button><p className="mt-5 text-center text-sm text-slate-600">No account? <Link className="font-medium text-indigo-800 underline underline-offset-2" href="/register">Create one</Link></p></form></main>;
}
