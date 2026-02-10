'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="mc-btn mc-btn-outline text-xs py-2 px-3"
      >
        {user.email?.split('@')[0]?.slice(0, 10) ?? 'Account'}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 mc-card p-0 z-50">
          <Link
            href="/account"
            className="block px-4 py-3 text-sm hover:bg-[var(--bg-card-hover)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setOpen(false)}
          >
            My Account
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-3 text-sm hover:bg-[var(--bg-card-hover)] transition-colors"
            style={{ color: 'var(--mc-red)' }}
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
