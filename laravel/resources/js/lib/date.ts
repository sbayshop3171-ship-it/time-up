/** Timestamps arrive as ISO strings; players read them in Dhaka time. */
export function when(iso: string | null | undefined): string {
    if (!iso) return '—';

    return new Date(iso).toLocaleString('en-GB', {
        timeZone: 'Asia/Dhaka',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}
