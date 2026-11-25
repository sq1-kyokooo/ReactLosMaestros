import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Auth0Context, initialContext, type Auth0ContextInterface } from '@auth0/auth0-react';
import ProtectedRoute, { getRole } from './ProtectedRoute';
import { mockUsers } from '../constants/mockUsers';

describe('ProtectedRoute', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('users', JSON.stringify(mockUsers));
    });

    const renderConAuth = (auth: Partial<Auth0ContextInterface>) =>
        render(
            <Auth0Context.Provider value={{ ...initialContext, ...auth } as Auth0ContextInterface}>
                <MemoryRouter initialEntries={['/admin']}>
                    <Routes>
                        <Route path="/" element={<p>Inicio</p>} />
                        <Route path="/login" element={<p>Pagina login</p>} />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute allowedRole="admin">
                                    <p>Panel admin</p>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            </Auth0Context.Provider>
        );

    it('muestra cargando mientras Auth0 inicia', () => {
        renderConAuth({ isLoading: true, isAuthenticated: false });

        expect(screen.getByText('Cargando...')).toBeTruthy();
    });

    it('redirige a /login si no hay sesión', () => {
        renderConAuth({ isLoading: false, isAuthenticated: false });

        expect(screen.getByText('Pagina login')).toBeTruthy();
    });

    it('redirige al inicio si el usuario no es admin', () => {
        renderConAuth({ isLoading: false, isAuthenticated: true, user: { email: 'cliente@correo.com' } });

        expect(screen.getByText('Inicio')).toBeTruthy();
    });

    it('muestra el contenido si el usuario es admin', () => {
        renderConAuth({ isLoading: false, isAuthenticated: true, user: { email: 'admin@losmaestros.cl' } });

        expect(screen.getByText('Panel admin')).toBeTruthy();
    });

    describe('getRole()', () => {
        it('devuelve el rol del usuario registrado', () => {
            expect(getRole('admin@losmaestros.cl')).toBe('admin');
        });

        it('devuelve normal si el correo no está registrado o falta', () => {
            expect(getRole('otro@correo.com')).toBe('normal');
            expect(getRole(undefined)).toBe('normal');
        });

        it('devuelve normal si la lista de usuarios está corrupta', () => {
            localStorage.setItem('users', '{json inválido');

            expect(getRole('admin@losmaestros.cl')).toBe('normal');
        });
    });
});
