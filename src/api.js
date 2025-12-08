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





