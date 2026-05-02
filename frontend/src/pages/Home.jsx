import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '@assets/css/Home.css';

export default function Home() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div className="home-container">
            <aside className="home-sidebar">
                <div className="sidebar-logo">
                    <span className="logo-dot" />
                    <span className="logo-text">Mon App</span>
                </div>

                <nav className="sidebar-nav">
                    <a href="#" className="nav-item active">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                        </svg>
                        Tableau de bord
                    </a>
                    <a href="#" className="nav-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                        Profil
                    </a>
                    <a href="#" className="nav-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                        Paramètres
                    </a>
                </nav>

                <button onClick={handleLogout} className="logout-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Déconnexion
                </button>
            </aside>

            <main className="home-main">
                <header className="home-header">
                    <div>
                        <p className="header-greeting">Bonjour,</p>
                        <h1 className="header-name">{user?.name || 'Utilisateur'}</h1>
                    </div>
                    <div className="header-avatar">{initials}</div>
                </header>

                <section className="stats-row">
                    {[
                        { label: 'Projets', value: '12' },
                        { label: 'Tâches', value: '4' },
                        { label: 'Messages', value: '28' },
                    ].map(stat => (
                        <div className="stat-card" key={stat.label}>
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    ))}
                </section>

                <section className="info-card">
                    <h2 className="card-title">Informations du compte</h2>
                    <div className="info-list">
                        <div className="info-row">
                            <span className="info-key">Nom</span>
                            <span className="info-val">{user?.name || '—'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-key">Email</span>
                            <span className="info-val">{user?.email || '—'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-key">Membre depuis</span>
                            <span className="info-val">
                                {user?.created_at
                                    ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                                    : '—'}
                            </span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}