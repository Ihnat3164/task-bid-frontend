import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getMyTasks,
    getRecommendations,
    getRoleFromToken,
    getMyTasksApplicationsCount
} from '../api';
import { toDateOnly } from '../utils/date';

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
        getMyTasks().then(setTasks).catch(console.error);

        getMyTasksApplicationsCount()
            .then((list) => {
                const map = {};
                (list || []).forEach((x) => {
                    map[x.taskId] = x.count;
                });
                setAppsCount(map);
            })
            .catch(console.error);

        if (role === 'EXECUTOR') {
            getRecommendations().then(setRecs).catch(console.error);
        }
    }, [role]);

    // ✅ стили правой части (боковую не трогаем)
    const contentWrapStyle = {
        flex: 1,
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    };

    // контейнер с контентом (шире, меньше пустоты)
    const contentStyle = {
        width: 'min(920px, 100%)'
    };

    // заголовок вровень с блоком задач
    const sectionTitleStyle = {
        margin: '0 0 14px',
        paddingLeft: '0px'
    };

    // список/карточка
    const listCardStyle = {
        width: '100%',
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e6e8eb'
    };

    // элемент задачи (компактнее + меньше пустого места)
    const rowStyle = {
        padding: '12px 16px',
        borderBottom: '1px solid #f0f1f3',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
    };

    const titleStyle = {
        fontWeight: 800,
        fontSize: '16px',
        lineHeight: 1.15,
        marginBottom: '6px'
    };

    const metaStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        color: '#555',
        fontSize: '13px',
        lineHeight: 1.2
    };

    const labelStyle = { color: '#8a8f98' };

    const badgeStyle = {
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
        padding: '0 8px',
        flexShrink: 0
    };

    const subBtnStyle = {
        marginTop: '14px',
        padding: '10px 12px',
        borderRadius: '10px',
        border: '1px solid #ddd',
        background: 'white',
        cursor: 'pointer',
        alignSelf: 'flex-start'
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f5f6f8' }}>
            {/* Левая панель (НЕ ТРОГАЕМ) */}
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

                {/* CUSTOMER → стать исполнителем */}
                {role === 'CUSTOMER' && (
                    <button
                        onClick={() => nav('/onboarding')}
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'white',
                            border: '1px solid #2962ff',
                            color: '#2962ff',
                            cursor: 'pointer'
                        }}
                    >
                        Стать исполнителем
                    </button>
                )}

                {/* EXECUTOR кнопки */}
                {role === 'EXECUTOR' && (
                    <>
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

                        <button
                            onClick={() => nav('/my-applications')}
                            style={{
                                padding: '12px',
                                borderRadius: '8px',
                                background: 'white',
                                border: '1px solid #2962ff',
                                color: '#2962ff',
                                cursor: 'pointer'
                            }}
                        >
                            Мои отклики
                        </button>
                    </>
                )}

                {/* Кнопка выхода — внизу */}
                <div style={{ marginTop: 'auto' }}>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            background: '#ffebee',
                            border: '1px solid #e53935',
                            color: '#e53935',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Выйти
                    </button>
                </div>
            </div>

            {/* Правая часть (обновили дизайн) */}
            <div style={contentWrapStyle}>
                <div style={contentStyle}>
                    {/* Рекомендованные задачи */}
                    {role === 'EXECUTOR' && (
                        <>
                            <h2 style={sectionTitleStyle}>Рекомендованные задачи</h2>

                            <div style={{ ...listCardStyle, marginBottom: '18px' }}>
                                {recs.length === 0 ? (
                                    <p style={{ padding: '16px', color: '#777', margin: 0 }}>Нет рекомендаций</p>
                                ) : (
                                    recs.slice(0, 3).map((task, idx) => (
                                        <div
                                            key={task.id}
                                            onClick={() => openOtherTask(task.id)}
                                            style={{
                                                ...rowStyle,
                                                borderBottom: idx === Math.min(2, recs.length - 1) ? 'none' : rowStyle.borderBottom
                                            }}
                                        >
                                            <div style={{ minWidth: 0 }}>
                                                <div style={titleStyle}>{task.title}</div>

                                                <div style={metaStyle}>
                                                    <div>
                                                        <span style={labelStyle}>Дата:</span>{' '}
                                                        {toDateOnly(task.beginDate ?? task.createdAt)}
                                                    </div>
                                                    <div>
                                                        <span style={labelStyle}>Статус:</span> {task.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button onClick={() => nav('/tasks?type=recommended')} style={{ ...subBtnStyle, marginBottom: '28px' }}>
                                Посмотреть все
                            </button>
                        </>
                    )}

                    {/* Мои задачи */}
                    <h2 style={sectionTitleStyle}>Мои задачи</h2>

                    <div style={listCardStyle}>
                        {tasks.length === 0 ? (
                            <p style={{ padding: '16px', color: '#777', margin: 0 }}>Нет текущих задач</p>
                        ) : (
                            tasks.slice(0, 3).map((task, idx) => {
                                const count = Number(appsCount[task.id] || 0);

                                return (
                                    <div
                                        key={task.id}
                                        onClick={() => openMyTask(task.id)}
                                        style={{
                                            ...rowStyle,
                                            borderBottom: idx === Math.min(2, tasks.length - 1) ? 'none' : rowStyle.borderBottom
                                        }}
                                    >
                                        <div style={{ minWidth: 0 }}>
                                            <div style={titleStyle}>{task.title}</div>

                                            <div style={metaStyle}>
                                                <div>
                                                    <span style={labelStyle}>Дата:</span>{' '}
                                                    {toDateOnly(task.beginDate ?? task.createdAt)}
                                                </div>
                                                <div>
                                                    <span style={labelStyle}>Статус:</span> {task.status}
                                                </div>
                                            </div>
                                        </div>

                                        {count > 0 && <div style={badgeStyle}>{count}</div>}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <button onClick={() => nav('/tasks?type=my')} style={subBtnStyle}>
                        Посмотреть все
                    </button>
                </div>
            </div>
        </div>
    );
}
