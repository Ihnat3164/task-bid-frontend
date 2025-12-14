import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    getTask,
    deleteTask,
    applyToTask,
    getRoleFromToken
} from '../api';

export function TaskDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();
    const location = useLocation();

    const canDelete = location.state?.canDelete === true;
    const role = getRoleFromToken();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [applied, setApplied] = useState(false);
    const [applyLoading, setApplyLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const t = await getTask(id);
                if (!cancelled) setTask(t);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Ошибка загрузки');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => (cancelled = true);
    }, [id]);

    function goBack() {
        nav(-1);
    }

    async function handleDelete() {
        if (!window.confirm('Удалить задачу?')) return;

        try {
            await deleteTask(id);
            nav('/home');
        } catch (err) {
            alert(err.message || 'Не удалось удалить задачу');
        }
    }

    async function handleApply() {
        try {
            setApplyLoading(true);
            await applyToTask(id);
            setApplied(true);
        } catch (err) {
            if (err?.code === 'ALREADY_APPLIED') {
                setApplied(true);
                return;
            }
            alert(err.message || 'Не удалось откликнуться');
        } finally {
            setApplyLoading(false);
        }
    }

    const status = task
        ? typeof task.status === 'string'
            ? task.status
            : task.status?.name
        : null;

    const canApply =
        !canDelete &&
        role === 'EXECUTOR' &&
        status === 'OPEN' &&
        !applied;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f5f6f8',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
        }}>
            <div style={{
                width: '720px',
                background: 'white',
                borderRadius: '12px',
                padding: '28px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
            }}>
                {loading && <p>Загрузка...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                {task && (
                    <>
                        <h2>{task.title}</h2>
                        <p style={{ color: '#555' }}>{task.description}</p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            marginBottom: '20px'
                        }}>
                            <div>
                                <b>Город</b>
                                <p>{task.city || '—'}</p>
                            </div>
                            <div>
                                <b>Статус</b>
                                <p>{status}</p>
                            </div>
                            <div>
                                <b>Навыки</b>
                                <p>
                                    {task.requiredSkills?.length
                                        ? task.requiredSkills.map(s => s.name).join(', ')
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <b>Создана</b>
                                <p>
                                    {task.createdAt
                                        ? new Date(task.createdAt).toLocaleString()
                                        : '—'}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button
                                onClick={goBack}
                                style={{
                                    padding: '12px 18px',
                                    borderRadius: '8px',
                                    border: '1px solid #2962ff',
                                    background: 'white',
                                    color: '#2962ff',
                                    cursor: 'pointer'
                                }}
                            >
                                Назад
                            </button>

                            {canDelete && status === 'OPEN' && (
                                <button
                                    onClick={handleDelete}
                                    style={{
                                        padding: '12px 18px',
                                        borderRadius: '8px',
                                        border: '1px solid #d33',
                                        background: 'white',
                                        color: '#d33',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Удалить
                                </button>
                            )}

                            {canApply && (
                                <button
                                    onClick={handleApply}
                                    disabled={applyLoading}
                                    style={{
                                        padding: '12px 18px',
                                        borderRadius: '8px',
                                        border: '1px solid #2962ff',
                                        background: 'white',
                                        color: '#2962ff',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {applyLoading ? 'Отправляем...' : 'Откликнуться'}
                                </button>
                            )}

                            {!canDelete && role === 'EXECUTOR' && status === 'OPEN' && applied && (
                                <span style={{ color: '#2e7d32' }}>
                                    Вы откликнулись на эту задачу
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
