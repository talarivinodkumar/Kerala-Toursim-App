import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const ProtectedRoute = () => {
    const { user } = useContext(AppContext);

    // Check if user is logged in (either in context or local storage)
    // The AppContext initialization usually handles the localStorage check, 
    // but we can double check here or rely on the state.

    // If we rely purely on AppContext state which might be null on initial load before useEffect runs,
    // we might need to handle a "loading" state. 
    // However, for this simple app, we can check localStorage directly if state is null roughly.
    // Better yet, let's trust the AppContext state if it's initialized correctly.

    const storedUser = localStorage.getItem('userInfo');

    if (!user && !storedUser) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
