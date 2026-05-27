'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs';

const navItems = [
  { label: 'Library', href: '/library' },
  { label: 'My Books', href: '/my-books' },
];

const Navbar = () => {
  const pathName = usePathname();

  return (
    <header
      className="w-full fixed z-50"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="wrapper navbar-height py-4 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex gap-0.5 items-center">
          <Image
            src="/assets/logo.png"
            alt="Bookified"
            width={42}
            height={26}
          />
          <span className="logo-text">Bookified</span>
        </Link>

        {/* Nav links */}
        <nav className="w-fit flex gap-7.5 items-center">
          {navItems.map(({ label, href }) => {
            const isActive =
              pathName === href ||
              (href !== '/' && pathName.startsWith(href));

            return (
              <Link
                href={href}
                key={label}
                className={cn(
                  'nav-link-base',
                  isActive ? 'nav-link-active' : 'text-black hover:opacity-70'
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right-side controls */}
        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="nav-btn">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-primary text-sm px-4 py-2">
                Sign up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/subscriptions" className="nav-link-base text-black hover:opacity-70">
              Subscriptions
            </Link>
            <Link href="/books/new" className="btn-primary text-sm px-4 py-2">
              + Add Book
            </Link>
            <UserButton />
          </Show>
        </div>

      </div>
    </header>
  );
};

export default Navbar;