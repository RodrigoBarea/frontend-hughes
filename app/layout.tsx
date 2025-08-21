import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import Chrome from './Chrome';

const pt_sans = PT_Sans({ subsets: ['latin'], weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'Hughes Schools',
  description: 'Welcome the institutional website from Hugues Schools',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${pt_sans.className} min-h-screen flex flex-col`}>
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
