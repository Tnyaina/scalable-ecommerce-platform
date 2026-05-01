import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Bienvenue !</h1>
                <button onClick={handleLogout} className="logout-btn">
                    Déconnexion
                </button>
            </header>

            <main className="home-content">
                {user && (
                    <section className="user-info">
                        <h2>Profil utilisateur</h2>
                        <p><strong>Nom :</strong> {user.name || 'N/A'}</p>
                        <p><strong>Email :</strong> {user.email || 'N/A'}</p>
                        <p><strong>Membre depuis :</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}</p>
                    </section>
                )}

                <section className="main-content">
                    <h2>Contenu principal</h2>
                    <p>Bienvenue sur votre tableau de bord !</p>
                </section>
            </main>
        </div>
    );
}
