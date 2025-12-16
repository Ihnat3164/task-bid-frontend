import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getMyApplications, getRoleFromToken } from '../api';

export default function MyApplicationsPage() {
    const nav = useNavigate();
    const role = getRoleFromToken();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    if (role !== 'EXECUTOR') {
        return <Navigate to="/home" replace />;
    }

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const list = await getMyApplications();
                if (!cancelled) setItems(Array.isArray(list) ? list : []);
            } catch (e) {
                if (!cancelled) setErr(e.message || 'Ошибка');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, []);

    function logout() {
        localStorage.removeItem('taskbid_token');
        nav('/auth');
    }

    // ✅ ВАЖНО: пробрасываем state, чтобы TaskDetailPage понял что пришли из "Моих откликов"
    function openTask(x) {
        const taskId = x.taskId ?? x.task?.id;
        if (!taskId) return;

        nav(`/tasks/${taskId}`, {
            state: {
                canDelete: false,
                fromMyApplications: true,
                myAppStatus: x.status,                 // "ACCEPTED" / "PENDING" / "REJECTED"
                myApplicationId: x.applicationId ?? null
            }
        });
    }

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f5f6f8' }}>
            {/* Левая панель */}
            <div style={{
                width: '240px',
                background: '#eceff1',
                padding: '25px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                borderRight: '1px solid #d0d4d8'
            }}>
                <button
                    onClick={() => nav('/home')}
                    style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'white',
                        border: '1px solid #2962ff',
                        color: '#2962ff',
                        cursor: 'pointer'
                    }}
                >
                    На главную
                </button>

                <button
                    onClick={logout}
                    style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'white',
                        border: '1px solid #2962ff',
                        color: '#2962ff',
                        cursor: 'pointer'
                    }}
                >
                    Выйти
                </button>
            </div>

            {/* Правая часть */}
            <div style={{
                flex: 1,
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <h2 style={{ marginBottom: '20px', alignSelf: 'flex-start' }}>
                    Мои отклики
                </h2>

                <div style={{
                    width: '720px',
                    background: 'white',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid #ddd'
                }}>
                    {loading && <p style={{ padding: '20px' }}>Загрузка...</p>}
                    {err && <p style={{ padding: '20px', color: 'red' }}>{err}</p>}

                    {!loading && !err && items.length === 0 && (
                        <p style={{ padding: '20px', color: '#777' }}>Пока нет откликов</p>
                    )}

                    {!loading && !err && items.map((x, idx) => (
                        <div
                            key={x.applicationId ?? idx}
                            onClick={() => openTask(x)}
                            style={{
                                padding: '16px 18px',
                                borderBottom: '1px solid #eee',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px'
                            }}
                        >
                            <div style={{ minWidth: 0 }}>
                                <strong style={{ display: 'block' }}>
                                    {x.taskTitle || (x.task?.title ?? `Задача #${x.taskId ?? x.task?.id ?? '?'}`)}
                                </strong>
                                <span style={{ color: '#555' }}>
                  {x.taskCity ? x.taskCity : (x.task?.city ?? '—')}
                                    {' • '}
                                    {x.createdAt ? new Date(x.createdAt).toLocaleString() : '—'}
                </span>
                            </div>

                            <div style={{
                                padding: '6px 10px',
                                borderRadius: '999px',
                                border: '1px solid #ddd',
                                fontSize: '12px',
                                fontWeight: 800,
                                whiteSpace: 'nowrap'
                            }}>
                                {x.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
