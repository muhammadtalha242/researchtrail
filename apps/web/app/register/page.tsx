'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { apiFetch } from '@/lib/api';

type Session = { accessToken: string; user: { id: string; email: string; name: string | null } };

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useMutation({
    mutationFn: () => apiFetch<Session>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
    onSuccess: (session) => { auth.login(session.accessToken, session.user); router.push('/library'); },
  });

  function submit(event: FormEvent) { event.preventDefault(); register.mutate(); }

  return <main id="main-content" className="mx-auto w-full max-w-md px-4 py-14"><form onSubmit={submit} className="panel p-7"><h1 className="text-3xl font-bold">Create an account</h1><p className="mt-2 text-sm text-slate-600">Save papers, add notes, and organise collections.</p><div className="mt-7 space-y-4"><label><span className="label">Name <span className="font-normal text-slate-500">(optional)</span></span><input className="input" autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /></label><label><span className="label">Email</span><input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label><span className="label">Password</span><input className="input" type="password" autoComplete="new-password" minLength={8} maxLength={128} aria-describedby="password-hint" value={password} onChange={(e) => setPassword(e.target.value)} required /><span id="password-hint" className="mt-1 block text-xs text-slate-600">At least 8 characters.</span></label></div>{register.error && <p className="mt-4 text-sm text-red-700" role="alert">{register.error.message}</p>}<button className="btn-primary mt-6 w-full" disabled={register.isPending}>{register.isPending ? 'Creating account…' : 'Create account'}</button><p className="mt-5 text-center text-sm text-slate-600">Already registered? <Link className="font-medium text-indigo-800 underline underline-offset-2" href="/login">Sign in</Link></p><p className="mt-4 text-center text-xs leading-5 text-slate-600">By creating an account, you acknowledge the <Link className="underline" href="/privacy">privacy information</Link>.</p></form></main>;
}
