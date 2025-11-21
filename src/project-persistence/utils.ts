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

export function significantDateUnits(date: Date): string {
    const now = new Date();

    let dateTimeOptions: Intl.DateTimeFormatOptions = { month: "short", year: "2-digit" };

    const daysDifferent = Math.round((+now - +date) / (1000 * 60 * 60 * 24));
    if (daysDifferent < 1 && date.getDay() === now.getDay()) {
        dateTimeOptions = {
            hour: 'numeric',
            minute: 'numeric',
        }
    } else if (now.getFullYear() === date.getFullYear()) {
        dateTimeOptions = {
            day: 'numeric',
            month: 'short'
        }
    }

    return Intl.DateTimeFormat(undefined, dateTimeOptions).format(date);
}

// TODO: WORLDS UGLIEST UIDS
export const makeUID = () => {
    return `${Math.random()}`;
};

