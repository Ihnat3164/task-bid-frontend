import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSkillCategories, createTask } from '../api';

export default function CreateTaskPage() {
    const nav = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [city, setCity] = useState('');
    const [skills, setSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState(new Set());

    useEffect(() => {
        getSkillCategories().then(setSkills);
    }, []);

    function toggleSkill(id) {
        const copy = new Set(selectedSkills);
        copy.has(id) ? copy.delete(id) : copy.add(id);
        setSelectedSkills(copy);
    }

    async function submit(e) {
        e.preventDefault();
        try {
            const res = await createTask({
                title,
                description,
                city,
                skillIds: [...selectedSkills]
            });

            if (res.ok) {          // <- проверяем статус
                nav('/home');       // редирект на главную
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка при создании задачи');
        }
    }

    return (
        <div className="container">
            <div className="card">
                <h2>Создать задачу</h2>
                <form onSubmit={submit}>
                    <input
                        className="input"
                        placeholder="Название задачи"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        className="input"
                        placeholder="Описание"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    <input
                        className="input"
                        placeholder="Город"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                    />

                    <div>
                        <h3>Навыки</h3>
                        {skills.map(cat => (
                            <div key={cat.id}>
                                <strong>{cat.name}</strong>
                                {cat.skills.map(s => (
                                    <label key={s.id} style={{ display: 'block' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedSkills.has(s.id)}
                                            onChange={() => toggleSkill(s.id)}
                                        />
                                        {s.name}
                                    </label>
                                ))}
                            </div>
                        ))}
                    </div>

                    <button className="btn" type="submit">Создать</button>
                </form>
            </div>
        </div>
    );
}
