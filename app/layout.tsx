import type { Metadata, Viewport } from 'next';
import { BRAND } from '@/lib/brand';
import './globals.css';

export const metadata: Metadata = {
  title: `${BRAND.name} — অনলাইন ক্যাসিনো ও ক্রিকেট এক্সচেঞ্জ`,
  description:
    'বাংলাদেশের অনলাইন গেমিং প্ল্যাটফর্ম — লাইভ ক্যাসিনো, স্লট, ক্রিকেট এক্সচেঞ্জ, ফিশিং ও লটারি।',
  applicationName: BRAND.name,
};

export const viewport: Viewport = {
  themeColor: '#04211f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
