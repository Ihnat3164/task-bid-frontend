import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getMyTasks,
    getRecommendations,
    getRoleFromToken,
    getMyTasksApplicationsCount
} from '../api';

export default function HomePage() {
    const nav = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [recs, setRecs] = useState([]);
    const [appsCount, setAppsCount] = useState({});
    const role = getRoleFromToken();

    function logout() {
        localStorage.removeItem('taskbid_token');
        nav('/auth');
    }

    function openMyTask(id) {
        nav(`/tasks/${id}`, { state: { canDelete: true } });
    }

    function openOtherTask(id) {
        nav(`/tasks/${id}`, { state: { canDelete: false } });
    }

    useEffect(() => {
        // мои задачи
        getMyTasks()
            .then(setTasks)
            .catch(console.error);

        // counts откликов по моим задачам
        getMyTasksApplicationsCount()
            .then((list) => {
                const map = {};
                (list || []).forEach((x) => {
                    map[x.taskId] = x.count;
                });
                setAppsCount(map);
            })
            .catch(console.error);

        // рекомендации (только для EXECUTOR)
        if (role === 'EXECUTOR') {
            getRecommendations()
                .then(setRecs)
                .catch(console.error);
        }
    }, [role]);

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

                {/* Кнопка "Все задачи" — только для EXECUTOR */}
                {role === 'EXECUTOR' && (
                    <button
                        onClick={() => nav('/tasks?type=all')}
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'white',
                            border: '1px solid #2962ff',
                            color: '#2962ff',
                            cursor: 'pointer'
                        }}
                    >
                        Все задачи
                    </button>
                )}

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
                {/* Рекомендованные задачи */}
                {role === 'EXECUTOR' && (
                    <>
                        <h2 style={{ marginBottom: '20px', alignSelf: 'flex-start' }}>
                            Рекомендованные задачи
                        </h2>

                        <div
                            style={{
                                width: '600px',
                                background: 'white',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border: '1px solid #ddd',
                                marginBottom: '30px'
                            }}
                        >
                            {recs.length === 0 ? (
                                <p style={{ padding: '20px', color: '#777' }}>Нет рекомендаций</p>
                            ) : (
                                recs.slice(0, 3).map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => openOtherTask(task.id)}
                                        style={{
                                            padding: '16px 18px',
                                            borderBottom: '1px solid #eee',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <strong>{task.title}</strong>
                                        <br />
                                        <span style={{ color: '#555' }}>
                      {task.status} • {task.beginDate}
                    </span>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => nav('/tasks?type=recommended')}
                            style={{
                                marginBottom: '40px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                background: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Посмотреть все
                        </button>
                    </>
                )}

                {/* Мои задачи */}
                <h2 style={{ marginBottom: '20px', alignSelf: 'flex-start' }}>Мои задачи</h2>

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
                        <p style={{ padding: '20px', color: '#777' }}>Нет текущих задач</p>
                    ) : (
                        tasks.slice(0, 3).map((task) => {
                            const count = Number(appsCount[task.id] || 0);

                            return (
                                <div
                                    key={task.id}
                                    onClick={() => openMyTask(task.id)}
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

                                    {count > 0 && (
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

                <button
                    onClick={() => nav('/tasks?type=my')}
                    style={{
                        marginTop: '20px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        background: 'white',
                        cursor: 'pointer'
                    }}
                >
                    Посмотреть все
                </button>
            </div>
        </div>
    );
}
