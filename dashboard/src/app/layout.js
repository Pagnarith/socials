import './globals.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DarkModeToggle } from '../components/DarkModeToggle';

export const metadata = {
  title: 'Homework Palette — Social Ops',
  description: 'Multi-platform content ops for Homework Palette (grades 1–6 homework for families)',
  metadataBase: new URL('https://social.chakriya.net'),
  openGraph: {
    title: 'Homework Palette — Social Ops',
    description: 'Content calendar, revenue tracking, and platform ops for Homework Palette',
    url: 'https://social.chakriya.net',
    siteName: 'Homework Palette Social Ops',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Homework Palette — Social Ops',
    description: 'Content calendar, revenue tracking, and platform ops for Homework Palette',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  // Keep brand mark aligned with App Store / TikTok developer app icon (house + tree).
  themeColor: '#B8D4F0',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <Navbar />
        <div className="min-h-[calc(100vh-140px)]">
          {children}
        </div>
        <Footer />
        <DarkModeToggle />
      </body>
    </html>
  );
}
