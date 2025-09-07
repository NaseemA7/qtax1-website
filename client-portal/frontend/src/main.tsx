import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PersonalDashboard from './pages/dashboards/PersonalDashboard';
import BusinessDashboard from './pages/dashboards/BusinessDashboard';
import AdminHome from './pages/dashboards/AdminHome';
import { useAuth } from './lib/auth';

function AuthGate({ roles }: { roles: string[] }) {
  const { accessToken, role } = useAuth();
  if (!accessToken) return <Navigate to="/login" replace/>;
  if (roles && role && !roles.includes(role)) return <Navigate to="/login" replace/>;
  return <Outlet/>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<AuthGate roles={["INDIVIDUAL_CLIENT","BUSINESS_OWNER","BUSINESS_STAFF"]} />}>
          <Route path="/me" element={<PersonalDashboard />} />
          <Route path="/business" element={<BusinessDashboard />} />
        </Route>

        <Route element={<AuthGate roles={["ADMIN","SUPER_ADMIN"]} />}>
          <Route path="/admin" element={<AdminHome />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
