import React, { useState } from 'react';
import { login, register } from '../api';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const nav = useNavigate();

    async function submit(e) {
        e.preventDefault();

        if (isLogin) {
            // ---------- ВХОД ----------
            const res = await login({ email, password });
            localStorage.setItem('taskbid_token', res.token);
            nav('/home');
        } else {
            // ---------- РЕГИСТРАЦИЯ ----------
            await register({ username, email, password });
            const res = await login({ email, password });
            localStorage.setItem('taskbid_token', res.token);
            nav('/choose-role');
        }
    }

    return (
        <div className="container">
            <div className="card">
                <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>

                <form onSubmit={submit}>
                    {!isLogin && (
                        <input className="input" placeholder="Имя" value={username}
                               onChange={e => setUsername(e.target.value)} required />
                    )}
                    <input className="input" placeholder="Email" value={email}
                           onChange={e => setEmail(e.target.value)} required />
                    <input className="input" placeholder="Пароль" type="password" value={password}
                           onChange={e => setPassword(e.target.value)} required />

                    <button className="btn" type="submit">
                        {isLogin ? 'Войти' : 'Создать аккаунт'}
                    </button>

                    <button type="button" className="btn-ghost"
                            onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Перейти к регистрации' : 'Уже есть аккаунт?'}
                    </button>
                </form>
            </div>
        </div>
    );
}
