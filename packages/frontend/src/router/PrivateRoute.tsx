import { Navigate } from 'react-router-dom';
import { useUserQuery, usePermissions } from '@ticket-registrator/shared';
import type { PermissionType } from '@ticket-registrator/shared';

interface PrivateRouteProps {
    children: React.ReactNode;
    /** If provided, the user must have this permission to access the route. */
    permission?: PermissionType;
    /** Where to redirect when access is denied. Defaults to /home. */
    fallback?: string;
}

/**
 * Protects a route by:
 *   1. Redirecting to /login if no access token exists.
 *   2. Showing a loading state while the user data is being fetched.
 *   3. Redirecting to `fallback` if `permission` is specified and the user lacks it.
 *
 * Usage:
 *   <PrivateRoute>                            — auth only
 *   <PrivateRoute permission="view_roles">    — auth + permission
 */
export const PrivateRoute = ({ children, permission, fallback = '/home' }: PrivateRouteProps) => {
    const token = localStorage.getItem('access_token');
    const { data: user, isLoading } = useUserQuery();
    const { can } = usePermissions();

    if (!token) return <Navigate to="/login" replace />;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (permission && user && !can(permission)) {
        return <Navigate to={fallback} replace />;
    }

    return <>{children}</>;
};
