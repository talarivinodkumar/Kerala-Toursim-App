import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Cherai from '../pages/Cherai';
import Hotels from '../pages/Hotels';
import Activities from '../pages/Activities';
import Packages from '../pages/Packages';
import Beaches from '../pages/Beaches';
import SafetyTips from '../pages/SafetyTips';
import MyBookings from '../pages/MyBookings';
import Payment from '../pages/Payment';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import AdminDashboard from '../pages/AdminDashboard';
import KeralaStateDashboard from '../pages/KeralaStateDashboard';
import DigitalIDLogin from '../pages/DigitalIDLogin';
import DigitalIDDashboard from '../pages/DigitalIDDashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../components/MainLayout';
const AppRoutes = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Digital ID / Portal Routes */}
            <Route path="/digital-id-login" element={<DigitalIDLogin />} />
            <Route path="/digital-id-dashboard" element={<DigitalIDDashboard />} />

            {/* Kerala State Monitoring Dashboard */}
            <Route path="/kerala-dashboard" element={<KeralaStateDashboard />} />

            {/* Application Routes with Navbar/Footer */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/cherai" element={<Cherai />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/beaches" element={<Beaches />} />
                <Route path="/safety-tips" element={<SafetyTips />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/my-bookings" element={<MyBookings />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/admin/crowd" element={<AdminDashboard />} />
                </Route>
            </Route>

            {/* Redirect any unknown route to home (which will redirect to login if not auth) */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;

