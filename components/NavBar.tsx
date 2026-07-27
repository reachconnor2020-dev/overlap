'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const LINKS = [
  { href: '/discover', label: 'Discover' },
  { href: '/matches', label: 'Matches' },
  { href: '/profile', label: 'Profile' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line px-6 py-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/discover" className="font-display text-lg italic">
          Overlap
        </Link>
        <nav className="flex items-center gap-6">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium ${
                pathname === link.href ? 'text-ink' : 'text-ink/50 hover:text-ink'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm font-medium text-ink/50 hover:text-ink"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
