import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import {
    getMyTasks,
    getRecommendations,
    getAllTasks,
    getRoleFromToken,
    getMyTasksApplicationsCount
} from '../api';
import { toDateOnly } from '../utils/date';

export default function TasksListPage() {
    const nav = useNavigate();
    const [params] = useSearchParams();
    const type = params.get('type'); // my | recommended | all
    const role = getRoleFromToken();

    const [tasks, setTasks] = useState([]);
    const [appsCount, setAppsCount] = useState({});

    const isRecommended = type === 'recommended';
    const isAll = type === 'all';
    const isMy = !isRecommended && !isAll;

    if ((isRecommended || isAll) && role !== 'EXECUTOR') {
        return <Navigate to="/home" replace />;
    }

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                if (isRecommended) {
                    const data = await getRecommendations();
                    if (!cancelled) setTasks(Array.isArray(data) ? data : []);
                    return;
                }

                if (isAll) {
                    const data = await getAllTasks();
                    if (!cancelled) setTasks(Array.isArray(data) ? data : []);
                    return;
                }

                // мои
                const data = await getMyTasks();
                if (!cancelled) setTasks(Array.isArray(data) ? data : []);

                // counts откликов по моим задачам
                try {
                    const list = await getMyTasksApplicationsCount();
                    const map = {};
                    (list || []).forEach((x) => {
                        map[x.taskId] = x.count;
                    });
                    if (!cancelled) setAppsCount(map);
                } catch (e) {
                    console.error(e);
                }
            } catch (e) {
                console.error(e);
                if (!cancelled) setTasks([]);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isRecommended, isAll, isMy]);

    function logout() {
        localStorage.removeItem('taskbid_token');
        nav('/auth');
    }

    function openTask(id) {
        nav(`/tasks/${id}`, { state: { canDelete: isMy } });
    }

    const title = isAll ? 'Все задачи' : isRecommended ? 'Рекомендованные задачи' : 'Мои задачи';

    // ✅ правую часть делаем как на HomePage (боковую не трогаем)
    const contentWrapStyle = {
        flex: 1,
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    };

    const contentStyle = {
        width: 'min(920px, 100%)'
    };

    const sectionTitleStyle = {
        margin: '0 0 14px'
    };

    const listCardStyle = {
        width: '100%',
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e6e8eb'
    };

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

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f5f6f8' }}>
            {/* Левая панель — НЕ трогаем */}
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

                {/* ✅ "Мои отклики" — только для EXECUTOR */}
                {role === 'EXECUTOR' && (
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
            <div style={contentWrapStyle}>
                <div style={contentStyle}>
                    <h2 style={sectionTitleStyle}>{title}</h2>

                    <div style={listCardStyle}>
                        {tasks.length === 0 ? (
                            <p style={{ padding: '16px', color: '#777', margin: 0 }}>Нет задач</p>
                        ) : (
                            tasks.map((task, idx) => {
                                const count = Number(appsCount[task.id] || 0);
                                const date = toDateOnly(task.beginDate ?? task.createdAt);

                                return (
                                    <div
                                        key={task.id ?? idx}
                                        onClick={() => openTask(task.id)}
                                        style={{
                                            ...rowStyle,
                                            borderBottom: idx === tasks.length - 1 ? 'none' : rowStyle.borderBottom
                                        }}
                                    >
                                        <div style={{ minWidth: 0 }}>
                                            <div style={titleStyle}>{task.title}</div>

                                            <div style={metaStyle}>
                                                <div>
                                                    <span style={labelStyle}>Дата:</span> {date}
                                                </div>
                                                <div>
                                                    <span style={labelStyle}>Статус:</span> {task.status}
                                                </div>
                                            </div>
                                        </div>

                                        {/* badge только для "моих" */}
                                        {isMy && count > 0 && <div style={badgeStyle}>{count}</div>}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
