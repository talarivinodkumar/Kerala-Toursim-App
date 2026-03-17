import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const AdminRoute = () => {
    const { user } = useContext(AppContext);
    const storedUser = localStorage.getItem('userInfo');

    // Parse stored user if context is null but local storage exists
    const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (currentUser.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
