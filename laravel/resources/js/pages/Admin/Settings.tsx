import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../layouts/AdminLayout';
import { BRAND } from '../../lib/brand';

interface Channel {
    id: string;
    name: string;
    account_no: string | null;
    account_name: string | null;
    min_amount: number;
    max_amount: number;
    supports_deposit: boolean;
    supports_withdraw: boolean;
    is_active: boolean;
}

/** One channel's own row-form: the operator's receiving account lives here and
    nowhere else — it is never sent to a player-facing page. */
function ChannelForm({ channel }: { channel: Channel }) {
    const { data, setData, patch, processing, errors } = useForm({
        account_no: channel.account_no ?? '',
        account_name: channel.account_name ?? '',
        min_amount: channel.min_amount / 100,
        max_amount: channel.max_amount / 100,
        supports_deposit: channel.supports_deposit,
        supports_withdraw: channel.supports_withdraw,
        is_active: channel.is_active,
    });

    return (
        <form
            className="adm__form"
            onSubmit={(e) => { e.preventDefault(); patch(`/admin/settings/channels/${channel.id}`, { preserveScroll: true }); }}
        >
            <label>চ্যানেল
                <input value={channel.name} readOnly />
            </label>
            <label>অ্যাকাউন্ট নাম্বার
                <input value={data.account_no} onChange={(e) => setData('account_no', e.target.value)} placeholder="01XXXXXXXXX" />
                {errors.account_no && <span className="adm__err">{errors.account_no}</span>}
            </label>
            <label>অ্যাকাউন্টের নাম
                <input value={data.account_name} onChange={(e) => setData('account_name', e.target.value)} />
            </label>
            <label>সর্বনিম্ন ({BRAND.currency})
                <input type="number" value={data.min_amount} onChange={(e) => setData('min_amount', Number(e.target.value))} />
                {errors.min_amount && <span className="adm__err">{errors.min_amount}</span>}
            </label>
            <label>সর্বোচ্চ ({BRAND.currency})
                <input type="number" value={data.max_amount} onChange={(e) => setData('max_amount', Number(e.target.value))} />
                {errors.max_amount && <span className="adm__err">{errors.max_amount}</span>}
            </label>
            <label>ডিপোজিট
                <input type="checkbox" checked={data.supports_deposit} onChange={(e) => setData('supports_deposit', e.target.checked)} />
            </label>
            <label>উইথড্র
                <input type="checkbox" checked={data.supports_withdraw} onChange={(e) => setData('supports_withdraw', e.target.checked)} />
            </label>
            <label>সক্রিয়
                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
            </label>
            <button className="adm__btn adm__btn--go" type="submit" disabled={processing}>সেভ</button>
        </form>
    );
}

export default function Settings({
    site,
    support,
    channels,
}: {
    site: { name?: string; domain?: string; currency?: string };
    support: { email?: string; whatsapp?: string; telegram?: string; facebook?: string };
    channels: Channel[];
}) {
    const { data, setData, patch, processing, errors } = useForm({
        name: site.name ?? BRAND.name,
        domain: site.domain ?? BRAND.domain,
        currency: site.currency ?? 'BDT',
        email: support.email ?? BRAND.email,
        whatsapp: support.whatsapp ?? '',
        telegram: support.telegram ?? '',
        facebook: support.facebook ?? '',
    });

    return (
        <>
            <Head title="অ্যাডমিন — সেটিংস" />
            <h1 className="adm__h1">সেটিংস</h1>

            <h2 className="adm__h2">সাইট</h2>
            <form
                className="adm__form"
                onSubmit={(e) => { e.preventDefault(); patch('/admin/settings/site', { preserveScroll: true }); }}
            >
                <label>সাইটের নাম
                    <input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    {errors.name && <span className="adm__err">{errors.name}</span>}
                </label>
                <label>ডোমেইন
                    <input value={data.domain} onChange={(e) => setData('domain', e.target.value)} />
                </label>
                <label>কারেন্সি
                    <input value={data.currency} onChange={(e) => setData('currency', e.target.value)} />
                </label>
                <label>সাপোর্ট ইমেইল
                    <input value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    {errors.email && <span className="adm__err">{errors.email}</span>}
                </label>
                <label>WhatsApp
                    <input value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} />
                </label>
                <label>Telegram
                    <input value={data.telegram} onChange={(e) => setData('telegram', e.target.value)} />
                </label>
                <label>Facebook
                    <input value={data.facebook} onChange={(e) => setData('facebook', e.target.value)} />
                </label>
                <button className="adm__btn adm__btn--go" type="submit" disabled={processing}>সেভ</button>
            </form>

            <h2 className="adm__h2">পেমেন্ট চ্যানেল</h2>
            <p className="adm__sub">
                অপারেটরের রিসিভিং অ্যাকাউন্ট নাম্বার কখনো ফ্রন্ট-এন্ড কোডে রাখা হয় না —
                সেগুলো ডেটাবেসে থাকে এবং শুধু এই স্ক্রিন থেকে সেট হয়।
            </p>
            {channels.map((c) => <ChannelForm key={c.id} channel={c} />)}
        </>
    );
}

Settings.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
