import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '@assets/css/Logout.css';

const Logout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            await logout();
            navigate('/login');
        };
        performLogout();
    }, [logout, navigate]);

    return (
        <div className="logout-screen">
            <div className="logout-card">
                <div className="logout-spinner">
                    <span />
                </div>
                <p className="logout-label">Déconnexion en cours…</p>
            </div>
        </div>
    );
};

export default Logout;