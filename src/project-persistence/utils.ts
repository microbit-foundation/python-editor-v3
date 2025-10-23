export function timeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.round((+now - +date) / 1000);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
        { amount: 60, unit: 'second' },
        { amount: 60, unit: 'minute' },
        { amount: 24, unit: 'hour' },
        { amount: 7, unit: 'day' },
        { amount: 4.34524, unit: 'week' },  // approx
        { amount: 12, unit: 'month' }
    ];

    let duration = seconds;
    for (const division of divisions) {
        if (Math.abs(duration) < division.amount) {
            return rtf.format(-Math.round(duration), division.unit);
        }
        duration /= division.amount;
    }

    return rtf.format(-Math.round(duration), "year");
}