'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from './auth-provider';

export function PrivacyControls() {
  const { user, logout, ready } = useAuth();
  const router = useRouter();
  const erase = useMutation({
    mutationFn: () => apiFetch<{ success: boolean }>('/auth/account', { method: 'DELETE' }),
    onSuccess: () => {
      logout();
      router.push('/');
    },
  });

  if (!ready) return <p role="status">Loading account controls…</p>;
  if (!user) return <p className="mt-4 rounded-xl bg-slate-100 p-4"><Link href="/login">Sign in</Link> to use the self-service account erasure control.</p>;

  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="mt-0">Self-service account erasure</h3>
      <p>Signed in as {user.email}</p>
      <div className="mt-4">
        <button
          type="button"
          className="btn-secondary border-red-300 text-red-800 hover:bg-red-50"
          disabled={erase.isPending}
          onClick={() => {
            if (window.confirm('Permanently delete your account, saved papers, notes and collections? This cannot be undone.')) erase.mutate();
          }}
        >
          {erase.isPending ? 'Deleting…' : 'Delete my account'}
        </button>
      </div>
      {erase.error && <p role="alert">{erase.error.message}</p>}
    </div>
  );
}
