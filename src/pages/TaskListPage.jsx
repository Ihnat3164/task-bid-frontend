import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import {
    getMyTasks,
    getRecommendations,
    getAllTasks,
    getRoleFromToken,
    getMyTasksApplicationsCount
} from '../api';

export default function TasksListPage() {
    const nav = useNavigate();
    const [params] = useSearchParams();
    const type = params.get('type'); // my | recommended | all
    const role = getRoleFromToken();

    const [tasks, setTasks] = useState([]);
    const [appsCount, setAppsCount] = useState({});

    const isRecommended = type === 'recommended';
    const isAll = type === 'all';
    const isMy = !isRecommended && !isAll; // "мои"

    if ((isRecommended || isAll) && role !== 'EXECUTOR') {
        return <Navigate to="/home" replace />;
    }

    useEffect(() => {
        (async () => {
            if (isRecommended) {
                setTasks(await getRecommendations());
            } else if (isAll) {
                setTasks(await getAllTasks());
            } else {
                // мои
                setTasks(await getMyTasks());

                // counts откликов по моим задачам
                try {
                    const list = await getMyTasksApplicationsCount();
                    const map = {};
                    (list || []).forEach((x) => {
                        map[x.taskId] = x.count;
                    });
                    setAppsCount(map);
                } catch (e) {
                    console.error(e);
                }
            }
        })().catch(console.error);
    }, [isRecommended, isAll, isMy]);

    function logout() {
        localStorage.removeItem('taskbid_token');
        nav('/auth');
    }

    function openTask(id) {
        nav(`/tasks/${id}`, { state: { canDelete: isMy } });
    }

    const title = isAll
        ? 'Все задачи'
        : isRecommended
            ? 'Рекомендованные задачи'
            : 'Мои задачи';

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f5f6f8' }}>
            {/* Левая панель */}
            <div
                style={{
                    width: '240px',
                    background: '#eceff1',
                    padding: '25px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    borderRight: '1px solid #d0d4d8'
                }}
            >
                <button
                    onClick={() => nav('/task/new')}
                    style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: '#2962ff',
                        color: 'white',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    + Создать задачу
                </button>

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
            <div
                style={{
                    flex: 1,
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <h2 style={{ marginBottom: '20px', alignSelf: 'flex-start' }}>{title}</h2>

                <div
                    style={{
                        width: '600px',
                        background: 'white',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                    }}
                >
                    {tasks.length === 0 ? (
                        <p style={{ padding: '20px', color: '#777' }}>Нет задач</p>
                    ) : (
                        tasks.map((task, idx) => {
                            const count = Number(appsCount[task.id] || 0);

                            return (
                                <div
                                    key={task.id ?? idx}
                                    onClick={() => openTask(task.id)}
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
                                    <div>
                                        <strong>{task.title}</strong>
                                        <br />
                                        <span style={{ color: '#555' }}>
                      {task.status} • {task.beginDate}
                    </span>
                                    </div>

                                    {/* badge только для "моих" */}
                                    {isMy && count > 0 && (
                                        <div
                                            style={{
                                                minWidth: '28px',
                                                height: '28px',
                                                borderRadius: '999px',
                                                background: '#2962ff',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '13px',
                                                padding: '0 8px'
                                            }}
                                        >
                                            {count}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
