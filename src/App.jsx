import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import RoleSelectPage from './pages/RoleSelectPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import CreateTaskPage from './pages/CreateTaskPage';
import {TaskDetailPage} from './pages/TaskDetailPage.jsx';
import TasksListPage from './pages/TaskListPage.jsx';


function RequireAuth({ children }) {
    return localStorage.getItem('taskbid_token')
        ? children
        : <Navigate to="/auth" replace />;
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/choose-role" element={<RequireAuth><RoleSelectPage /></RequireAuth>} />
            <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
            <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
            <Route path="/task/new" element={<RequireAuth><CreateTaskPage /></RequireAuth>} />
            <Route path="/tasks/:id" element={<RequireAuth><TaskDetailPage /></RequireAuth>} />
            <Route path="/tasks" element={<RequireAuth><TasksListPage /></RequireAuth>}
            />

        </Routes>
    );
}
