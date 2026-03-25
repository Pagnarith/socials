import './globals.css';

export const metadata = {
  title: 'Socials Dashboard — Digital Financial Plan',
  description: 'Manage your multi-platform content strategy for Minecraft & Rhino 3D',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
