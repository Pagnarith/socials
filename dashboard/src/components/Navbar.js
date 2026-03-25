'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/content/', label: 'Content' },
  { href: '/analytics/', label: 'Analytics' },
  { href: '/revenue/', label: 'Revenue' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  const renderLinks = (mobile) =>
    navLinks.map((link) => {
      const isActive = pathname === link.href || pathname === link.href.replace(/\/$/, '');
      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={mobile ? () => setMobileOpen(false) : undefined}
          className={`${mobile ? 'block py-2' : ''} text-sm font-medium transition-colors ${
            isActive
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          {link.label}
        </Link>
      );
    });

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
            🎮 Socials Dashboard
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">Digital Financial Plan — Minecraft & Rhino 3D</p>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-4">
          {renderLinks(false)}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t dark:border-gray-700 bg-white dark:bg-gray-900 px-4 pb-4">
          {renderLinks(true)}
        </div>
      )}
    </header>
  );
}
