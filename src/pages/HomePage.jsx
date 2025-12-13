import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTasks, getRecommendations, getRoleFromToken } from '../api';


export default function HomePage() {
    const nav = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [recs, setRecs] = useState([]);


    function logout() {
        localStorage.removeItem('taskbid_token');
        nav('/auth');
    }

    function openTask(id) {
        nav(`/tasks/${id}`);
    }

    useEffect(() => {
        getMyTasks().then(setTasks).catch(err => console.error(err));

        const role = getRoleFromToken();
        if (role === 'EXECUTOR') {
            getRecommendations().then(setRecs).catch(err => console.error(err));
        }
    }, []);
    {getRoleFromToken() === 'EXECUTOR' && (
        <>
            <h2 style={{ marginBottom: '20px', alignSelf: 'flex-start' }}>
                Рекомендованные задачи
            </h2>

            <div style={{
                width: '600px',
                background: 'white',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid #ddd',
                marginBottom: '30px'
            }}>
                {recs.length === 0 ? (
                    <p style={{ padding: '20px', color: '#777' }}>
                        Нет рекомендаций
                    </p>
                ) : (
                    recs.map((task, idx) => (
                        <div
                            key={task.id ?? idx}
                            onClick={() => openTask(task.id)}
                            style={{
                                padding: '16px 18px',
                                borderBottom: '1px solid #eee',
                                cursor: 'pointer'
                            }}
                        >
                            <strong>{task.title}</strong><br />
                            <span style={{ color: '#555' }}>
                            {task.status} • {task.beginDate}
                        </span>
                        </div>
                    ))
                )}
            </div>
        </>
    )}


    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            background: '#f5f6f8'
        }}>

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
                {getRoleFromToken() === 'EXECUTOR' && (
                    <>
                        <h2 style={{ marginBottom: '20px', alignSelf: 'flex-start' }}>
                            Рекомендованные задачи
                        </h2>

                        <div style={{
                            width: '600px',
                            background: 'white',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid #ddd',
                            marginBottom: '30px'
                        }}>
                            {recs.length === 0 ? (
                                <p style={{ padding: '20px', color: '#777' }}>
                                    Нет рекомендаций
                                </p>
                            ) : (
                                recs.map((task, idx) => (
                                    <div
                                        key={task.id ?? idx}
                                        onClick={() => openTask(task.id)}
                                        style={{
                                            padding: '16px 18px',
                                            borderBottom: '1px solid #eee',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <strong>{task.title}</strong><br />
                                        <span style={{ color: '#555' }}>
                            {task.status} • {task.beginDate}
                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                <h2 style={{ marginBottom: '20px', alignSelf: 'flex-start' }}>Мои задачи</h2>

                <div style={{
                    width: '600px',
                    background: 'white',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid #ddd'
                }}>
                    {tasks.length === 0 ? (
                        <p style={{ padding: '20px', color: '#777' }}>
                            Нет текущих задач
                        </p>
                    ) : (
                        tasks.map((task, idx) => (
                            <div
                                key={task.id ?? idx}
                                onClick={() => openTask(task.id)}
                                style={{
                                    padding: '16px 18px',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer'
                                }}
                            >
                                <strong>{task.title}</strong><br />
                                <span style={{ color: '#555' }}>
                                    {task.status} • {task.beginDate}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
