// utils/date.js
export function toDateOnly(value) {
    if (!value) return '—';
    const s = String(value).replace(/(\.\d{3})\d+$/, '$1'); // обрезаем микросекунды до мс
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return '—';

    // только дата: 14.12.2025
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(d);
}

export function toDateTime(value) {
    if (!value) return '—';
    const s = String(value).replace(/(\.\d{3})\d+$/, '$1');
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return '—';

    // дата + время: 14.12.2025, 18:56
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

