import React from 'react';
import { submitOnboarding } from '../api';
import { useNavigate } from 'react-router-dom';

export default function RoleSelectPage() {
    const nav = useNavigate();

    function choose(role) {
        if (role === 'CUSTOMER') {
            submitOnboarding({ role }).then(() => nav('/home'));
        } else {
            // Исполнитель — идём на анкету, POST будет после заполнения анкеты
            nav('/onboarding');
        }
    }


    return (
        <div className="container">
            <div className="card">
                <h2>Выберите роль</h2>

                <button className="btn" onClick={() => choose('CUSTOMER')}>
                    Я заказчик
                </button>

                <button className="btn-ghost" onClick={() => choose('EXECUTOR')}>
                    Я исполнитель
                </button>
            </div>
        </div>
    );
}
