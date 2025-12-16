import { API_BASE_URL } from './config';

function authHeaders() {
    const token = localStorage.getItem('taskbid_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function register(data) {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Register failed');
    return res.json();
}

export async function login(data) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Login failed');

    const result = await res.json();

    // Сохраняем токен в localStorage
    if (result.token) {
        localStorage.setItem('taskbid_token', result.token);
    }

    return result;
}

export async function getSkillCategories() {
    const res = await fetch(`${API_BASE_URL}/api/profiles/skills`, {
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to load skills');
    return res.json();
}

export async function submitOnboarding(payload) {
    const headers = { 'Content-Type': 'application/json', ...authHeaders() };
    console.log('Onboarding headers:', headers); // <- проверяем
    const res = await fetch(`${API_BASE_URL}/api/profiles/onboarding`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Onboarding error');
    return res;
}

export async function createTask(data) {
    const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        throw new Error('Task creation failed');
    }

    return res;
}

export async function getMyTasks() {
    const res = await fetch(`${API_BASE_URL}/api/my`, {
        headers: authHeaders()
    });

    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
}

export async function getTask(id) {
    const res = await fetch(`${API_BASE_URL}/api/task?id=${id}`, {
        headers: authHeaders()
    });

    if (!res.ok) throw new Error('Failed to fetch task');
    return res.json();
}

// ===== role from JWT =====
export function getRoleFromToken() {
    const token = localStorage.getItem('taskbid_token');
    if (!token) return null;

    try {
        const payload = token.split('.')[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const data = JSON.parse(json);
        return data.role ?? null; // "EXECUTOR" / "CUSTOMER"
    } catch (e) {
        return null;
    }
}

// ===== recommendations =====
export async function getRecommendations() {
    const res = await fetch(`${API_BASE_URL}/api/recommendations`, {
        headers: authHeaders()
    });

    if (res.status === 403) return []; // не EXECUTOR
    if (!res.ok) throw new Error('Failed to fetch recommendations');

    return res.json();
}

export async function deleteTask(id) {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });

    if (!res.ok) throw new Error('Failed to delete task');
    return res;
}


export async function getAllTasks() {
    const res = await fetch(`${API_BASE_URL}/api/tasks/all`, {
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch all tasks');
    return res.json();
}

export async function applyToTask(id, price) {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${id}/apply`, {
        method: 'POST',
        headers: {
            ...authHeaders(),
            'Content-Type': 'text/plain; charset=utf-8'
        },
        body: String(price ?? '').trim()
    });

    if (res.ok) return res;

    if (res.status === 409) {
        const err = new Error('ALREADY_APPLIED');
        err.code = 'ALREADY_APPLIED';
        throw err;
    }

    if (res.status === 401) {
        const err = new Error('UNAUTHORIZED');
        err.code = 'UNAUTHORIZED';
        throw err;
    }

    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to apply');
}


export async function getMyTasksApplicationsCount() {
    const res = await fetch(`${API_BASE_URL}/api/my/tasks/applications-count`, {
        headers: authHeaders()
    });

    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to fetch applications count');

    return res.json();
}

export async function approveApplication(taskId, appId) {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/applications/${appId}/approve`, {
        method: 'POST',
        headers: authHeaders()
    });

    if (res.ok) return res;

    if (res.status === 401) throw new Error('Unauthorized');
    if (res.status === 403) throw new Error('Forbidden');
    if (res.status === 404) throw new Error('Not found');
    if (res.status === 409) throw new Error('Conflict');

    throw new Error('Failed to approve');
}


export async function getMyApplications() {
    const res = await fetch(`${API_BASE_URL}/api/my/applications`, {
        headers: authHeaders()
    });

    if (res.status === 401) throw new Error('Unauthorized');
    if (res.status === 403) throw new Error('Forbidden');
    if (!res.ok) throw new Error('Failed to fetch my applications');

    return res.json();
}

export async function startWork(taskId) {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/start-work`, {
        method: 'POST',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to start work');
    return res;
}

export async function finishWork(taskId) {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/finish-work`, {
        method: 'POST',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to finish work');
    return res;
}

export async function completeTask(taskId) {
    const res = await fetch(
        `${API_BASE_URL}/api/tasks/${taskId}/complete`,
        {
            method: 'POST',
            headers: authHeaders()
        }
    );

    if (!res.ok) throw new Error('Failed to complete task');
    return res;
}















