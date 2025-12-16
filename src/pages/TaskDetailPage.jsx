import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    getTask,
    deleteTask,
    applyToTask,
    approveApplication,
    startWork,
    completeTask,
    finishWork,
    getRoleFromToken
} from '../api';

export function TaskDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();
    const location = useLocation();

    const canDelete = location.state?.canDelete === true; // автор задачи
    const role = getRoleFromToken();

    // если пришли из "моих откликов"
    const fromMyApplications = location.state?.fromMyApplications === true;
    const myAppStatus = location.state?.myAppStatus; // "ACCEPTED" и т.д.

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [applied, setApplied] = useState(false);
    const [applyLoading, setApplyLoading] = useState(false);

    const [approveLoadingId, setApproveLoadingId] = useState(null);
    const [workLoading, setWorkLoading] = useState(false);
    const [completeLoading, setCompleteLoading] = useState(false);

    // ✅ модалка цены
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [price, setPrice] = useState('');
    const [priceError, setPriceError] = useState(null);

    async function reloadTask(taskId) {
        const t = await getTask(taskId);
        setTask(t);
    }

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

    // ✅ теперь отклик = открыть окно ввода цены
    function handleApply() {
        setPrice('');
        setPriceError(null);
        setShowPriceModal(true);
    }

    // ✅ отправка отклика с ценой
    async function submitApplyWithPrice() {
        const trimmed = String(price || '').trim();
        if (!trimmed) {
            setPriceError('Укажите цену');
            return;
        }

        try {
            setApplyLoading(true);

            // ВАЖНО:
            // ты сказал, что уже поправил метод applyToTask в api,
            // значит тут передаём ВТОРЫМ АРГУМЕНТОМ просто цену (строку)
            // (а не объект {price: ...})
            await applyToTask(id, trimmed);

            setApplied(true);
            setShowPriceModal(false);
            setPrice('');
            setPriceError(null);

            await reloadTask(id);
        } catch (err) {
            if (err?.code === 'ALREADY_APPLIED') {
                setApplied(true);
                setShowPriceModal(false);
                return;
            }
            alert(err.message || 'Не удалось откликнуться');
        } finally {
            setApplyLoading(false);
        }
    }

    async function handleApprove(appId) {
        const ok = window.confirm(
            'Назначить этого исполнителя? Остальные отклики будут отклонены/удалены согласно логике бэка.'
        );
        if (!ok) return;

        try {
            setApproveLoadingId(appId);
            await approveApplication(id, appId);
            await reloadTask(id);
        } catch (e) {
            alert(e.message || 'Не удалось назначить исполнителя');
        } finally {
            setApproveLoadingId(null);
        }
    }

    async function handleStartWork() {
        try {
            setWorkLoading(true);
            await startWork(id);
            await reloadTask(id);
        } catch (e) {
            alert(e.message || 'Не удалось начать работу');
        } finally {
            setWorkLoading(false);
        }
    }

    async function handleFinishWork() {
        try {
            setWorkLoading(true);
            await finishWork(id);
            await reloadTask(id);
        } catch (e) {
            alert(e.message || 'Не удалось завершить работу');
        } finally {
            setWorkLoading(false);
        }
    }

    async function handleCompleteTask() {
        const ok = window.confirm('Завершить задачу?');
        if (!ok) return;

        try {
            setCompleteLoading(true);
            await completeTask(id);
            nav('/home'); // DONE -> уводим
        } catch (e) {
            alert(e.message || 'Не удалось завершить задачу');
        } finally {
            setCompleteLoading(false);
        }
    }

    const status = useMemo(() => {
        if (!task) return null;
        return typeof task.status === 'string' ? task.status : task.status?.name;
    }, [task]);

    const applicants = useMemo(() => (Array.isArray(task?.applicants) ? task.applicants : []), [task]);
    const executor = useMemo(() => task?.executor ?? null, [task]);

    const canApply = !canDelete && role === 'EXECUTOR' && status === 'OPEN' && !applied;

    // автор видит отклики только когда OPEN
    const showApplicants = canDelete && status === 'OPEN';

    // автор видит исполнителя когда НЕ OPEN и executor есть
    const showExecutor = canDelete && status !== 'OPEN' && executor;

    // кнопки исполнителя — только если пришли из "моих откликов" и мой отклик ACCEPTED
    const myAccepted = role === 'EXECUTOR' && fromMyApplications && myAppStatus === 'ACCEPTED';
    const canStartWorkBtn = myAccepted && status === 'READY_FOR_WORK';
    const canFinishWorkBtn = myAccepted && status === 'IN_PROGRESS';

    // ✅ кнопка заказчика: READY_FOR_ACCEPTANCE -> DONE
    const canCompleteTaskBtn = canDelete && status === 'READY_FOR_ACCEPTANCE';

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f5f6f8',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '40px'
            }}
        >
            <div style={{ width: '720px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* карточка задачи */}
                <div
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '28px',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
                    }}
                >
                    {loading && <p>Загрузка...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    {task && (
                        <>
                            <h2 style={{ marginBottom: '10px' }}>{task.title}</h2>
                            <p style={{ color: '#555', marginBottom: '20px' }}>{task.description}</p>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '16px',
                                    marginBottom: '20px'
                                }}
                            >
                                <div>
                                    <b>Город</b>
                                    <p style={{ margin: '6px 0 0' }}>{task.city || '—'}</p>
                                </div>

                                <div>
                                    <b>Статус</b>
                                    <p style={{ margin: '6px 0 0' }}>{status}</p>
                                </div>

                                <div>
                                    <b>Навыки</b>
                                    <p style={{ margin: '6px 0 0' }}>
                                        {task.requiredSkills?.length
                                            ? task.requiredSkills.map((s) => s.name ?? s.title ?? String(s)).join(', ')
                                            : '—'}
                                    </p>
                                </div>

                                <div>
                                    <b>Создана</b>
                                    <p style={{ margin: '6px 0 0' }}>
                                        {task.createdAt ? new Date(task.createdAt).toLocaleString() : '—'}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                                            cursor: 'pointer',
                                            opacity: applyLoading ? 0.7 : 1
                                        }}
                                    >
                                        {applyLoading ? 'Отправляем...' : 'Откликнуться'}
                                    </button>
                                )}

                                {!canDelete && role === 'EXECUTOR' && status === 'OPEN' && applied && (
                                    <span style={{ color: '#2e7d32' }}>Вы откликнулись на эту задачу</span>
                                )}

                                {/* ✅ КНОПКИ ИСПОЛНИТЕЛЯ */}
                                {canStartWorkBtn && (
                                    <button
                                        onClick={handleStartWork}
                                        disabled={workLoading}
                                        style={{
                                            padding: '12px 18px',
                                            borderRadius: '8px',
                                            border: '1px solid #2962ff',
                                            background: '#2962ff',
                                            color: 'white',
                                            cursor: 'pointer',
                                            opacity: workLoading ? 0.7 : 1
                                        }}
                                    >
                                        {workLoading ? '...' : 'Начать работу'}
                                    </button>
                                )}

                                {canFinishWorkBtn && (
                                    <button
                                        onClick={handleFinishWork}
                                        disabled={workLoading}
                                        style={{
                                            padding: '12px 18px',
                                            borderRadius: '8px',
                                            border: '1px solid #2962ff',
                                            background: '#2962ff',
                                            color: 'white',
                                            cursor: 'pointer',
                                            opacity: workLoading ? 0.7 : 1
                                        }}
                                    >
                                        {workLoading ? '...' : 'Завершить работу'}
                                    </button>
                                )}

                                {/* ✅ КНОПКА ЗАКАЗЧИКА: READY_FOR_ACCEPTANCE -> DONE */}
                                {canCompleteTaskBtn && (
                                    <button
                                        onClick={handleCompleteTask}
                                        disabled={completeLoading}
                                        style={{
                                            padding: '12px 18px',
                                            borderRadius: '8px',
                                            border: '1px solid #2e7d32',
                                            background: '#2e7d32',
                                            color: 'white',
                                            cursor: 'pointer',
                                            opacity: completeLoading ? 0.7 : 1
                                        }}
                                    >
                                        {completeLoading ? '...' : 'Завершить задачу'}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* OPEN: отклики (для автора) */}
                {showApplicants && (
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '22px 28px',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
                        }}
                    >
                        <h3 style={{ margin: 0, marginBottom: '14px' }}>
                            Откликнулись {applicants.length > 0 ? `(${applicants.length})` : ''}
                        </h3>

                        {applicants.length === 0 ? (
                            <p style={{ color: '#777', margin: 0 }}>Пока нет откликов</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {applicants.map((a, idx) => {
                                    const skills = Array.isArray(a.skills) ? a.skills : [];
                                    const createdAt = a.createdAt ? new Date(a.createdAt).toLocaleString() : null;
                                    const appId = a.applicationId;

                                    return (
                                        <div
                                            key={appId ?? a.profileId ?? idx}
                                            style={{
                                                border: '1px solid #eee',
                                                borderRadius: '12px',
                                                padding: '14px 16px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 800, fontSize: '16px' }}>
                                                        {a.username || 'Без имени'}
                                                    </div>

                                                    <div style={{ color: '#666', marginTop: '4px' }}>
                                                        {a.city ? a.city : '—'}
                                                        {typeof a.experience === 'number' ? ` • опыт: ${a.experience}` : ''}
                                                    </div>

                                                    {/* ✅ цена отклика (если бэк отдаёт) */}
                                                    {a.price && (
                                                        <div style={{ color: '#111', marginTop: '6px', fontWeight: 700 }}>
                                                            Цена: {a.price}
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ textAlign: 'right' }}>
                                                    <button
                                                        onClick={(ev) => {
                                                            ev.stopPropagation();
                                                            if (!appId) {
                                                                alert('Нет applicationId у отклика (бэк должен его отдавать)');
                                                                return;
                                                            }
                                                            handleApprove(appId);
                                                        }}
                                                        disabled={approveLoadingId === appId}
                                                        style={{
                                                            padding: '10px 14px',
                                                            borderRadius: '10px',
                                                            border: '1px solid #2962ff',
                                                            background: 'white',
                                                            color: '#2962ff',
                                                            fontWeight: 800,
                                                            cursor: 'pointer',
                                                            opacity: approveLoadingId === appId ? 0.7 : 1
                                                        }}
                                                    >
                                                        {approveLoadingId === appId ? '...' : 'Принять'}
                                                    </button>

                                                    {createdAt && (
                                                        <div style={{ color: '#777', marginTop: '8px', fontSize: '12px' }}>
                                                            {createdAt}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {a.description && (
                                                <div style={{ marginTop: '10px', color: '#444' }}>{a.description}</div>
                                            )}

                                            {skills.length > 0 && (
                                                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {skills.map((s, i) => (
                                                        <span
                                                            key={s.id ?? s.name ?? i}
                                                            style={{
                                                                padding: '6px 10px',
                                                                borderRadius: '999px',
                                                                background: '#f1f3f5',
                                                                border: '1px solid #e6e8eb',
                                                                fontSize: '12px',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            {s.name ?? s.title ?? String(s)}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* исполнитель (для автора), когда задача уже не OPEN */}
                {showExecutor && (
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '22px 28px',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
                        }}
                    >
                        <h3 style={{ margin: 0, marginBottom: '14px' }}>Исполнитель</h3>

                        <div
                            style={{
                                border: '1px solid #eee',
                                borderRadius: '12px',
                                padding: '14px 16px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 800, fontSize: '16px' }}>
                                        {executor.username || 'Без имени'}
                                    </div>

                                    <div style={{ color: '#666', marginTop: '4px' }}>
                                        {executor.city ? executor.city : '—'}
                                        {typeof executor.experience === 'number' ? ` • опыт: ${executor.experience}` : ''}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div
                                        style={{
                                            display: 'inline-block',
                                            padding: '6px 10px',
                                            borderRadius: '999px',
                                            border: '1px solid #ddd',
                                            fontSize: '12px',
                                            fontWeight: 800
                                        }}
                                    >
                                        {status}
                                    </div>
                                </div>
                            </div>

                            {executor.description && (
                                <div style={{ marginTop: '10px', color: '#444' }}>{executor.description}</div>
                            )}

                            {Array.isArray(executor.skills) && executor.skills.length > 0 && (
                                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {executor.skills.map((s, i) => (
                                        <span
                                            key={s.id ?? s.name ?? i}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: '999px',
                                                background: '#f1f3f5',
                                                border: '1px solid #e6e8eb',
                                                fontSize: '12px',
                                                fontWeight: 600
                                            }}
                                        >
                                            {s.name ?? s.title ?? String(s)}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ✅ МОДАЛКА ВВОДА ЦЕНЫ */}
            {showPriceModal && (
                <div
                    onClick={() => !applyLoading && setShowPriceModal(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                        zIndex: 9999
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '420px',
                            background: 'white',
                            borderRadius: '12px',
                            padding: '18px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                        }}
                    >
                        <h3 style={{ margin: 0, marginBottom: '12px' }}>Предложить цену</h3>

                        <div style={{ color: '#666', fontSize: '13px', marginBottom: '10px' }}>
                            Можно указать: <b>100</b>, <b>50 BYN</b>, <b>по договорённости</b> и т.п.
                        </div>

                        <input
                            autoFocus
                            value={price}
                            onChange={(e) => {
                                setPrice(e.target.value);
                                setPriceError(null);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    submitApplyWithPrice();
                                }
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    if (!applyLoading) setShowPriceModal(false);
                                }
                            }}
                            placeholder="Например: 100 BYN"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #ddd',
                                outline: 'none'
                            }}
                            disabled={applyLoading}
                        />

                        {priceError && <div style={{ color: '#d33', marginTop: '8px' }}>{priceError}</div>}

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                            <button
                                onClick={() => setShowPriceModal(false)}
                                disabled={applyLoading}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid #ddd',
                                    background: 'white',
                                    cursor: 'pointer',
                                    opacity: applyLoading ? 0.7 : 1
                                }}
                            >
                                Отмена
                            </button>

                            <button
                                onClick={submitApplyWithPrice}
                                disabled={applyLoading}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid #2962ff',
                                    background: '#2962ff',
                                    color: 'white',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    opacity: applyLoading ? 0.7 : 1
                                }}
                            >
                                {applyLoading ? 'Отправляем...' : 'Отправить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
