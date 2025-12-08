import React, { useEffect, useState } from 'react';
import { getSkillCategories, submitOnboarding } from '../api';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
    const [skills, setSkills] = useState([]);
    const [selected, setSelected] = useState(new Set());

    const [city, setCity] = useState('');
    const [experience, setExperience] = useState(0);
    const [description, setDescription] = useState('');
    const [workRadiusKm, setWorkRadiusKm] = useState(10);

    const nav = useNavigate();

    useEffect(() => {
        getSkillCategories().then(setSkills);
    }, []);

    function toggle(id) {
        const copy = new Set(selected);
        copy.has(id) ? copy.delete(id) : copy.add(id);
        setSelected(copy);
    }

    async function submit(e) {
        e.preventDefault();
        await submitOnboarding({
            role: 'EXECUTOR',
            city,
            experience,
            description,
            workRadiusKm,
            skillIds: [...selected]
        });
        nav('/home');
    }

    return (
        <div className="container">
            <div className="card">
                <h2>Профиль исполнителя</h2>

                <form onSubmit={submit}>
                    <input className="input" placeholder="Город"
                           value={city} onChange={e => setCity(e.target.value)} required />

                    <input className="input" type="number"
                           placeholder="Опыт (лет)"
                           value={experience} onChange={e => setExperience(e.target.value)} />

                    <input className="input" type="number"
                           placeholder="Радиус (км)"
                           value={workRadiusKm} onChange={e => setWorkRadiusKm(e.target.value)} />

                    <textarea className="input" placeholder="Описание"
                              value={description} onChange={e => setDescription(e.target.value)} />

                    <div>
                        <h3>Навыки</h3>
                        {skills.map(cat => (
                            <div key={cat.id}>
                                <strong>{cat.name}</strong>
                                {cat.skills.map(s => (
                                    <label key={s.id} style={{ display: 'block' }}>
                                        <input type="checkbox" checked={selected.has(s.id)}
                                               onChange={() => toggle(s.id)} />
                                        {s.name}
                                    </label>
                                ))}
                            </div>
                        ))}
                    </div>

                    <button className="btn" type="submit">Сохранить</button>
                </form>
            </div>
        </div>
    );
}
