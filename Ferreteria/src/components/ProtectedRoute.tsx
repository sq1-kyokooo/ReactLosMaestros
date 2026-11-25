import React from 'react';
import {Navigate} from "react-router-dom";
import { useAuth0 } from '@auth0/auth0-react';
import type { User } from '../constants/mockUsers';

//Componente para proteger la ruta de administrador (localhost/admin)
interface ProtectedRouteProps{
    children:React.ReactNode;
    allowedRole?: 'admin' | 'normal';
}

// El rol se obtiene buscando el correo del usuario de Auth0 en la lista de usuarios
export function getRole(email?: string): User['rol'] {
    try {
        const users: User[] = JSON.parse(localStorage.getItem('users') ?? '[]');
        return users.find((u) => u.email === email)?.rol ?? 'normal';
    } catch {
        return 'normal';
    }
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
    const { isLoading, isAuthenticated, user } = useAuth0();

    if (isLoading) {
        return <p>Cargando...</p>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && getRole(user?.email) !== allowedRole) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
