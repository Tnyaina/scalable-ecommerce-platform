import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Logout from '../pages/Logout';
import Home from '../pages/Home';

const AppRoutes = () => {
    const { token } = useAuth(); // On récupère le token depuis le contexte[cite: 1]

    return (
        <Routes>
            {/* Routes pour les invités */}
            {!token ? (
                <>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </>
            ) : (
                /* Routes pour les connectés */
                <>
                    <Route path="/" element={<Home />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </>
            )}
        </Routes>
    );
};

export default AppRoutes;