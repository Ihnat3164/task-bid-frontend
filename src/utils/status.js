export function normalizeTaskStatus(status) {
    const value = typeof status === 'string' ? status : status?.name;

    switch (value) {
        case 'READY_FOR_WORK':
            return 'ASSIGNED';
        case 'READY_FOR_ACCEPTANCE':
            return 'IN_PROGRESS';
        case 'DONE':
            return 'COMPLETED';
        default:
            return value ?? null;
    }
}

export function normalizeApplicationStatus(status) {
    const value = typeof status === 'string' ? status : status?.name;
    return value === 'ACCEPTED' ? 'APPROVED' : value ?? null;
}

export function taskStatusLabel(status) {
    switch (normalizeTaskStatus(status)) {
        case 'OPEN':
            return 'Открыта';
        case 'ASSIGNED':
            return 'Исполнитель назначен';
        case 'IN_PROGRESS':
            return 'В работе';
        case 'COMPLETED':
            return 'Завершена';
        case 'CANCELLED':
            return 'Отменена';
        default:
            return status || '—';
    }
}

export function applicationStatusLabel(status) {
    switch (normalizeApplicationStatus(status)) {
        case 'PENDING':
            return 'Ожидает решения';
        case 'APPROVED':
            return 'Одобрен';
        case 'REJECTED':
            return 'Отклонён';
        default:
            return status || '—';
    }
}
