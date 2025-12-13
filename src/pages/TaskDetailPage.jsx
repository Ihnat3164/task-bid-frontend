import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTask } from '../api';

export function TaskDetailPage() {
    const {id} = useParams();
    const nav = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (cancelled) return;

            setLoading(true);
            setError(null);

            try {
                const task = await getTask(id);
                if (!cancelled) setTask(task);
            } catch (err) {
                if (!cancelled) setError(err.message || "Ошибка загрузки");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [id]);


    function goBack() {
        nav(-1);
    }

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
                {error && <p style={{color: 'red'}}>{error}</p>}

                {task && (
                    <>
                        <h2 style={{marginBottom: '10px'}}>{task.title}</h2>
                        <p style={{color: '#555', marginBottom: '20px'}}>{task.description}</p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            marginBottom: '20px'
                        }}>
                            <div>
                                <h4 style={{margin: '0 0 6px'}}>Город</h4>
                                <p style={{margin: 0}}>{task.city || 'Не указан'}</p>
                            </div>
                            <div>
                                <h4 style={{margin: '0 0 6px'}}>Статус</h4>
                                <p style={{margin: 0}}>{task.status}</p>
                            </div>
                            <div>
                                <h4 style={{margin: '0 0 6px'}}>Навыки</h4>
                                <p style={{margin: 0}}>
                                    {task.requiredSkills && task.requiredSkills.length > 0
                                        ? task.requiredSkills.map(skill => skill.name || skill.title || skill).join(', ')
                                        : 'Не указаны'}
                                </p>
                            </div>
                            <div>
                                <h4 style={{margin: '0 0 6px'}}>Создана</h4>
                                <p style={{margin: 0}}>
                                    {task.createdAt
                                        ? new Date(task.createdAt).toLocaleString()
                                        : 'Дата неизвестна'}
                                </p>
                            </div>
                        </div>

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
                    </>
                )}
            </div>
        </div>
    );
}