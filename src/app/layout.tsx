import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OpenAI ChatKit on Vercel',
  description: 'A starter app for OpenAI ChatKit',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
