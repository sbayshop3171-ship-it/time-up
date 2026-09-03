import { Head } from '@inertiajs/react';
import AdminLayout from '../../layouts/AdminLayout';
import { taka } from '../../lib/brand';

interface Tile {
    label: string;
    value: number;
    money?: boolean;
}

export default function Dashboard({ tiles }: { tiles: Tile[] }) {
    return (
        <>
            <Head title="অ্যাডমিন — ড্যাশবোর্ড" />
            <h1 className="adm__h1">ড্যাশবোর্ড</h1>
            <div className="adm__tiles">
                {tiles.map((t) => (
                    <div className="adm__tile" key={t.label}>
                        <b>{t.money ? taka(t.value) : t.value.toLocaleString('en-IN')}</b>
                        <small>{t.label}</small>
                    </div>
                ))}
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
