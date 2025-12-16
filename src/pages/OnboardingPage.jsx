import React, { useEffect, useState } from 'react';
import { getSkillCategories, submitOnboarding } from '../api';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
    const [skills, setSkills] = useState([]);
    const [selected, setSelected] = useState(new Set());

    const [city, setCity] = useState('');
    const [description, setDescription] = useState('');

    const nav = useNavigate();

    useEffect(() => {
        getSkillCategories().then(setSkills).catch(console.error);
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
            description,
            skillIds: [...selected]
        });

        nav('/auth');
    }

    return (
        <div className="container">
            <div className="card">
                <h2>Профиль исполнителя</h2>

                <form onSubmit={submit}>
                    <input
                        className="input"
                        placeholder="Город"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                    />

                    <textarea
                        className="input"
                        placeholder="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div>
                        <h3>Навыки</h3>
                        {skills.map((cat) => (
                            <div key={cat.id}>
                                <strong>{cat.name}</strong>
                                {cat.skills.map((s) => (
                                    <label key={s.id} style={{ display: 'block' }}>
                                        <input
                                            type="checkbox"
                                            checked={selected.has(s.id)}
                                            onChange={() => toggle(s.id)}
                                        />
                                        {s.name}
                                    </label>
                                ))}
                            </div>
                        ))}
                    </div>

                    <button className="btn" type="submit">
                        Сохранить
                    </button>
                </form>
            </div>
        </div>
    );
}
