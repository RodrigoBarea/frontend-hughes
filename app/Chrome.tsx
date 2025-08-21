'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import FooterHS from '@/components/FooterHs';

const HIDE_CHROME = new Set<string>([
  '/parents/login',
  '/help-center',
  '/academics/login',
  '/help-center/timetables',
  '/student/help-center',
  '/student/library',     // ← agregar
]);

export default function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hide = HIDE_CHROME.has(pathname);

  return (
    <>
      {!hide && <Navbar />}
      {/* Si tu Navbar es fijo (120px), aplica padding solo cuando está visible */}
      <main className={hide ? '' : 'pt-[120px]'}>{children}</main>
      {!hide && <FooterHS />}
    </>
  );
}
