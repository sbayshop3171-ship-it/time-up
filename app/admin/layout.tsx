import Link from 'next/link';
import type { Metadata } from 'next';
import AdminNav from '@/components/admin/AdminNav';
import { BRAND } from '@/lib/brand';
import { isBackendReady } from '@/lib/supabase';

export const metadata: Metadata = {
  title: `${BRAND.name} — অ্যাডমিন`,
  robots: { index: false, follow: false },
};

/** The admin area opts out of the player shell: no bottom nav, no floating
    support buttons, and a wider column than the phone-width site. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      <header className="adm__hd">
        <Link href="/admin" className="adm__brand">
          {BRAND.name} <span>অ্যাডমিন</span>
        </Link>
        <Link href="/" className="btn btn--ghost" style={{ fontSize: 12, padding: '6px 14px' }}>
          সাইট দেখুন
        </Link>
      </header>

      <AdminNav />

      {!isBackendReady() && (
        <div className="adm__warn">
          ডেটাবেস যুক্ত হয়নি — <code>.env.local</code> এ Supabase কী বসালে সব
          স্ক্রিন লাইভ ডেটা দেখাবে। এখন শুধু ইন্টারফেস দেখা যাচ্ছে।
        </div>
      )}

      <main className="adm__body">{children}</main>
    </div>
  );
}
