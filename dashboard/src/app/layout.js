import './globals.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DarkModeToggle } from '../components/DarkModeToggle';

export const metadata = {
  title: 'Socials Dashboard — Digital Financial Plan',
  description: 'Manage your multi-platform content strategy for Minecraft & Rhino 3D',
  metadataBase: new URL('https://social.chakriya.net'),
  openGraph: {
    title: 'Socials Dashboard — Digital Financial Plan',
    description: 'Multi-platform content management hub for Minecraft Add-ons & Rhino 3D tutorials',
    url: 'https://social.chakriya.net',
    siteName: 'Socials Dashboard',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Socials Dashboard',
    description: 'Multi-platform content management hub for Minecraft Add-ons & Rhino 3D tutorials',
  },
  icons: {
    icon: '/favicon.svg',
  },
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
